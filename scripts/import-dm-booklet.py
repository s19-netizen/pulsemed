#!/usr/bin/env python3
"""
Import DM questions from the rebuilt student booklet + mark scheme into Supabase.
Run: python3 scripts/import-dm-booklet.py
"""

import zipfile, re, json, sys, time
from xml.etree import ElementTree as ET
import urllib.request, urllib.error

BOOKLET    = '/Users/sawda/Downloads/UCAT Decision Making Practice Bank — Student Booklet & Mark Scheme (Rebuilt).docx'
MARKSCHEME = '/Users/sawda/Downloads/UCAT Decision Making — Full Mark Scheme & Walkthrough.txt'
ENV_FILE   = '/Users/sawda/Desktop/final app/pulsemed/.env.local'

# ── Env ──────────────────────────────────────────────────────────────────────
with open(ENV_FILE) as f:
    env = {}
    for line in f:
        line = line.strip()
        if '=' in line and not line.startswith('#'):
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip()

BASE = env['NEXT_PUBLIC_SUPABASE_URL'] + '/rest/v1'
KEY  = env['SUPABASE_SERVICE_ROLE_KEY']

def api(method, table, data=None, params=''):
    url = f'{BASE}/{table}{"?" + params if params else ""}'
    body = json.dumps(data).encode() if data is not None else None
    req  = urllib.request.Request(url, data=body, method=method)
    req.add_header('Content-Type',  'application/json')
    req.add_header('apikey',        KEY)
    req.add_header('Authorization', f'Bearer {KEY}')
    req.add_header('Prefer',        'return=representation')
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw else []
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        raise RuntimeError(f'{method} {table}: {e.code} {body[:200]}')

def delete(table, filter_str):
    url = f'{BASE}/{table}?{filter_str}'
    req = urllib.request.Request(url, method='DELETE')
    req.add_header('apikey',        KEY)
    req.add_header('Authorization', f'Bearer {KEY}')
    req.add_header('Prefer',        'count=exact')
    try:
        with urllib.request.urlopen(req) as r:
            cr = r.headers.get('Content-Range', '?/?')
            print(f'  cleared {table}: {cr.split("/")[-1]} rows')
    except urllib.error.HTTPError as e:
        print(f'  WARN DELETE {table}: {e.code}', e.read().decode()[:100])

def batch_insert(table, rows, size=50):
    if not rows:
        print(f'  {table}: 0 rows — skipped')
        return
    done = 0
    for i in range(0, len(rows), size):
        chunk = rows[i:i+size]
        api('POST', table, chunk)
        done += len(chunk)
        print(f'\r  {table}: {done}/{len(rows)}', end='', flush=True)
    print(' ✓')

# ── Docx parser ───────────────────────────────────────────────────────────────
NS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'

def cell_text(tc):
    return ' '.join(
        ''.join(r.text or '' for r in p.iter(NS+'t')).strip()
        for p in tc.iter(NS+'p')
    ).strip()

def para_text(p):
    return ''.join(r.text or '' for r in p.iter(NS+'t')).strip()

