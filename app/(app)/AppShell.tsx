"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";


const SECTION_ICONS: Record<string, React.ReactNode> = {
  vr: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h10a2 2 0 0 1 2 2v9H9l-4 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 5h6M8 12h4M18 8h3v11h-8"/>
    </svg>
  ),
  dm: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/>
      <path d="M7 5h10M6.5 6.5 11 17M17.5 6.5 13 17M9.5 11.5h5"/>
    </svg>
  ),
  qr: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2"/>
      <path d="M7 7h10M7 11h2M12 11h2M17 11v0M7 15h2M12 15h2M17 15v0M7 19h2M12 19h5"/>
    </svg>
  ),
  sjt: (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 19 6v5c0 4.7-2.8 8-7 10-4.2-2-7-5.3-7-10V6zM9 12l2 2 4-5"/>
      <circle cx="7" cy="7" r="1"/><circle cx="17" cy="7" r="1"/>
    </svg>
  ),
};

const NAV = [
  {
    id: "learn",
    label: "Learn",
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    sections: [
      { key: "vr", label: "Verbal Reasoning", color: "blue" },
      { key: "dm", label: "Decision Making", color: "purple" },
      { key: "qr", label: "Quantitative Reasoning", color: "green" },
      { key: "sjt", label: "Situational Judgement", color: "coral" },
    ],
    href: (key: string) => `/section/${key}`,
  },
  {
    id: "practice",
    label: "Practice",
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
    sections: [
      { key: "vr", label: "Verbal Reasoning", color: "blue" },
      { key: "dm", label: "Decision Making", color: "purple" },
      { key: "qr", label: "Quantitative Reasoning", color: "green" },
      { key: "sjt", label: "Situational Judgement", color: "coral" },
    ],
    href: (key: string) => `/practice/${key}`,
  },
  {
    id: "mocks",
    label: "Mocks",
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    sections: [],
    href: () => "/mocks",
  },
  {
    id: "blog",
    label: "Blog",
    icon: (
      <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    sections: [],
    href: () => "/blog",
  },
];

export default function AppShell({ children, user, testDate }: { children: React.ReactNode; user: User | null; testDate?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? (user.name ?? user.email ?? "U").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (pathname.startsWith("/practice")) setOpen("practice");
    else if (pathname.startsWith("/section") || pathname.startsWith("/guide")) setOpen("learn");
  }, [pathname]);

  const isCurrentNav = (id: string) => {
    if (id === "mocks") return pathname === "/mocks";
    if (id === "learn") return pathname.startsWith("/section") || pathname.startsWith("/guide");
    if (id === "practice") return pathname.startsWith("/practice");
    return false;
  };

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <Link href={user ? "/dashboard" : "/"} className="brand">
          <svg viewBox="0 0 48 32" aria-hidden="true">
            <path d="M2 18h9l4-13 7 24 6-18 5 7h13" />
          </svg>
          <span className="brand-text">Pulsemed</span>
        </Link>

        <nav className="sidebar-nav">
          <Link
            href={user ? "/dashboard" : "/"}
            className={`nav-main ${pathname === "/dashboard" || pathname === "/" ? "current" : ""}`}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span className="nav-label">Home</span>
          </Link>
          {NAV.map(nav => (
            <div key={nav.id}>
              {nav.sections.length > 0 ? (
                <>
                  <button
                    className={`nav-main ${open === nav.id ? "is-open" : ""} ${isCurrentNav(nav.id) ? "current" : ""}`}
                    onClick={() => !sidebarCollapsed && setOpen(open === nav.id ? null : nav.id)}
                  >
                    {nav.icon}
                    <span className="nav-label">{nav.label}</span>
                    <span className="chevron">›</span>
                  </button>
                  <div className={`nav-submenu ${open === nav.id && !sidebarCollapsed ? "expanded" : ""}`}>
                    {nav.sections.map(sec => (
                      <Link
                        key={sec.key}
                        href={nav.href(sec.key)}
                        className={`section-link ${pathname === nav.href(sec.key) ? "selected" : ""}`}
                      >
                        <span className={`section-mark ${sec.color}`}>
                          {SECTION_ICONS[sec.key]}
                        </span>
                        <span className="section-copy">
                          <strong>{sec.label}</strong>
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={nav.href("")}
                  className={`nav-main ${pathname === nav.href("") ? "current" : ""}`}
                >
                  {nav.icon}
                  <span className="nav-label">{nav.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarCollapsed
              ? <polyline points="9 18 15 12 9 6" />
              : <polyline points="15 18 9 12 15 6" />
            }
          </svg>
          <span className="nav-label">Collapse</span>
        </button>
      </aside>

      <main className="main-content">
        {children}
      </main>

<div ref={dropdownRef} className="profile-pill-container" style={{ position: "fixed", top: 24, right: 32, zIndex: 40 }}>
        {user ? (
          <>
            <button
              className="profile-pill"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
            >
              <span className="profile-avatar">{initials}</span>
              <span className="profile-pill-text">
                <strong>{user.name ?? user.email}</strong>
                <small style={{ color: "var(--blue)", fontWeight: 700 }}>
                  {testDate
                    ? new Date(testDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                    : "UCAT student"}
                </small>
              </span>
              <span className="profile-chevron">▾</span>
            </button>

            {dropdownOpen && (
              <div className="profile-dropdown">
                <button onClick={() => { setDropdownOpen(false); router.push("/settings"); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  Settings
                </button>
                <hr />
                <button className="danger" onClick={() => signOut({ callbackUrl: "/" })}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            )}
          </>
        ) : (
          <Link href="/auth/signin">
            <button className="guest-signin-btn">
              Sign in / Sign up →
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