def parse_docx_blocks(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml')
    root = ET.fromstring(xml)
    body = root.find(f'.//{NS}body')
    blocks = []
    for child in body:
        tag = child.tag.split('}')[-1]
        if tag == 'p':
            t = para_text(child)
            if t:
                blocks.append({'type': 'para', 'text': t})
        elif tag == 'tbl':
            rows = []
            for tr in child.iter(NS+'tr'):
                row = [cell_text(tc) for tc in tr.iter(NS+'tc')]
                if any(c for c in row):
                    rows.append(row)
            if rows:
                blocks.append({'type': 'table', 'rows': rows})
    return blocks

# ── Section / question block splitter ─────────────────────────────────────────
SECTION_NAMES = [
    'Syllogisms',
    'Logical Puzzles',
    'Interpreting Information',
    'Venn Diagrams',
    'Arguments & Assumptions',
    'Probability',
]
DIFFICULTIES = ['Bronze', 'Silver', 'Gold', 'Diamond']

def is_section_heading(text):
    return (
        any(s in text for s in SECTION_NAMES)
        and any(d in text for d in DIFFICULTIES)
        and '—' in text
    )

def split_sections(blocks):
    """Return list of (section_name, difficulty, [blocks])."""
    result = []
    cur_name = cur_diff = None
    cur_blocks = []
    for b in blocks:
        if b['type'] == 'para' and is_section_heading(b['text']):
            if cur_name:
                result.append((cur_name, cur_diff, cur_blocks))
            text = b['text']
            cur_diff = next((d for d in DIFFICULTIES if d in text), 'Bronze')
            cur_name = next((s for s in SECTION_NAMES if s in text), text)
            cur_blocks = []
        else:
            cur_blocks.append(b)
    if cur_name:
        result.append((cur_name, cur_diff, cur_blocks))
    return result

def split_questions(blocks):
    """Split section blocks into per-question block lists."""
    qs = []
    cur = []
    for b in blocks:
        if b['type'] == 'para' and re.match(r'^Question\s+\d+$', b['text'].strip()):
            if cur:
                qs.append(cur)
            cur = [b]
        else:
            if cur:
                cur.append(b)
    if cur:
        qs.append(cur)
    return qs

# ── Difficulty helpers ────────────────────────────────────────────────────────
DIFF_ABBR = {'Bronze': 'BR', 'Silver': 'SI', 'Gold': 'GO', 'Diamond': 'DI'}
FAMILY_ABBR = {
    'Syllogisms': 'SYL',
    'Logical Puzzles': 'LOG',
    'Interpreting Information': 'INT',
    'Venn Diagrams': 'VEN',
    'Arguments & Assumptions': 'ARG',
    'Probability': 'PRB',
}

# ── Mark scheme parser ─────────────────────────────────────────────────────────
def parse_mark_scheme(path):
    """
    Returns dict keyed by (section_name, difficulty, q_num) →
      For YN-5: {'answers': ['Yes','No',...], 'walkthroughs': ['...','...',...]}
      For MCQ:  {'letter': 'C', 'walkthrough': '...'}
    """
    with open(path, encoding='utf-8') as f:
        lines = [l.rstrip('\n') for l in f]

    result = {}
    cur_section = cur_diff = None
    cur_q_num  = None
    cur_lines  = []
    cur_type   = None  # 'yn-syllogisms' | 'yn-interpreting' | 'mcq'

    # Map section header text → (section_name, type)
    SECTION_MAP = {
        'Syllogisms': ('Syllogisms', 'yn-syllogisms'),
        'Logical Puzzles': ('Logical Puzzles', 'mcq'),
        'Interpreting Information': ('Interpreting Information', 'yn-interpreting'),
        'Venn Diagrams': ('Venn Diagrams', 'mcq'),
        'Arguments & Assumptions': ('Arguments & Assumptions', 'mcq'),
        'Probability': ('Probability', 'mcq'),
    }

    def flush():
        nonlocal cur_q_num, cur_lines
        if cur_section and cur_q_num is not None and cur_lines:
            key = (cur_section, cur_diff, cur_q_num)
            result[key] = parse_ms_block(cur_lines, cur_type)
        cur_q_num = None
        cur_lines = []

    for line in lines:
        stripped = line.strip()

        # Section heading
        if any(s in stripped for s in SECTION_MAP) and any(d in stripped for d in DIFFICULTIES) and '—' in stripped:
            flush()
            cur_diff = next((d for d in DIFFICULTIES if d in stripped), 'Bronze')
            cur_section = next((v[0] for k, v in SECTION_MAP.items() if k in stripped), None)
            cur_type    = next((v[1] for k, v in SECTION_MAP.items() if k in stripped), 'mcq')
            cur_q_num   = None
            cur_lines   = []
            continue

        # Question divider
        if stripped.startswith('___'):
            flush()
            continue

        # Question header
        m = re.match(r'^Question\s+(\d+)\s*[—–-]', stripped)
        if m:
            flush()
            cur_q_num = int(m.group(1))
            cur_lines = []
            continue

        if cur_q_num is not None:
            cur_lines.append(line)

    flush()
    return result

def parse_ms_block(lines, block_type):
    if block_type == 'yn-syllogisms':
        answers = ['Yes'] * 5
        walkthroughs = [''] * 5
        cur_stmt = None
        wt_lines = []
        for line in lines:
            s = line.strip()
            # "Answer pattern: 1 Yes · 2 No · ..."
            m = re.match(r'Answer pattern:\s*(.+)', s)
            if m:
                parts = re.findall(r'\d+\s+(Yes|No)', m.group(1), re.IGNORECASE)
                for i, (yn,) in enumerate([(p,) for p in parts]):
                    if i < 5:
                        answers[i] = 'Yes' if yn.lower() == 'yes' else 'No'
                continue
            # Individual statement: "1. Some garden animals... — Yes"
            m2 = re.match(r'^(\d+)\.\s+.+—\s*(Yes|No)', s, re.IGNORECASE)
            if m2:
                if cur_stmt is not None and wt_lines:
                    walkthroughs[cur_stmt] = ' '.join(wt_lines).strip()
                cur_stmt = int(m2.group(1)) - 1
                wt_lines = []
                continue
            if cur_stmt is not None and s and not s.startswith('Build the logic') \
                    and not s.startswith('Answer pattern'):
                wt_lines.append(s)
        if cur_stmt is not None and wt_lines:
            walkthroughs[cur_stmt] = ' '.join(wt_lines).strip()
        return {'answers': answers, 'walkthroughs': walkthroughs}

    elif block_type == 'yn-interpreting':
        answers = ['Yes'] * 5
        walkthroughs = [''] * 5
        cur_stmt = None
        wt_lines = []
        for line in lines:
            s = line.strip()
            m = re.match(r'^\s*(\d+)\.\s+(YES|NO)\s*[—–-]', s, re.IGNORECASE)
            if m:
                if cur_stmt is not None and wt_lines:
                    walkthroughs[cur_stmt] = ' '.join(wt_lines).strip()
                cur_stmt = int(m.group(1)) - 1
                answers[cur_stmt] = 'Yes' if m.group(2).upper() == 'YES' else 'No'
                wt_lines = []
            elif cur_stmt is not None and s:
                wt_lines.append(s)
        if cur_stmt is not None and wt_lines:
            walkthroughs[cur_stmt] = ' '.join(wt_lines).strip()
        return {'answers': answers, 'walkthroughs': walkthroughs}

    else:  # mcq
        letter = 'A'
        wt_lines = []
        for line in lines:
            s = line.strip()
            m = re.match(r'^Answer:\s*([A-D])\s*[—–-]', s)
            if m:
                letter = m.group(1)
                # Rest of this line is start of walkthrough
                rest = re.sub(r'^Answer:\s*[A-D]\s*[—–-]\s*', '', s).strip()
                if rest:
                    wt_lines.append(rest)
                continue
            if s and not s.startswith('Option check') and not s.startswith('Method:'):
                # Include working + deduction lines
                clean = re.sub(r'^\s*[\*✓✕]\s*[A-D]\s*[✓✕]?\s*[—–-]?\s*', '', s)
                if clean:
                    wt_lines.append(clean)
        return {'letter': letter, 'walkthrough': '\n'.join(wt_lines).strip()}

# ── Question parsers ───────────────────────────────────────────────────────────

def title_from_blocks(q_blocks):
    return q_blocks[1]['text'] if len(q_blocks) > 1 and q_blocks[1]['type'] == 'para' else ''

def parse_syllogism(q_blocks, difficulty, q_num, ms):
    title = title_from_blocks(q_blocks)
    premises, statements = [], []
    mode = 'pre'
    for b in q_blocks[2:]:
        if b['type'] != 'para':
            continue
        t = b['text']
        if t == 'Premises':
            mode = 'premises'
            continue
        if 'For each statement' in t or 'For each conclusion' in t:
            mode = 'statements'
            continue
        if mode in ('pre', 'premises'):
            if t not in ('For each statement, select Yes or No.',):
                premises.append(t)
        elif mode == 'statements':
            stmt = re.sub(r'\s*Yes\s+No\s*$', '', t).strip()
            if stmt:
                statements.append(stmt)

    ms_data = ms.get(('Syllogisms', difficulty, q_num), {})
    answers      = ms_data.get('answers', ['Yes'] * 5)
    walkthroughs = ms_data.get('walkthroughs', [''] * 5)

    stimulus = '\n'.join(p for p in premises if p)
    set_id   = f'SYL-{DIFF_ABBR[difficulty]}-{q_num:04d}'

    return [
        {
            'id': f'{set_id}-{i+1}', 'set_id': set_id,
            'format': 'YN-5', 'family': 'Syllogisms', 'subtype': 'Syllogisms',
            'difficulty': difficulty, 'stimulus': stimulus, 'chart': None,
            'question': statements[i] if i < len(statements) else f'Statement {i+1}',
            'option_a': 'Yes', 'option_b': 'No',
            'correct_answer': answers[i] if i < len(answers) else 'Yes',
            'walkthrough': walkthroughs[i] if i < len(walkthroughs) else '',
            'time_sec': 60, 'visual_type': 'Text',
        }
        for i in range(5)
    ]

def parse_interpreting(q_blocks, difficulty, q_num, ms):
    title = title_from_blocks(q_blocks)
    desc_parts, rules, conclusions = [], [], []
    table = None
    mode  = 'desc'
    for b in q_blocks[2:]:
        if b['type'] == 'table':
            table = b['rows']
            mode  = 'after-table'
            continue
        t = b['text']
        if t == 'Selection rules':
            mode = 'rules'
            continue
        if 'For each conclusion' in t or 'For each statement' in t:
            mode = 'conclusions'
            continue
        if mode == 'desc':
            desc_parts.append(t)
        elif mode == 'rules' or mode == 'after-table':
            rules.append(t)
        elif mode == 'conclusions':
            stmt = re.sub(r'\s*Yes\s+No\s*$', '', t).strip()
            if stmt:
                conclusions.append(stmt)

    chart = None
    if table and len(table) >= 2:
        chart = {'type': 'table', 'headers': table[0], 'rows': table[1:]}

    ms_data = ms.get(('Interpreting Information', difficulty, q_num), {})
    answers      = ms_data.get('answers', ['Yes'] * 5)
    walkthroughs = ms_data.get('walkthroughs', [''] * 5)

    stimulus = '\n'.join(r for r in rules if r)
    set_id   = f'INT-{DIFF_ABBR[difficulty]}-{q_num:04d}'

    return [
        {
            'id': f'{set_id}-{i+1}', 'set_id': set_id,
            'format': 'YN-5', 'family': 'Interpreting Information',
            'subtype': 'Interpreting Information',
            'difficulty': difficulty, 'stimulus': stimulus, 'chart': chart,
            'question': conclusions[i] if i < len(conclusions) else f'Conclusion {i+1}',
            'option_a': 'Yes', 'option_b': 'No',
            'correct_answer': answers[i] if i < len(answers) else 'Yes',
            'walkthrough': walkthroughs[i] if i < len(walkthroughs) else '',
            'time_sec': 60, 'visual_type': 'Text',
        }
        for i in range(5)
    ]

def parse_mcq(q_blocks, section_name, difficulty, q_num, ms):
    title     = title_from_blocks(q_blocks)
    stim_parts, options = [], []
    question_text = ''
    mode = 'stim'

    for b in q_blocks[2:]:
        if b['type'] == 'table':
            stim_parts.append('[table data]')
            continue
        t = b['text']
        # A-D option lines
        m = re.match(r'^([A-D])\.\s+(.*)', t)
        if m:
            options.append(m.group(2).strip())
            continue
        # Explicit question phrases
        if (t.startswith('Which of the following')
                or t.startswith('How many')
                or t.startswith('What is')
                or 'must be true' in t
                or 'necessary assumption' in t.lower()):
            question_text = t
            continue
        # Label rows (Proposal / Evidence / Clues) → included in stimulus
        stim_parts.append(t)

    stimulus = '\n'.join(p for p in stim_parts
                         if p not in ('Proposal','Evidence','Clues','Working'))
    if not question_text:
        # Infer default question text by section
        if section_name == 'Arguments & Assumptions':
            question_text = 'Which of the following represents the strongest argument?'
        elif section_name == 'Logical Puzzles':
            question_text = 'Which of the following must be true?'
        elif section_name == 'Venn Diagrams':
            question_text = 'Choose the correct value.'
        elif section_name == 'Probability':
            question_text = 'Choose the correct probability.'
        else:
            question_text = title

    ms_data     = ms.get((section_name, difficulty, q_num), {})
    letter      = ms_data.get('letter', 'A').upper()
    walkthrough = ms_data.get('walkthrough', '')

    correct_idx = 'ABCD'.index(letter) if letter in 'ABCD' else 0
    # correct stored as lowercase letter for DM route compatibility
    correct_letter = letter.lower()

    return {
        'stimulus': stimulus.strip(),
        'question': question_text,
        'options': options,
        'correct': correct_letter,
        'explanations': {letter: walkthrough},
        'subtype': section_name,
        'difficulty': difficulty,
    }

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print('Parsing mark scheme...')
    ms = parse_mark_scheme(MARKSCHEME)
    print(f'  {len(ms)} question answers loaded')

    print('Parsing student booklet...')
    blocks   = parse_docx_blocks(BOOKLET)
    sections = split_sections(blocks)
    print(f'  {len(sections)} sections found: {[s[0]+"/"+s[1] for s in sections[:4]]}...')

    yn5_rows = []
    mcq_data = []  # list of (stimulus, question, options, correct, explanations, subtype, difficulty)

    for sec_name, difficulty, sec_blocks in sections:
        q_blocks_list = split_questions(sec_blocks)
        for q_blocks in q_blocks_list:
            if not q_blocks:
                continue
            m = re.match(r'^Question\s+(\d+)$', q_blocks[0]['text'].strip())
            if not m:
                continue
            q_num = int(m.group(1))

            if sec_name == 'Syllogisms':
                yn5_rows.extend(parse_syllogism(q_blocks, difficulty, q_num, ms))
            elif sec_name == 'Interpreting Information':
                yn5_rows.extend(parse_interpreting(q_blocks, difficulty, q_num, ms))
            else:
                mcq_data.append(parse_mcq(q_blocks, sec_name, difficulty, q_num, ms))

    print(f'\n  YN-5 rows: {len(yn5_rows)}')
    print(f'  MCQ questions: {len(mcq_data)}')

    # ── Clear existing DM data ────────────────────────────────────────────────
    print('\n=== Clearing existing DM questions ===')
    delete('dm_questions',  'id=not.is.null')
    delete('admin_qs',      'section=eq.dm')
    delete('admin_passages','section=eq.dm')

    # ── Insert YN-5 rows ─────────────────────────────────────────────────────
    print('\n=== Inserting YN-5 questions ===')
    batch_insert('dm_questions', yn5_rows)

    # ── Insert MCQ questions ──────────────────────────────────────────────────
    print('\n=== Inserting MCQ questions ===')
    done = 0
    for mcq in mcq_data:
        passage = api('POST', 'admin_passages', {
            'section': 'dm',
            'content': mcq['stimulus'],
            'chart': None,
        })
        if isinstance(passage, list):
            passage = passage[0]
        pid = passage.get('id')
        if not pid:
            print(f'  WARN: no passage id for {mcq["subtype"]}')
            continue

        api('POST', 'admin_qs', {
            'section':       'dm',
            'passage_id':    pid,
            'question_text': mcq['question'],
            'options':       mcq['options'],
            'correct':       mcq['correct'],
            'explanations':  mcq['explanations'],
            'subtype':       mcq['subtype'],
            'difficulty':    mcq['difficulty'],
            'sort_order':    0,
        })
        done += 1
        print(f'\r  MCQ inserted: {done}/{len(mcq_data)}', end='', flush=True)
    print(' ✓')

    print('\n✓ DM import complete.')
    print(f'  {len(yn5_rows)} YN-5 rows + {done} MCQ questions')

if __name__ == '__main__':
    main()
