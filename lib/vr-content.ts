export type Step = {
  label: string;
  body: string;
  highlight?: string | string[];
};

export type WorkedQ = {
  format?: "tf" | "mcq";
  question: string;
  passage?: string;
  opts?: string[];
  cor?: number;
  steps: Step[];
  answer: string;
  answerNote: string;
  trap?: string;
};

export type PracticeQ = {
  passage: string;
  question: string;
  opts: string[];
  cor: number;
  explanation: string;
};

export type VRSubtype = {
  key: string;
  label: string;
  formats: ("tf" | "mcq")[];
  tagline: string;
  whatItTests?: string;
  howToIdentify?: string;
  method?: { title: string; body: string }[];
  traps?: string[];
  shortcut?: string;
  rules?: { title: string; body: string }[];
  errors?: string[];
  passage: string;
  workedQs: WorkedQ[];
  practice: PracticeQ[];
};

// ─── PASSAGES ────────────────────────────────────────────────────────────────

const LIGHTHOUSE = `Marrow Point lighthouse was converted from resident operation to remote control after engineers found that its ageing clockwork lens could no longer be repaired reliably. The conversion did not remove the original mechanism. Conservators disconnected it, cleaned it and left it inside the lantern room so that supervised visitors could still see how the light had once rotated. A smaller electric drive now turns the active lens.

Before the changeover, technicians ran the new system for twelve weeks while the lighthouse keepers continued operating the main light. Weather and power data were transmitted to the harbour authority's control room in Bellhaven, where staff compared the electronic readings with the keepers' written records. Two faulty wind sensors were replaced during this period. The remote system became responsible for the light only after the harbour authority completed a separate emergency-power test.

The keepers' cottages have since become a small maritime museum. One former keeper works there as a guide, but the harbour authority has retained responsibility for maintaining the light. Museum staff may report a fault, but they cannot alter the lens speed or switch the emergency beacon on. Those functions remain restricted to authorised control-room staff.

The fog signal is managed separately. It is activated automatically by a visibility sensor near the harbour entrance, although control-room staff can override it after receiving a verified report from a vessel or the coastguard.`;

const WESTFORD_FRIDGE = `The Westford Community Fridge receives surplus food from supermarkets, cafés and allotment holders. Supermarket collections take place on weekday evenings, while cafés arrange collections only when they have suitable food available. Allotment growers normally deliver produce themselves. The project does not accept opened packages, food that requires reheating before it can be checked or items past their use-by date.

Volunteers record the type of food received but do not weigh every individual item. Chilled products are placed in a temperature-monitored refrigerator and must be collected by the following afternoon. Bread, sealed dry goods and most whole vegetables can remain for longer. Visitors do not need to prove financial hardship, although each person may take no more than two chilled items during a single visit when supplies are limited.

An evaluation reported that the fridge redistributed an estimated 18 tonnes of food in its second year. This estimate was calculated from sample weights collected during four monitoring weeks, not from continuous weighing. The evaluation also found that evening opening attracted more working visitors, but it did not record the occupations of everyone using the service. Funding for rent came from the council, whereas electricity costs were paid by local donations.

The evaluation recommended adding Saturday collections from allotments during the summer. It did not recommend weekend supermarket rounds because managers at the participating stores had not agreed to provide staff for them.`;

const BRONZE_SCULPTURE = `When the bronze sculpture outside Alderwick Station developed green streaks, the transport authority initially assumed that ordinary weathering was responsible. A conservation survey found that rainwater was running across residues left by an unsuitable cleaning product. The chemical reaction had altered the surface colour but had not weakened the internal supporting frame.

The authority appointed a team led by conservator Nisha Vale. The team tested three cleaning mixtures on small areas hidden beneath the sculpture's base. The mildest mixture removed too little residue, while the strongest changed the appearance of the surrounding patina. The intermediate treatment was therefore applied in short stages. After each stage, the surface was photographed under consistent lighting before work continued.

The sculpture remained in place throughout the treatment, but a temporary screen prevented passengers from approaching it. The screen also carried an explanation of the work and invited the public to submit photographs showing the sculpture in earlier decades. More than 300 images were received, though only photographs with reliable dates were used to help reconstruct changes in colour. The authority plans to repeat a surface inspection every two years. It has not committed to repeating the cleaning treatment on a fixed schedule.

Vale presented the test results at a public meeting before the full treatment began. The account of that meeting records questions about cost and public access, but it contains no biographical information about any member of the conservation team.`;

const RILLMOUTH = `In 2023, the town of Rillmouth installed six tidal turbines inside an existing flood barrier. During the first winter, sediment repeatedly obstructed two turbines, so only four generated electricity throughout the whole season. Together, the turbines supplied electricity equivalent to 11% of the power used by municipal buildings. The electricity was sold into the regional grid, and the council allocated the revenue to maintenance of the flood barrier rather than to household energy subsidies.

Noise was measured at three points along the shore. Average readings did not rise after installation, although short peaks occurred while maintenance vessels were operating. The report did not record whether those peaks could be heard inside nearby homes. Fish surveys found fewer juvenile salmon at one upstream site than in the previous year. The estuary authority stated that a single year of observations could not establish the reason for the change.

The council approved a second year of environmental monitoring but postponed any decision about installing further turbines until 2026. Under the project contract, the manufacturer will maintain the turbines for five years. Responsibility will then transfer to a locally trained engineering team.`;

const WILDLIFE_BRIDGE = `The first monitoring report for the Glen Ardin wildlife bridge covered the eighteen months after it opened above a six-lane road. Motion-sensitive cameras recorded animals entering and leaving the planted structure. Because cameras could not identify every individual, the report counted crossing events rather than the number of animals that crossed. A single deer returning later could therefore appear more than once.

Red deer produced the largest number of recorded events, followed by foxes and badgers. Pine martens were photographed on four occasions, all during the final six months. No wildcats were recorded. Ecologists warned that this did not prove wildcats were absent from the surrounding woodland: the species is scarce, and camera coverage did not extend beyond the bridge entrances.

Young trees on the bridge suffered in an unusually dry summer, so contractors installed temporary watering pipes. The central strip remained open while this work took place, although two narrow side paths were fenced for three weeks. Traffic below continued throughout.

Tracks found in sand plots broadly supported the camera records, but heavy rain sometimes erased prints before weekly inspections. The project team will add acoustic detectors because cameras and tracks are less suitable for bats. It has not yet assessed whether the bridge reduced animal–vehicle collisions; police and road-maintenance records are still being matched to a comparable section of road.`;

const ARCFIELD = `Arcfield's public seed library began in 2018 with collections in twelve library branches. Members take packets without charge and are invited to return seeds saved from the plants they grow. Returning seeds is encouraged but is not a condition of borrowing. The network purchases reliable common varieties to maintain a stable basic supply, while local growers provide many of the less common varieties.

In 2024, the collection distributed 8,600 packets. Vegetables accounted for 64% of these, flowers for 21% and herbs for the remainder. Seeds returned by members replaced 31% of the packets borrowed that year. All newly received seed is kept initially in a cold room at the central branch. Every January, staff test a sample from each stored batch. Batches with germination below 70% are removed from borrowing stock and used in seed-identification workshops.

A programme delivered through primary schools produced 18% of the network's new adult memberships in 2024. The schools did not store or distribute seed themselves; families collected packets from ordinary branches. Plans to add two mobile seed-library vans were delayed when the original insurer withdrew cover. The network now expects the vans to begin operating in spring 2027.`;

const LINT_FILTER = `A housing association tested lint filters on washing machines in two apartment blocks after fibres were detected in wastewater leaving the buildings. Residents in one block received removable filters and instructions for cleaning them after every five washes. The second block continued using unmodified machines. The association did not require residents to change detergent, temperature or washing frequency.

After four months, samples from the filtered block contained fewer synthetic fibres on average. However, researchers could not match wastewater samples to particular flats, and several residents admitted that they had sometimes forgotten to clean the filters. Maintenance staff also reported that heavily blocked filters slowed drainage but did not damage the machines during the trial.

The association decided to extend the project. Rather than asking residents to purchase filters, it included them in the standard equipment supplied to newly renovated flats. Its report noted that the filters would produce little benefit if they were not cleaned and recommended designing a warning light for future models. The report did not claim that filters capture every fibre or that the trial established how much fibre eventually reaches rivers.

Residents who had taken part in the trial were allowed to keep their filters without charge. The association also arranged for caretakers to demonstrate cleaning during building-inspection visits, instead of relying solely on the original written instructions.`;

const PENMERE_BUS = `The village of Penmere replaced its first-come, first-served community bus with a telephone reservation system. Under the former arrangement, passengers waited at marked stops and the driver followed a fixed circuit. Seats were frequently empty on the northern part of the route, while passengers near the health centre were sometimes left behind when the bus arrived full.

The new system allowed passengers to request collection from any of sixteen designated points. The driver received the next day's route each evening. During the first three months, the total number of passenger journeys increased, and fewer journeys operated with no passengers. However, several older residents reported difficulty reaching the booking line during its limited opening hours.

The parish council responded by keeping telephone reservations but adding a paper request form at the pharmacy and asking the line operator to return unanswered calls. It rejected a proposal to restore the former fixed circuit every morning. Councillors said that the flexible route was reducing empty mileage, although they accepted that the method of booking required improvement. No online-only booking system was proposed.

Drivers reported that the daily route sheets were initially difficult to read when several requests used the same collection point. The council changed the layout of the sheets, but it did not treat this operational issue as a reason to abandon flexible routing.`;

const HARBOROUGH_THEATRE = `Harborough Theatre introduced captioned performances on one evening of each production. Captions were displayed on two screens beside the stage rather than above it, because the building's listed ceiling could not support new equipment. Audience members could request seats with the clearest view of a screen, but those seats were not reserved exclusively for people who used captions.

Ticket sales for the captioned evenings were similar to sales on other weekdays. A voluntary survey found that some caption users had previously avoided live theatre, while others were regular visitors who welcomed a wider choice of dates. The survey was available only by email and was completed by fewer than one third of ticket holders.

Following the trial, the theatre added a second captioned performance to productions lasting more than three weeks. It also began investigating individual caption devices after some audience members reported that looking between the stage and side screens was tiring. The theatre has not decided whether such devices would replace the screens or operate alongside them. Costs, sightlines and the reliability of the wireless system are still being assessed.

The theatre also trained front-of-house staff to explain where the screens could be seen most clearly. It did not ask customers to state whether they were deaf or hard of hearing when booking those seats, because the seats remained available to everyone.`;

const LENTON_MUSEUM = `For six months, Lenton Museum removed its admission charge on Thursday evenings and added talks, live music and late café opening. Attendance on those evenings was twice the figure recorded on Thursdays during the same months of the previous year. Daytime attendance remained broadly unchanged. In an exit survey, 62% of respondents said it was their first visit to Lenton Museum, but only two out of every five visitors completed the survey.

Three nearby cafés extended their opening hours after the programme's third month. Their owners were not interviewed, and no sales information was collected from them. The museum shop's total revenue rose by 8% compared with the previous Thursday evenings, even though the average amount spent per transaction fell. The number of recorded security incidents remained unchanged despite the increase in visitors.

The funding board renewed the programme for one year. Its report warned that free admission and the new events had begun together, so the evaluation could not show which element was responsible for the increased attendance. The report also noted that the response rate made the visitor survey less reliable as a description of the entire audience.`;

const MARKET_LAYOUT = `The indoor market at Norleigh tested a new layout for eight Saturdays. Previously, fruit and vegetable stalls occupied the central aisle, while prepared-food sellers were grouped beside the entrance. Under the trial, prepared-food stalls moved to the centre and produce sellers were distributed around the outer walls. Stall numbers and opening hours did not change.

Door counters recorded almost the same total number of visitors as during the corresponding eight Saturdays of the previous year. Average time inside the market rose by seven minutes. Prepared-food sellers collectively reported higher sales, although two said the central aisle became congested at lunchtime. Produce sellers reported little change in total revenue, but several sold a greater share of their stock late in the day and reduced the amount discarded.

Visitors completing an exit survey were more likely than the previous year's respondents to say they had explored parts of the market they had not intended to visit. The survey samples were similar in size, but participation was voluntary. Researchers could not track individual routes because the market rejected phone-location monitoring on privacy grounds.

After the trial, managers retained the central prepared-food area but widened one passage by removing three promotional stands. They did not claim that the layout alone caused every change: unusually wet weather may have encouraged visitors to remain indoors, and a local food festival operated nearby on two trial Saturdays. Nevertheless, stallholders voted by a clear majority to continue the arrangement.`;

const RAVEL_ARCHIVE = `Ravel Archive is digitising handwritten court casebooks from the nineteenth century. Conventional optical-character recognition performed poorly on the handwriting, so the archive trained a specialist model using 2,000 pages that had already been transcribed by experts. On a separate test set of 300 pages, the specialist model reproduced 87% of words correctly, compared with 61% for the conventional software. Personal names and dates remained among its most frequent errors.

Volunteers were asked to correct the model's transcripts before publication. They worked quickly when errors produced obviously broken words, but some inaccurate names remained unnoticed when the surrounding sentence appeared fluent. The archive therefore decided that the public website would display the original page beside every transcript and visually mark words assigned low confidence by the model.

The model made the collection easier to search, and researchers found references that had previously been difficult to locate. However, historians warned that surviving casebooks do not record every dispute and that poorer residents were less likely to appear in formal proceedings. They argued that the digitised collection could reveal patterns within recorded cases but should not be treated as a complete picture of conflict in the town.`;

const SEEDBANKS = `Modern agriculture relies heavily on a relatively small number of crop varieties. These varieties often produce high yields, but dependence on them can make food systems vulnerable. A disease capable of damaging one widely planted variety may affect farms across several regions.

Seed banks attempt to reduce this risk by storing seeds from numerous cultivated and wild plants. The seeds are dried and kept at low temperatures, slowing the biological processes that cause them to deteriorate. Researchers periodically test samples to determine whether they can still germinate.

Seed banks are not merely emergency warehouses. Plant breeders use stored material to search for useful characteristics, including resistance to disease, drought or salty soil. A commercial variety may produce more food under ordinary conditions, while an older variety may possess a trait that becomes valuable when conditions change.

However, storage has limitations. Seeds from some plants do not survive conventional drying and freezing. Stored seeds must also be monitored, grown and replaced when their ability to germinate declines. This requires money and specialist knowledge. Conservationists therefore argue that seed banks should complement rather than replace the protection of plants in natural habitats and on farms. Living populations continue to reproduce and adapt, while seeds inside storage facilities do not. Maintaining crop diversity requires several methods rather than reliance on a single solution.`;

const SEED_DISPERSAL = `For decades, botanists used adhesive traps and observations of feeding animals to study how seeds travelled away from parent plants. These methods revealed much, but each captured only part of the process. Traps showed where airborne seeds landed within a limited area; animal observations showed what was eaten, not necessarily where intact seeds were later deposited.

A recent project added tiny fluorescent markers to seeds from five woodland plants. At night, researchers used ultraviolet lamps to locate marked seeds on the ground and in animal droppings. The method followed movement across a wider area than fixed traps, yet it also had limits. Markers occasionally detached, searching was easier on bare soil than among dense leaves, and the smallest seeds could not carry the label without affecting their movement.

The results challenged a simple division between wind-dispersed and animal-dispersed plants. Some seeds normally classified as wind-dispersed were moved again by mice after landing, while rainwater carried others along shallow channels. The researchers argue that dispersal often occurs in stages and that a seed's final position may reflect several agents.

They do not propose abandoning older techniques. Instead, they recommend combining marked-seed searches with traps, cameras and genetic analysis of seedlings. Each method corrects a different blind spot. The project's chief contribution is therefore not a complete map of every seed's journey, but a clearer picture of why conclusions based on a single observation method can be misleading.`;

const SEABREAK = `On the island of Seabreak, letters once arrived whenever a trading vessel happened to call. In the nineteenth century, the harbourmaster began keeping incoming mail in a locked chest and announcing each delivery by raising a blue flag. Residents from distant farms might not see the flag for several days, so shopkeepers travelling inland carried lists of names for whom letters were waiting.

Later, a scheduled steamship service made arrivals more predictable. The island council hired two part-time messengers, but they delivered only to villages on the main road. Families elsewhere collected mail from shops, exchanged it after weekly worship or asked schoolchildren to carry it home. These informal routes were not peripheral accidents; for many residents, they were the actual postal system.

When motor vehicles reached Seabreak, the official service expanded. Histories often present this change as the moment the island finally obtained a modern network. Surviving diaries suggest a more complicated transition. Some households received letters faster, while others lost convenient collection points when shops ceased acting as intermediaries. The blue flag also remained in use for parcels too large for ordinary delivery.

The history of Seabreak's post is therefore not simply a story of irregular arrangements being replaced by an efficient public service. Formal transport mattered, but its effects depended on local habits that had long connected harbour, shops, schools and homes.`;

const REPAIR_SCHEME = `At monthly repair sessions in Dunford, volunteers help residents diagnose faults in lamps, radios, clothing and small appliances. The organisers report the number of items made usable before each session ends, but they avoid calling every other item a failure. Some owners learn which replacement part to order and complete the repair later; others decide, with better information, that an unsafe or inefficient device should be recycled.

The sessions are sometimes described as a waste-reduction scheme. That is one aim, and organisers weigh items kept out of disposal bins. Yet the figures are estimates: they cannot know how long a repaired toaster will remain in use or whether its owner would otherwise have discarded it. Nor does the recorded weight reflect the environmental cost of replacement parts or journeys to the venue.

Participants also value the exchange of skills. A person who arrives with a torn coat may learn a stitching technique and later use it on other clothes. Volunteers, meanwhile, encounter unfamiliar designs and share solutions with one another. These effects are difficult to express as a simple total.

The scheme's significance therefore lies partly in measurable repairs and partly in less visible changes to knowledge and confidence. Counting repaired objects remains useful, but treating that number as a complete verdict would misunderstand what the sessions are designed to achieve.`;

const REDCOMBE = `Redcombe sought recognition as a dark-sky town after local astronomers recorded that the faintest visible stars had become harder to see. The council replaced several street lamps with shielded fittings, required illuminated shop signs to switch off after midnight and offered households advice on directing outdoor lights downward. Main roads and locations identified by emergency services were exempt from some changes.

The tourism board began advertising winter stargazing weekends. Accommodation bookings during the quieter months subsequently rose, but a new rail service and a food festival were introduced in the same year. The tourism board welcomed the figures, whereas the council's evaluation said that the separate contribution of the lighting policy could not yet be measured.

The policy also attracted attention from ecologists. In parks where upward light fell most sharply, observers recorded increased activity among two moth species. They did not claim that all nocturnal wildlife had recovered. Some residents, meanwhile, worried that darker streets would feel less safe. Recorded pedestrian incidents did not rise during the first year, although police cautioned that one year provided too little evidence to settle the question.

Several small businesses supported the environmental aims but said replacing signs sooner than planned created an unexpected cost. In response, the council increased the size of its replacement grants while keeping the lighting standards. The debate in Redcombe has therefore moved beyond whether darkness is desirable. It now concerns how confidently different benefits can be attributed to the policy and how the costs of achieving them should be shared.`;

const PEDESTRIAN = `Riverton Council is considering preventing private cars from entering Market Street between 10 a.m. and 6 p.m. Buses, emergency vehicles and delivery vans with permits would still be allowed.

Transport planner Leila Morris supports the proposal. She argues that Market Street is narrow and that reducing traffic would make it safer for pedestrians. However, she believes the council must increase the frequency of buses before introducing the restriction. Otherwise, people without easy access to public transport may struggle to reach the town centre.

Shop owner Daniel Price opposes the current proposal. He fears that customers will visit retail parks where parking is easier. He accepts that the street is unpleasantly congested on Saturdays, but would prefer restrictions to apply only at weekends during the summer.

Dr Sanjay Rao, who led an air-quality study in Riverton, takes a more cautious position. His team found that pollution on Market Street was highest during busy traffic periods. Nevertheless, he warns that pedestrianisation may redirect cars to neighbouring roads rather than remove the journeys entirely. He supports a six-month trial accompanied by pollution monitoring across the surrounding area. The council has not yet made a final decision. It intends to consult residents before voting on the proposal.`;

const WIND_FARM = `Plans for a wind farm on Ravel Moor have prompted an archaeological survey of land usually crossed only by sheep tracks. The developers funded the work because turbine foundations and access roads could disturb buried remains. Critics have therefore dismissed the survey as little more than a box-ticking exercise attached to construction.

That judgement is too simple. Trial trenches have uncovered hearths, fragments of pottery and a line of postholes suggesting repeated seasonal occupation. None is spectacular in isolation, but together they revise the view that the high moor was avoided until recent centuries. The survey team has also published its methods and deposited samples with the regional museum, allowing other researchers to reassess its conclusions.

This does not mean the development poses no archaeological cost. Only a fraction of the site can be excavated, and redesigning a road protects one group of remains by shifting disturbance elsewhere. Digital records cannot fully replace material left undisturbed in its setting. Nor should funding by a developer make scrutiny unnecessary.

Yet refusing to learn from work undertaken before construction would protect nothing. The proper response is to demand transparent methods, independent review and changes to the plan where evidence justifies them. Development-led archaeology is an uneasy compromise, but in this case it has already transformed knowledge of the moor.`;

const OPEN_TEXTBOOKS = `Universities are increasingly adopting textbooks that anyone may read online without payment and that lecturers may adapt under an open licence. Supporters sometimes describe this as an uncomplicated victory: students save money, while teachers gain freedom to tailor material. Both benefits are real, but neither guarantees a good book.

An openly licensed chapter can be inaccurate or poorly organised just as a commercial one can. More subtly, constant local adaptation may fragment a course if several lecturers change definitions or notation independently. Institutions that celebrate removing the purchase price must therefore fund editing, accessibility checks and version control. "Free to the student" does not mean "free to produce".

Commercial publishers argue that established review processes already supply these services. Often they do, although high prices do not prove that every title has been rigorously maintained. Nor is publisher control the only way to coordinate revision. Some open-textbook projects publish named reviews, keep transparent change logs and appoint an editorial board. These arrangements deserve judgement by their results rather than by the licence alone.

The strongest case for open textbooks is not that openness automatically creates quality. It is that openness permits institutions to build quality while widening access—provided they accept the labour and accountability that serious publishing requires.`;

const POETRY_TRANSLATION = `A new software system produces draft translations of poems by comparing thousands of multilingual texts. Its creators emphasise speed: a page that once occupied a translator for hours appears in seconds. Demonstrations are impressive when the source poem uses regular syntax and familiar imagery. Difficulties emerge when a word carries historical associations or when a line's rhythm alters the emotional force of an otherwise ordinary phrase.

Some reviewers respond that machines can never translate poetry and should be excluded from the process. That reaction grants the system more authority than it deserves. A draft is not a verdict. Used carefully, rapid alternatives can reveal choices a translator had not considered, much as a rhyming dictionary or corpus search can. The danger begins when convenience disguises unresolved decisions.

Publishers should therefore identify machine-assisted translations and retain a human translator who can explain major choices. This is not merely a demand for correction after the machine has acted. Selecting, rejecting and reshaping alternatives is itself translation. Readers may reasonably wish to know who took responsibility for those decisions.

The software's speed is neither meaningless nor sufficient. It may become a useful instrument, especially for comparing possible literal readings, but claims that it has solved poetic translation confuse the generation of fluent sentences with the interpretation of a poem.`;

const WEXFORD_MUSEUM = `The Wexford Museum has begun using a recommendation system on handheld visitor guides. After a visitor selects an object, the system suggests three others using links such as period, material or theme. The museum director calls the project a way to "democratise discovery", arguing that visitors need not follow routes chosen entirely by curators.

That ambition is appealing, but the language of democratisation gets ahead of the evidence. During the trial, many visitors entered galleries they had not originally planned to see. Yet the system could recommend only objects with detailed digital records, and these were disproportionately drawn from collections already popular with researchers. A tool intended to widen attention may therefore reproduce older decisions about which objects deserved cataloguing.

One curator has warned that recommendation systems turn cultural exploration into a contest for clicks. That concern is not trivial, although it assumes that visitors previously wandered free from influence. Labels, gallery layout and printed trails have always directed attention. The relevant question is not whether guidance exists, but whether its operation can be examined and challenged.

The museum should continue the experiment, provided it publishes how recommendations are generated, expands the records for neglected collections and checks whether suggestions become more concentrated over time. An algorithm is neither a neutral window nor an invading curator. It is another editorial instrument, and it should be treated with the same scrutiny as any other.`;

const MARSHVOLE = `Conservationists have begun reintroducing marsh voles to the Ellerton wetlands after the local population disappeared almost thirty years ago. The first release involved only forty animals. Researchers described this as a tentative beginning rather than evidence that the species had been permanently restored.

The voles were released into two fenced areas containing dense vegetation. The fences were not intended to confine the animals indefinitely. Instead, they provided a temporary buffer against foxes while the voles became familiar with the habitat. Small openings would gradually be added if monitoring showed that the population was stable.

Initial observations were encouraging. Most of the voles constructed nests, and several females produced young. However, heavy rain flooded part of one release area. The project team responded by creating raised banks and additional shelter.

The restoration has also required cooperation from nearby farmers. Marsh voles feed on plants beside drainage channels, so the farmers agreed to leave wider strips of vegetation uncut. In return, the project supplied advice on managing waterlogged ground. Researchers emphasised that one successful breeding season would not be sufficient. The population must survive several winters and develop enough genetic diversity before the reintroduction can be considered secure.`;

const POTTERY = `The Redbank pottery collective shares two electric kilns among fourteen makers. Clay can be shaped and dried at each maker's own studio, but every finished piece must pass through a bisque firing and, after glazing, a second firing. Members book kiln space by volume rather than by number of objects, because a single large bowl may occupy as much room as several cups.

During the winter exhibition period, the kilns became the collective's bottleneck. Demand for firing rose sharply, while the time required for each firing cycle remained fixed. Shelves of dry work accumulated even though members were producing no faster than usual. Extending studio opening hours did not help because the kilns already operated whenever electricity prices and safety supervision allowed.

The collective considered buying a third kiln. However, the workshop's electrical supply would need upgrading, and the landlord would not permit structural work until the lease was renewed. Members instead introduced a shared calendar, minimum spacing rules and a small charge for bookings cancelled too late to refill. They also grouped glazes requiring the same firing temperature.

Waiting times fell, although they did not disappear before the exhibition. The experience showed that the apparent shortage was not simply a lack of equipment: unused gaps and incompatible firing plans had reduced the capacity of the kilns they already possessed.`;

const SHADOW_ARCHIVE = `When radio producer Mara Venn died, her family donated hundreds of labelled interview tapes to the Haversham Sound Museum. Researchers soon discovered a shadow archive alongside them: unlabelled cassettes kept in kitchen drawers, rehearsal recordings held by musicians and copies exchanged privately among former colleagues.

The phrase does not imply secrecy in every case. Some tapes had simply been overlooked when the formal collection was assembled. Others remained outside the museum because contributors were uncertain who owned the performances or because conversations included people who had never agreed to public access. The scattered recordings sometimes preserve fuller versions of interviews that Venn edited for broadcast, but they also contain duplicated or poorly dated material.

Museum staff are creating a voluntary register describing what exists and where it is held. Owners may list a recording without surrendering it or making it immediately available. Where permission is clear, the museum can produce a preservation copy. Where rights are disputed, the register records the issue without placing audio online.

Researchers welcome the possibility of connecting related fragments, yet the project resists treating private possession as a problem to be overcome. The shadow archive is valuable precisely because it reveals how much cultural memory survives outside official catalogues; acknowledging it also means respecting the different obligations attached to those recordings.`;

const STONEBRIDGE = `The annual Stonebridge supper is advertised as a revival of a medieval meal, yet its menu has never been fixed. Early accounts mention oat cakes, river fish and a spiced fruit dish. When pollution reduced local fish stocks, organisers substituted smoked herring brought from the coast. Later, vegetarian households replaced the fish with baked roots while keeping the same herb sauce.

For historian Laleh Morris, this elasticity does not make the supper fraudulent. Traditions may preserve a sequence, a social role or a method of preparation even when ingredients change. At Stonebridge, neighbours still cook in shared ovens, carry dishes to the hall in procession and reserve the first portion for the oldest resident. Those practices connect current participants with descriptions written centuries ago.

Others argue that the medieval label is misleading because tomatoes now appear in the fruit dish and the event uses modern fundraising to cover costs. Morris agrees that organisers should not pretend every element is ancient. She nevertheless distinguishes honest adaptation from careless invention: programmes now state when an ingredient entered the menu and why.

The supper's continuity therefore rests neither on perfect replication nor on unlimited change. It depends on recognising which features the community has chosen to preserve and making alterations visible rather than disguising them as originals.`;

const EXPLORERS_NOTEBOOKS = `For many years, historians treated explorers' field notebooks as little more than preliminary scraps: untidy stages on the way to polished reports. A new digitisation project has challenged that hierarchy. The notebooks record crossed-out identifications, uncertain measurements and questions that disappeared from the published accounts. As the project editor observes, "The messy page is not a failed final report; it preserves roads not taken."

Digitisation allows readers to enlarge faint pencil marks and compare notebooks held in distant collections. Yet the search interface can also flatten a page. A user who retrieves only the lines containing a particular plant name may miss the sketch beside them, the change of ink halfway down the page or a later note contradicting the first observation.

The notebooks therefore gain currency as searchable sources at the same moment that their physical arrangement becomes easier to overlook. To address this, the project displays each transcription beside an image of the complete page and allows users to move through neighbouring pages rather than viewing isolated search results. These features do not reproduce the experience of handling the original book, but they keep the surrounding record in view.`;

const HARLAND = `Harland Ferries operates three routes connecting the mainland with nearby islands. Route A covers 24 kilometres and normally takes 40 minutes. Route B covers 36 kilometres and takes 50 minutes. Route C is the longest at 45 kilometres and takes 75 minutes.

A standard adult ticket costs £8 on Route A, £11 on Route B and £12 on Route C. Children pay half the adult price on every route. During June, Route A carried 18,000 passengers, Route B carried 15,500 and Route C carried 12,000. In July, the figures were 19,800, 17,050 and 12,600 respectively.

Route A uses the company's oldest vessels. These carry fewer passengers than the vessels used on the other routes, but their smaller size allows them to enter the shallow harbour at Island A. Route B received two new vessels in May. The company stated that these vessels reduced journey cancellations because they could operate safely in stronger winds.

Route C crosses an area used by fishing boats. Its timetable was changed in April so that morning ferries departed thirty minutes earlier. The change was made to reduce congestion rather than to shorten the crossing. The scheduled journey time remained 75 minutes.`;

const DESALINATION = `Two coastal plants tested different methods of removing salt from water. The Orlin plant pushed seawater through dense membranes at high pressure. The Vessa plant heated seawater using waste heat from a neighbouring factory and condensed the resulting vapour. Both plants produced water that met the same drinking-water standard during the trial.

Orlin required less land and could alter its output quickly when demand changed. Its pumps, however, used more purchased electricity per litre than Vessa's system. Vessa bought less electricity because much of its heat would otherwise have been released by the factory, but starting and stopping the thermal process took longer. Vessa also needed larger storage tanks to maintain supply while the plant was warming.

Neither method eliminated waste. Orlin produced a concentrated brine stream, whereas Vessa left mineral deposits that had to be removed from its heating chambers. Engineers warned against using the trial to declare one method universally superior. Vessa's energy advantage depended on access to reliable waste heat, while Orlin's compact design could matter more where coastal land was scarce.

During an interruption at the neighbouring factory, Vessa used an auxiliary boiler and its purchased energy demand increased. Orlin continued at reduced output when one pump was taken offline, because the remaining pumps could operate independently.`;

const SCHOOL_LUNCH = `Brookfield and East Mere introduced different school-lunch systems. Brookfield cooked meals in a central kitchen and transported them to five schools. East Mere retained a kitchen at each of its three schools. Brookfield offered the same main meal at every site each day, while East Mere's cooks could vary menus according to local demand.

Central purchasing allowed Brookfield to pay less per portion for several staple ingredients. Its transport and insulated-container costs were higher, however, and late deliveries occasionally shortened the time available for lunch. East Mere spent more on ingredients per portion but had fewer meals left uneaten. Surveys suggested that East Mere pupils valued the changing menus, although response rates differed between the schools.

Both systems employed trained kitchen staff and followed the same nutritional standards. Brookfield recorded a larger total number of uneaten meals because it served more pupils, but the proportion of meals wasted was also slightly higher. East Mere did not have lower total staffing costs: maintaining three separate kitchens required more staff hours per meal.

Parents in both areas could order vegetarian meals in advance. Brookfield required orders by the end of the previous week, whereas East Mere accepted changes until the morning before a meal was served.`;

const HALDEN_MERROW = `In 2021, Halden and Merrow began separate street-tree programmes. Halden planted 1,200 trees drawn from eight native species, mainly along residential streets. Merrow planted 900 trees from three species, concentrating on commercial roads. After three years, 81% of Halden's trees and 88% of Merrow's trees were alive.

Halden relied on residents to water young trees during the first summer, after which the council's parks team took over. Merrow used a private contractor for the first two summers. The programmes differed in species, planting locations, soil preparation and watering arrangements, so the joint review warned against attributing survival differences to any single factor.

At the streets selected for detailed monitoring, average tree-canopy cover increased by six percentage points in Halden and nine percentage points in Merrow. The streets had different starting levels of canopy, and they were not selected randomly. A resident survey found support for further planting among 68% of Halden respondents and 61% of Merrow respondents. However, response rates were 52% in Halden and 76% in Merrow.`;

const GREENRISE_FIELDWAY = `Greenrise grows lettuce in stacked indoor trays under artificial light. Fieldway grows the same varieties outdoors in soil. Greenrise harvests throughout the year and can adjust nutrients precisely. Fieldway's output varies with season and weather, although its mature soil retains water well after ordinary rainfall.

For each kilogram of marketable lettuce, Greenrise uses less water drawn from the public supply because it recirculates most irrigation. Its electricity use is considerably higher, mainly because of lighting and climate control. Fieldway uses little electricity on site but relies on a diesel tractor and refrigerated storage during peak harvests. A comparison commissioned by both businesses included those direct energy uses but not the energy used to manufacture their buildings or machinery.

Greenrise loses fewer lettuces to insects and applies no field pesticides. Fieldway has higher pest losses in some months, though beneficial insects control many outbreaks. Produce from Greenrise travels thirty kilometres farther to the shared packing centre. Fieldway sometimes sends surplus lettuce to a processor, whereas Greenrise plans output to match weekly contracts more closely.

Neither business claims that one system has the lower total environmental impact in all circumstances. The result changes according to whether water scarcity, electricity source, land use, transport or construction is given greatest weight. Both are now publishing data using the same measurement boundaries.`;

const FLOOD_WARNINGS = `Two neighbouring valleys use different flood-warning systems. In Alder Valley, river gauges transmit water levels automatically every five minutes. Software issues an alert when several readings cross preset thresholds. In Bracken Valley, volunteer wardens check gauges during heavy rain and telephone a coordinator, who considers water levels alongside blocked drains, ground saturation and reports from upstream farms.

Alder's system usually sends the first alert sooner because data arrive continuously and no coordinator must be reached. It has occasionally issued alerts after a damaged sensor produced implausible readings, although comparing several gauges prevents many false alarms. Bracken's system is slower to activate, particularly at night, but the coordinator can discount a single unusual reading when local reports provide an explanation.

Both valleys use text messages and sirens once an alert is approved. Alder covers more households because its lower valley contains a larger town; this does not mean a greater proportion of residents is registered. Bracken tests its contact list twice a year, while Alder runs a monthly automated test. Neither valley has experienced a flood exceeding its defences since the current systems began, so their performance in an extreme event is unknown.

The councils are considering a shared model: automatic gauge monitoring would provide speed, while a duty officer could review uncertain cases. They have not decided whether every alert would require human approval.`;

const COASTAL_FLOODING = `Northport and Southbay adopted different responses to coastal flooding. Northport completed a 3.2-kilometre concrete barrier in 2016. It was designed to protect a compact, densely built town centre and began operating as soon as construction ended. Its initial cost was high. Routine maintenance was modest during the first five years, but sections of the seaward face later required expensive repairs.

Southbay instead purchased low-lying farmland and restored six kilometres of dunes, salt marsh and tidal channels. The restored area took several years to develop fully and required continued control of invasive plants. It occupied considerably more land than Northport's barrier. In addition to flood management, surveys recorded an increase in nesting and feeding habitat for several coastal bird species.

A major storm reached both areas in 2022. Water did not cross the central section of Northport's barrier, although waves damaged the unprotected ends and closed the promenade. At Southbay, the restored land stored a large volume of storm water, but salt water reached two agricultural fields beyond the project boundary.

The schemes cannot be treated as a controlled comparison. The settlements have different population densities, coastlines and levels of storm exposure. Northport's approach concentrates protection around existing buildings, while Southbay's gives water more space across a wider landscape. Both still require monitoring and intervention rather than operating permanently without management.`;

const MUSIC = `Researchers at Westport University investigated whether background music affected performance on a proofreading task. They recruited 180 undergraduate volunteers. Each participant completed three twenty-minute proofreading exercises: one in silence, one while instrumental music played and one while music containing lyrics played. The order of the conditions was varied to reduce the effect of tiredness or practice.

On average, participants identified 82% of the errors in silence, 79% with instrumental music and 70% with lyrical music. However, individual results varied considerably. Some participants performed equally well in all three conditions, and a small number achieved their highest score while listening to instrumental music.

Participants also rated how distracting they found each condition. Lyrical music received the highest average distraction rating. Nevertheless, the researchers noted that self-reported distraction did not always correspond to proofreading performance.

The study examined one relatively short language-based task. It did not investigate mathematical work, creative tasks or activities completed over several hours. The participants were volunteers from one university and were mostly between 18 and 24 years old. The researchers therefore warned against assuming that the results would apply equally to schoolchildren, older adults or professional proofreaders.`;

const AIR_CLEANERS = `Researchers installed portable air cleaners in eight classrooms at one primary school during a six-week winter trial. Another eight classrooms in the same school continued without cleaners. Teachers were asked to keep windows in their usual positions, but window opening was not monitored continuously. Particle sensors recorded lower average fine-particle concentrations in the rooms containing cleaners.

Pupil absence was also lower in those rooms during the trial. The researchers warned that classes had not been assigned randomly: the headteacher had placed cleaners first in rooms used by younger pupils and in two rooms with known ventilation problems. Several respiratory infections were circulating unevenly across year groups. The trial collected no information about pupils' symptoms, home air quality or causes of absence.

The report concluded that the cleaners reduced measured particles in the participating rooms under the conditions of the trial. It did not attribute the difference in absence to the machines. The researchers recommended a longer randomised study across several schools, with filter noise, electricity use and maintenance included alongside air-quality measurements.

Teachers in three rooms complained that the highest fan setting made quiet reading more difficult, so those cleaners were sometimes operated at a lower setting. The report did not calculate whether this altered particle removal or pupil attendance.`;

const HYBRID_WORK = `A software company allowed 120 employees in two departments to choose two home-working days each week for four months. Before the trial, most of these employees worked from home no more than once a month. Output was measured using completed case files in one department and resolved support requests in the other. Both measures rose slightly during the trial.

Employees also completed weekly questionnaires. Most respondents reported fewer interruptions at home, although parents of very young children were less likely to report this benefit. Average time spent in scheduled meetings increased. Managers said that arranging training for new staff became more difficult when team members selected different home-working days.

The company did not include departments handling laboratory or reception work, and it did not compare the trial departments with a similar group that retained the previous arrangements. It therefore described the findings as evidence that hybrid work was feasible for the two participating departments, not as proof that it would improve performance across the company. The policy was continued in those departments while other teams designed separate trials.

The continuation included a rule that each team must share at least two office days. Managers could alter individual arrangements during training periods, and employees could request additional office access if their home environment was unsuitable.`;

const ORCHARDS = `Fourteen apple orchards volunteered to join a two-year pollinator-corridor project. Each participating orchard planted strips of native flowers between selected rows. Researchers also monitored fourteen non-participating orchards in the same region. The two groups were similar in size, but they were not assigned at random. Before the project began, participating orchards were more likely to have existing wildflower margins.

After two years, average wild-bee counts in participating orchards were 23% above their own starting levels. Counts in the comparison orchards rose by 4%. Participating orchards also showed a higher proportion of apple blossoms developing into young fruit. Final harvested yield, however, did not differ significantly between the two groups during the study.

Pesticide use was recorded from forms completed by orchard managers and was not checked against purchase records. The researchers found no clear change in the number of rare bee species. They concluded that the results were consistent with pollinator corridors improving the abundance of common wild bees, but said that randomised trials across several regions would be needed before recommending the scheme nationally.`;

const SCREENS = `A research team investigated evening screen use among 240 pupils aged 14 to 16 from four secondary schools. For fourteen nights, pupils used an application that recorded how long their phone screens were active after 8 p.m. They also wore devices that estimated when they fell asleep and woke.

Pupils with more than two hours of recorded evening screen activity fell asleep an average of twenty-four minutes later than pupils with less than thirty minutes. They also reported feeling more tired in morning lessons. However, there was considerable variation within both groups.

The researchers did not instruct pupils to change their normal behaviour. Consequently, pupils who used phones more may have differed from lighter users in other ways. For example, they may have had different homework demands, social routines or usual bedtimes.

The application recorded screen activity but not what pupils were doing. It could not distinguish between homework, messaging, videos or reading. The study also did not measure screen use on televisions, computers or tablets. The researchers concluded that heavier evening phone use was associated with later sleep among the participating pupils. They did not claim that phone use was the sole cause. They recommended a controlled follow-up study in which participants would be assigned different screen-use limits.`;

const FOUR_DAY_SCHOOL = `Twelve rural secondary schools changed from a five-day timetable to four longer school days. The total number of scheduled teaching minutes was kept approximately the same. During the first year, average pupil attendance was 1.8 percentage points higher than in the previous year, while examination scores showed no statistically significant change. The study did not include a matched group of schools that retained a five-day week.

Teacher vacancies across the twelve schools fell during the year. Headteachers suggested that the timetable had improved recruitment, but national teacher recruitment also improved over the same period. No applicants were asked whether the four-day week had influenced their decision.

A survey found that 71% of responding parents preferred retaining the new timetable. However, only 46% of invited parents responded, and households with lower incomes were less likely to return the survey. Local childcare providers reported increased demand on the weekday when schools were closed.

The researchers described the findings as an account of what happened during the first year, not proof that the timetable caused each change. They recommended collecting several years of data and comparing the schools with similar schools that continued using five-day timetables.`;

const ELECTRICBUS = `Greenford tested electric buses on three routes for twelve months. Route K is a short urban route with frequent stops. Route L connects the town centre to two suburban areas, while Route M includes a steep section leading to Greenford Hill.

Before the trial, all three routes used diesel buses. Their average monthly fuel and maintenance costs were £18,000 for K, £21,000 for L and £23,000 for M. During the electric trial, the corresponding electricity and maintenance costs were £12,600, £15,750 and £19,550.

Route K's passenger numbers increased by 12% during the trial. Route L's increased by 8%, while Route M's remained approximately unchanged. Passenger surveys found that electric buses were considered quieter, but the trial did not establish that quieter vehicles caused the increases.

Route M's smaller saving was partly attributed to its steep gradient, which increased energy use. Its buses also required battery replacement earlier than those used on K and L. Route K experienced the largest number of charging sessions because its buses completed more journeys each day. The council concluded that electric buses reduced operating costs on all three routes. It recommended replacing the remaining diesel buses on K and L first while further testing battery performance on hilly routes.`;

// ─── SUBTYPES ────────────────────────────────────────────────────────────────

export const VR_SUBTYPES: VRSubtype[] = [

  // ── 1. DIRECT RETRIEVAL ──────────────────────────────────────────────────
  {
    key: "direct-retrieval",
    label: "Direct Retrieval",
    formats: ["tf", "mcq"],
    tagline: "Find the sentence, read it fully, classify precisely — same meaning, opposite meaning, or missing information.",
    whatItTests: "Tests whether you can find **specific information** written in the passage and decide whether it **matches**, **contradicts** or is **not covered** by what you read. No reasoning or inference is needed — the answer is always somewhere on the page.",
    howToIdentify: "You are given a statement containing searchable details — numbers, dates, names, stated reasons or a sequence of events. You should be able to locate a sentence that directly settles the answer without needing to infer anything beyond what is written.",
    method: [
      { title: "Step 1 — Break the statement into claims", body: "Separate joined claims. If the statement says an event happened **in 2021 because funding increased**, check both the **date** and the **reason** independently — each one can fail on its own." },
      { title: "Step 2 — Select useful keywords", body: "Use **distinctive ideas** rather than common words. Names, figures and unusual nouns are the easiest to locate. Avoid searching for words like 'the' or 'was'." },
      { title: "Step 3 — Find the evidence", body: "Scan for the keyword or a **synonym**. Do not expect the passage to repeat the question's exact wording — correct answers are usually **paraphrases**." },
      { title: "Step 4 — Read the complete sentence", body: "Read to the **full stop**. If the sentence contains a **contrast word** — *although*, *however*, *while* — read both sides. The contrast often determines the answer." },
      { title: "Step 5 — Classify precisely", body: "- **TRUE** — every required part is supported\n- **FALSE** — at least one required part is contradicted\n- **CAN'T TELL** — nothing contradicts it, but the passage does not supply enough evidence to confirm every part" },
    ],
    traps: [
      "**Keyword matching** — finding the same noun and answering before checking what the full sentence says.",
      "**Half-true statements** — one detail is correct but a date, number, reason or group is wrong.",
      "**Nearby-detail substitution** — using a fact about a similar person, place or stage of the process.",
      "**False instead of Can't Tell** — deciding an unmentioned detail must be wrong rather than simply missing.",
      "**Reversed sequence** — confusing what happened before, during or after an event.",
    ],
    shortcut: "Imagine placing the passage sentence beside the statement — **same meaning** → True, **opposite meaning** → False, **missing information** → Can't Tell.",
    passage: RILLMOUTH,
    workedQs: [
      {
        passage: LIGHTHOUSE,
        question: "The remote-control system was tested while the lighthouse was still being operated by its keepers.",
        steps: [
          { label: "Break the statement into its two claims", body: "Two facts need checking independently: (1) the remote system was tested, and (2) the lighthouse keepers were still operating at the same time. Both must be supported for the answer to be True." },
          { label: "Select keywords and locate the evidence", body: "Use 'tested' and 'keepers' as search ideas. Scan the second paragraph — both elements appear there in the same sentence." },
          { label: "Read the full sentence", body: "Read the complete sentence, including the joining word 'while'.", highlight: "technicians ran the new system for twelve weeks while the lighthouse keepers continued operating the main light" },
          { label: "Match meanings across both halves", body: "'Ran the new system' is a paraphrase of 'tested it'. 'While' confirms the two activities happened simultaneously — a direct match to both claims in the statement.", highlight: "technicians ran the new system for twelve weeks while the lighthouse keepers continued operating the main light" },
          { label: "Classify → TRUE", body: "Every required part of the statement is directly supported by a single sentence. The paraphrase and the timing word both hold. Answer: TRUE." },
        ],
        answer: "TRUE",
        answerNote: "The second paragraph confirms both elements: testing ('technicians ran the new system') and timing ('while the keepers continued operating'). 'While' is the key connector.",
      },
      {
        passage: WESTFORD_FRIDGE,
        question: "Supermarkets supplied surplus food to the Westford fridge every evening of the week.",
        steps: [
          { label: "Break the statement into its key details", body: "Three details need to match: the supplier (supermarkets), the frequency (every evening) and the days (of the week — meaning including weekends). All three must be confirmed." },
          { label: "Locate the supermarket schedule", body: "Scan the opening paragraph for 'supermarket'.", highlight: "Supermarket collections take place on weekday evenings, while cafés arrange collections only when they have suitable food available." },
          { label: "Read the sentence fully and note the limiting word", body: "The passage says 'weekday evenings'. The statement says 'every evening of the week'. Weekday evenings does not include weekends.", highlight: "Supermarket collections take place on weekday evenings" },
          { label: "Identify the contradiction", body: "The statement claims every evening of the week; the passage gives a schedule that excludes weekends. This is a direct contradiction, not a missing detail.", highlight: "It did not recommend weekend supermarket rounds because managers at the participating stores had not agreed to provide staff for them." },
          { label: "Classify → FALSE", body: "The passage provides a schedule that directly contradicts the statement. Missing information would give Can't Tell; a conflicting schedule gives False. Answer: FALSE." },
        ],
        answer: "FALSE",
        answerNote: "The passage specifies 'weekday evenings'. The statement claims 'every evening of the week', which includes weekends — a direct contradiction.",
        trap: "Students sometimes answer Can't Tell because weekend deliveries 'might' happen informally. But the passage gives an explicit schedule that contradicts the statement — that produces False, not Can't Tell.",
      },
      {
        passage: BRONZE_SCULPTURE,
        question: "Nisha Vale had previously restored other bronze sculptures.",
        steps: [
          { label: "Identify the exact claim", body: "The statement claims Vale had a specific kind of prior experience: restoring other bronze sculptures. That precise fact must appear in the passage." },
          { label: "Locate her name and read what the passage says about her", body: "She appears in paragraph two as team leader. The passage tells us her role in this project, nothing more.", highlight: "The authority appointed a team led by conservator Nisha Vale." },
          { label: "Check where career history would appear", body: "The meeting account is the one place biographical information might be recorded — the passage explicitly says none was.", highlight: "The account of that meeting records questions about cost and public access, but it contains no biographical information about any member of the conservation team." },
          { label: "Confirm there is no contradiction either", body: "Nothing in the passage states she lacked prior experience. The passage is simply silent on this point — no support and no contradiction." },
          { label: "Classify → CAN'T TELL", body: "The passage provides no career history for Vale beyond her role in this project. Whether she restored other bronze sculptures is neither confirmed nor denied. Answer: CAN'T TELL." },
        ],
        answer: "CAN'T TELL",
        answerNote: "The passage provides no career history for Vale. Her appointment as lead conservator makes prior experience plausible, but plausibility is not evidence.",
        trap: "A qualified appointment as lead conservator makes prior experience seem logical. But many students answer True here — plausibility is not proof. The passage must state it.",
      },
      {
        format: "mcq",
        passage: WILDLIFE_BRIDGE,
        question: "Which species generated the second-highest number of recorded crossing events?",
        opts: [
          "A. Badgers",
          "B. Foxes",
          "C. Pine martens",
          "D. Red deer",
        ],
        cor: 1,
        steps: [
          { label: "Identify the precise target", body: "The question asks for the second-highest number of recorded crossing events — not the second-highest number of individual animals. The distinction matters because the report counted events." },
          { label: "Locate the ranking sentence", body: "Find the sentence that gives the order of species by event count.", highlight: "Red deer produced the largest number of recorded events, followed by foxes and badgers." },
          { label: "Establish the correct position", body: "'Followed by' places foxes immediately after red deer. Foxes hold second place.", highlight: "followed by foxes and badgers" },
          { label: "Eliminate the distractors", body: "Red deer (D) were first, not second. Pine martens (C) had only four occasions and rank low. Badgers (A) come third — after foxes. The order is red deer → foxes → badgers.", highlight: "Pine martens were photographed on four occasions" },
          { label: "Final answer → B. Foxes", body: "The passage places foxes second after red deer. Answer: B." },
        ],
        answer: "B — Foxes",
        answerNote: "The passage ranks species as: red deer (largest), then foxes, then badgers. 'Followed by foxes' places them in second position.",
      },
    ],
    practice: [
      {
        passage: RILLMOUTH,
        question: "All six Rillmouth turbines generated electricity throughout the first winter.",
        opts: ["True", "False", "Can't Tell"],
        cor: 1,
        explanation: "False. The passage states that sediment obstructed two turbines, so only four generated electricity throughout the whole season. The word 'all' is directly contradicted.",
      },
      {
        passage: RILLMOUTH,
        question: "The council allocated income from the electricity to maintaining the flood barrier.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. The passage explicitly says the council allocated the revenue to maintenance of the flood barrier. 'Income from the electricity' is a paraphrase of revenue earned by selling electricity to the regional grid.",
      },
      {
        passage: RILLMOUTH,
        question: "The maintenance-related noise peaks could be heard inside nearby homes.",
        opts: ["True", "False", "Can't Tell"],
        cor: 2,
        explanation: "Can't Tell. The passage confirms that short peaks occurred during maintenance, but explicitly states the report did not record whether they were audible inside homes. The statement is possible but cannot be proved or contradicted.",
      },
      {
        passage: RILLMOUTH,
        question: "After five years, responsibility for turbine maintenance will pass to a locally trained team.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. The passage states that after the manufacturer's five-year maintenance period, responsibility will transfer to a locally trained engineering team.",
      },
    ],
  },

  // ── 2. INFERENCE ─────────────────────────────────────────────────────────
  {
    key: "inference",
    label: "Inference",
    formats: ["tf", "mcq"],
    tagline: "Make the smallest safe conclusion — ask 'must this follow?' not 'could this be true?'",
    whatItTests: "Your ability to identify conclusions that **must follow** from the passage — not conclusions that are plausible, consistent or likely, but ones that are **logically required** by the stated facts. No external knowledge is ever allowed.",
    howToIdentify: "The statement or option goes one step beyond what the passage directly states. You may need to connect a reason and an action, combine two facts or recognise what a result implies. Look for language like *suggests, indicates, was likely, would have, at least one* or *not all*.",
    method: [
      { title: "Step 1 — Identify the conclusion", body: "Rewrite the statement in simple language. What exactly would need to be true? Keep it precise." },
      { title: "Step 2 — Locate the supporting clues", body: "Find the passage section dealing with that subject. An inference may rely on two nearby details." },
      { title: "Step 3 — Join only what the passage permits", body: "Ask: if the passage is true, does this conclusion follow? Avoid adding an unstated motive, cause or background fact." },
      { title: "Step 4 — Try to build a counterexample", body: "Could the passage be true while the statement is false? If yes, the statement is not proven — it is Can't Tell at best." },
      { title: "Step 5 — Apply TFCT", body: "**TRUE**: the conclusion necessarily follows. **FALSE**: the conclusion conflicts with the passage. **CAN'T TELL**: the conclusion is possible but not necessary, and its opposite is also possible." },
    ],
    traps: [
      "**Plausibility** — choosing True because the statement sounds sensible in real life.",
      "**Mind-reading** — inventing what a person intended, believed or felt.",
      "**Causal leap** — assuming one event caused another because they occurred together.",
      "**Large inference** — stretching a small clue into a broad conclusion.",
      "**Ignoring alternatives** — failing to ask whether another explanation fits equally well.",
    ],
    shortcut: "Use the **'must, not might' test**. If the statement only might be true, the answer is Can't Tell.",
    passage: LENTON_MUSEUM,
    workedQs: [
      {
        passage: LINT_FILTER,
        question: "The association believed that relying on residents to buy filters themselves could limit adoption.",
        steps: [
          { label: "Identify the conclusion being tested", body: "The statement asks us to infer a concern behind the association's decision. What belief drove the policy choice?" },
          { label: "Locate the relevant decision in the passage", body: "Find the paragraph about the association's decision on how to distribute filters.", highlight: "Rather than asking residents to purchase filters, it included them in the standard equipment supplied to newly renovated flats." },
          { label: "Read the contrast and join what the passage permits", body: "The contrast is between requiring residents to buy versus supplying automatically. The smallest safe inference is that requiring purchase could reduce uptake.", highlight: "Rather than asking residents to purchase filters, it included them in the standard equipment supplied to newly renovated flats." },
          { label: "Build the counterexample test", body: "Could the association have chosen to supply filters automatically for a completely different reason — e.g. convenience rather than adoption concerns? The contrast word 'rather than' makes a purchasing-barrier concern the most natural reading." },
          { label: "Classify → TRUE", body: "The statement says 'could limit' — a cautious possibility, not a certainty. Supplying filters instead of asking residents to buy them directly supports this cautious inference. Answer: TRUE." },
        ],
        answer: "TRUE",
        answerNote: "The contrast 'rather than asking residents to purchase' implies a concern that requiring purchase could reduce how many people used filters. 'Could limit' is appropriately cautious.",
      },
      {
        passage: PENMERE_BUS,
        question: "The council regarded the flexible routing system itself as the principal reason older residents had difficulty using the service.",
        steps: [
          { label: "Identify the two ideas in the statement", body: "The statement claims the council identified flexible routing — not something else — as the main cause of older residents' difficulty." },
          { label: "Locate the reported difficulty", body: "Find where older residents' difficulty is described.", highlight: "several older residents reported difficulty reaching the booking line during its limited opening hours" },
          { label: "Examine the council's response", body: "The council's actions reveal what it identified as the problem.", highlight: ["keeping telephone reservations but adding a paper request form at the pharmacy and asking the line operator to return unanswered calls", "rejected a proposal to restore the former fixed circuit every morning"] },
          { label: "Build the counterexample", body: "The council kept the flexible route and changed how bookings were accessed. This shows it located the problem in the booking method, not in routing itself. The statement assigns the problem to the wrong feature." },
          { label: "Classify → FALSE", body: "The council's response shows it blamed the booking method, not flexible routing. The statement is directly contradicted. Answer: FALSE." },
        ],
        answer: "FALSE",
        answerNote: "The council retained flexible routing and changed booking access instead, showing it identified the booking method — not routing — as the cause of difficulty.",
      },
      {
        passage: HARBOROUGH_THEATRE,
        question: "Most people attending the captioned performances relied on the captions to follow the dialogue.",
        steps: [
          { label: "Identify the exact claim", body: "The statement makes a claim about 'most people' and whether they relied on captions. Both parts must be established." },
          { label: "Locate evidence about audience composition", body: "Find what the passage tells us about who attended and why.", highlight: ["some caption users had previously avoided live theatre, while others were regular visitors who welcomed a wider choice of dates", "The survey was available only by email and was completed by fewer than one third of ticket holders."] },
          { label: "Join only what the passage permits", body: "Similar ticket sales and survey evidence exist, but fewer than one third of ticket holders responded — and the survey only covers caption users among respondents, not the full audience." },
          { label: "Build the counterexample", body: "Could most attendees have been non-caption users who simply attended a captioned showing on a convenient date? Yes — nothing in the passage prevents this. The statement may be true or false." },
          { label: "Classify → CAN'T TELL", body: "The passage does not establish what proportion of the total audience relied on captions, and the survey is incomplete. Answer: CAN'T TELL." },
        ],
        answer: "CAN'T TELL",
        answerNote: "A captioned performance does not mean every — or even most — attendees used the captions. The survey's low response rate and non-exclusive seating mean the proportion cannot be established.",
        trap: "The existence of a captioned performance may suggest caption users attend, but regular theatre-goers could also attend on a convenient evening without needing captions.",
      },
      {
        format: "mcq",
        passage: MARKET_LAYOUT,
        question: "Which conclusion is best supported by the passage?",
        opts: [
          "A. The new layout attracted substantially more people into the market.",
          "B. The new layout probably encouraged some visitors to move beyond their planned destinations.",
          "C. Every prepared-food seller earned more under the new layout.",
          "D. Wet weather was the main cause of longer visits.",
        ],
        cor: 1,
        steps: [
          { label: "Test option A", body: "A claims 'substantially more people'. But door counters recorded almost the same total visitors as the previous year. A is unsupported.", highlight: "Door counters recorded almost the same total number of visitors as during the corresponding eight Saturdays of the previous year." },
          { label: "Test option B", body: "Exit-survey respondents more often said they explored unplanned areas. 'Probably' reflects the voluntary survey's limitation. B is cautiously supported.", highlight: "Visitors completing an exit survey were more likely than the previous year's respondents to say they had explored parts of the market they had not intended to visit." },
          { label: "Test option C", body: "Collective sales rose, but two sellers said the aisle became congested. 'Every' is too strong when the passage only gives a collective figure.", highlight: "Prepared-food sellers collectively reported higher sales, although two said the central aisle became congested at lunchtime." },
          { label: "Test option D and decide", body: "Wet weather is mentioned only as a possible confounding factor, not 'the main cause'. D overstates the evidence. B remains the only appropriately hedged, evidence-based option.", highlight: "unusually wet weather may have encouraged visitors to remain indoors" },
          { label: "Final answer → B", body: "B matches the survey evidence and uses cautious language ('probably', 'some visitors'). Answer: B." },
        ],
        answer: "B — The new layout probably encouraged some visitors to move beyond their planned destinations.",
        answerNote: "The exit-survey finding directly supports B. 'Probably' correctly reflects the voluntary sample. A, C and D each make claims stronger than the evidence allows.",
      },
    ],
    practice: [
      {
        passage: LENTON_MUSEUM,
        question: "The rate of recorded security incidents per visitor was lower during the programme than during the comparison period.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. Attendance doubled while the number of incidents remained unchanged. The same number of incidents spread across twice as many visitors produces a lower rate per visitor — this conclusion necessarily follows from the stated figures.",
      },
      {
        passage: LENTON_MUSEUM,
        question: "Most people attending the free evenings were visiting a museum for the first time in their lives.",
        opts: ["True", "False", "Can't Tell"],
        cor: 2,
        explanation: "Can't Tell. The survey asked whether it was a person's first visit to Lenton Museum, not their first museum visit ever. The statement changes the meaning. The low response rate (two in five) creates an additional reason not to generalise.",
      },
      {
        passage: LENTON_MUSEUM,
        question: "The funding board concluded that removing the admission charge was solely responsible for the increase in attendance.",
        opts: ["True", "False", "Can't Tell"],
        cor: 1,
        explanation: "False. The report explicitly stated that free admission and the new events began together, so the evaluation could not separate their effects. 'Solely responsible' is directly contradicted.",
      },
      {
        passage: LENTON_MUSEUM,
        question: "The museum shop completed more transactions during the programme than during the comparison evenings.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. Total shop revenue rose 8% while the average spend per transaction fell. For total revenue to increase when each transaction brings in less money, the number of transactions must have increased — this necessarily follows.",
      },
    ],
  },

  // ── 3. MAIN IDEA & PURPOSE ───────────────────────────────────────────────
  {
    key: "main-idea",
    label: "Main Idea & Purpose",
    formats: ["mcq"],
    tagline: "Identify the passage's overall message and why the author included specific details.",
    whatItTests: "Your ability to identify the **author's overall message** and understand **why specific details or paragraphs were included** — the passage's **purpose**, not just its topic.",
    howToIdentify: "Look for question stems like: 'What is the **main message or purpose** of this passage?', 'Why does the author **include** this detail?', 'Which **title** best fits this passage?', 'What is the **primary purpose** of paragraph X?'",
    method: [
      { title: "Step 1 — Label each paragraph in 3–4 words", body: "Quickly note what each paragraph **does**: introduces a problem, provides evidence, presents a counter-view, or reaches a conclusion." },
      { title: "Step 2 — Find the author's balance point", body: "Usually in the **final paragraph**. Look for contrast words — *however*, *nevertheless*, *equally*, *but* — that signal where the author lands." },
      { title: "Step 3 — For 'why included' questions, ask what job the detail does", body: "Identify the detail's **function**: does it illustrate, qualify, contradict or evidence the main point?" },
      { title: "Step 4 — Test each option for scope", body: "If an option covers only one paragraph → too narrow. If it goes further than the passage → too broad. The right answer covers all of the passage, nothing more." },
      { title: "Step 5 — Match the author's certainty level", body: "If the author says 'may' or 'suggests', the correct answer won't say 'proves'. Preserve the **degree of confidence** the passage actually expresses." },
    ],
    traps: [
      "**True-but-narrow** — choosing a true detail from one paragraph instead of the overall message.",
      "**Certainty upgrade** — selecting an option that overstates certainty ('proves' vs 'suggests').",
      "**Topic vs message** — picking the topic label rather than the message the passage makes about that topic.",
      "**Speaker confusion** — confusing a reported view with the author's own conclusion.",
      "**Missing cautious support** — 'cautiously supportive' is a valid position; not every attitude is fully for or against.",
    ],
    shortcut: "If the option could be the title of **just one paragraph**, it is wrong. The **main idea must fit the whole passage**.",
    passage: REDCOMBE,
    workedQs: [
      {
        format: "mcq",
        passage: SEED_DISPERSAL,
        question: "Which option best expresses the main point of the passage?",
        opts: [
          "A. Fluorescent markers should replace traditional methods of studying seed movement.",
          "B. Most supposedly wind-dispersed seeds are actually transported by mice.",
          "C. Seed dispersal can involve several stages, so combining methods gives a fuller account.",
          "D. Dense woodland leaves make reliable seed research impossible.",
        ],
        cor: 2,
        steps: [
          { label: "Label each paragraph's role", body: "Para 1: limits of older methods. Para 2: value and limits of markers. Para 3: multi-stage dispersal finding. Para 4: recommendation to combine methods. The main idea must link all four." },
          { label: "Find the author's balance point", body: "The final paragraph is the conclusion: combine methods, not replace them.", highlight: ["They do not propose abandoning older techniques.", "recommend combining marked-seed searches with traps, cameras and genetic analysis of seedlings"] },
          { label: "Test option C for coverage", body: "C — 'dispersal can involve several stages, so combining methods gives a fuller account' — includes both the key finding (multi-stage) and the key recommendation (combine). It fits all four paragraphs.", highlight: ["dispersal often occurs in stages", "Each method corrects a different blind spot"] },
          { label: "Eliminate the other options", body: "A contradicts the explicit 'do not propose abandoning'. B turns one example (some seeds moved by mice) into a claim about most seeds. D turns a search difficulty into impossibility.", highlight: "They do not propose abandoning older techniques." },
          { label: "Final answer → C", body: "C is the only option that captures both recurring ideas — multi-stage dispersal and the need for combined methods. Answer: C." },
        ],
        answer: "C — Seed dispersal can involve several stages, so combining methods gives a fuller account.",
        answerNote: "The passage endorses the marker method while noting its limits, then explicitly recommends combining all approaches. C captures the value of each method and the need for integration.",
      },
      {
        format: "mcq",
        passage: SEABREAK,
        question: "What is the author's main purpose?",
        opts: [
          "A. To argue that steamships harmed every household on Seabreak.",
          "B. To show that informal local practices were central to the island's changing postal network.",
          "C. To explain why the harbourmaster was legally entitled to store mail.",
          "D. To prove that motor vehicles arrived earlier than historians believe.",
        ],
        cor: 1,
        steps: [
          { label: "Track the repeated thread across paragraphs", body: "The passage returns repeatedly to informal routes: shopkeepers, weekly worship, schoolchildren, shops as intermediaries.", highlight: ["shopkeepers travelling inland carried lists of names for whom letters were waiting", "Families elsewhere collected mail from shops, exchanged it after weekly worship or asked schoolchildren to carry it home"] },
          { label: "Find the author's conclusion", body: "The final sentence is the key.", highlight: "Formal transport mattered, but its effects depended on local habits that had long connected harbour, shops, schools and homes." },
          { label: "Match to an option", body: "B — 'informal local practices were central to the island's changing postal network' — captures the whole argument. The author is arguing that these informal routes were not peripheral but essential.", highlight: "These informal routes were not peripheral accidents; for many residents, they were the actual postal system." },
          { label: "Eliminate A, C and D", body: "A says 'every household' — the passage says some received letters faster. C and D introduce legal and chronological claims the passage never pursues." },
          { label: "Final answer → B", body: "B captures the author's sustained argument that informal networks drove postal delivery. Answer: B." },
        ],
        answer: "B — To show that informal local practices were central to the island's changing postal network.",
        answerNote: "The author repeatedly returns to shops, worship, schoolchildren and neighbours as the actual delivery system. The conclusion explicitly says formal transport's effects depended on those local habits.",
      },
      {
        format: "mcq",
        passage: REPAIR_SCHEME,
        question: "Which title best captures the passage?",
        opts: [
          "A. Why Every Broken Appliance Should Be Repaired",
          "B. The Hidden Financial Costs of Volunteer Workshops",
          "C. Community Repair: More Than a Count of Fixed Objects",
          "D. How to Calculate the Exact Environmental Benefit of Reuse",
        ],
        cor: 2,
        steps: [
          { label: "Label the paragraph roles", body: "Para 1: what the sessions do (reports completed repairs, not 'failures'). Para 2: estimate the environmental impact. Para 3: skill exchange benefits. Para 4: conclusion — significance lies in measurable AND less visible changes." },
          { label: "Find the author's balance point", body: "The final paragraph synthesises the whole passage.", highlight: ["The scheme's significance therefore lies partly in measurable repairs and partly in less visible changes to knowledge and confidence.", "treating that number as a complete verdict would misunderstand what the sessions are designed to achieve"] },
          { label: "Test option C", body: "C — 'More Than a Count of Fixed Objects' — contrasts measurable repairs with skill and confidence gains, exactly matching the passage's conclusion.", highlight: "Counting repaired objects remains useful, but treating that number as a complete verdict would misunderstand what the sessions are designed to achieve." },
          { label: "Eliminate A, B and D", body: "A ignores the passage's acknowledgement that unsafe items should be recycled — 'every' is too strong. B narrows to financial costs alone. D promises exact calculation, which the passage says is not possible.", highlight: "figures are estimates: they cannot know how long a repaired toaster will remain in use" },
          { label: "Final answer → C", body: "C captures the contrast between measurable output and wider value without overclaiming. Answer: C." },
        ],
        answer: "C — Community Repair: More Than a Count of Fixed Objects.",
        answerNote: "The passage contrasts the countable items repaired with learning, diagnosis and confidence — effects that cannot be expressed as a simple total. C captures this contrast accurately.",
      },
    ],
    practice: [
      {
        passage: REDCOMBE,
        question: "Which option best expresses the main idea of the passage?\n\nA. Redcombe's lighting policy has unquestionably transformed tourism and eliminated safety concerns.\nB. Dark-sky policies benefit astronomers but are harmful to every other local interest.\nC. Redcombe's policy may offer several benefits, but its effects and implementation involve uncertainty and competing concerns.\nD. The council introduced the policy mainly to increase attendance at the food festival.",
        opts: [
          "A. Unquestionably transformed tourism and eliminated safety concerns.",
          "B. Benefits astronomers but is harmful to every other interest.",
          "C. May offer several benefits, but effects and implementation involve uncertainty and competing concerns.",
          "D. Introduced mainly to increase attendance at the food festival.",
        ],
        cor: 2,
        explanation: "C. The passage covers astronomy, tourism uncertainty, moth activity, safety concerns, and business costs — all with qualifications. A is too certain, B ignores several interests, and D confuses a simultaneous event with the policy's stated purpose.",
      },
      {
        passage: REDCOMBE,
        question: "Why does the author mention the new rail service and food festival?\n\nA. To show that other changes could have contributed to the rise in bookings.\nB. To prove that the lighting policy had no effect on tourism.\nC. To explain why astronomers opposed winter visitors.\nD. To demonstrate that local accommodation had become cheaper.",
        opts: [
          "A. To show that other changes could have contributed to the rise in bookings.",
          "B. To prove that the lighting policy had no effect on tourism.",
          "C. To explain why astronomers opposed winter visitors.",
          "D. To demonstrate that local accommodation had become cheaper.",
        ],
        cor: 0,
        explanation: "A. The additional events provide alternative explanations for increased bookings. They qualify the tourism board's enthusiasm without proving the lighting policy had no effect. B overstates — the passage says the contribution 'could not yet be measured', not that it was zero.",
      },
      {
        passage: REDCOMBE,
        question: "Why are the observations of two moth species included?\n\nA. To prove that every nocturnal species recovered.\nB. To illustrate a possible ecological benefit while preserving the limits of the evidence.\nC. To show that moths were the reason emergency-service locations were exempt.\nD. To establish that ecological benefits were more valuable than public safety.",
        opts: [
          "A. To prove that every nocturnal species recovered.",
          "B. To illustrate a possible ecological benefit while preserving the limits of the evidence.",
          "C. To show that moths were the reason emergency-service locations were exempt.",
          "D. To establish that ecological benefits were more valuable than public safety.",
        ],
        cor: 1,
        explanation: "B. The moth observations broaden the discussion beyond astronomy and tourism. However, the author immediately limits the evidence to two species and does not claim all wildlife recovered. B preserves both the benefit and the limitation.",
      },
      {
        passage: REDCOMBE,
        question: "Which title would be most suitable for the passage?\n\nA. Redcombe in the Dark: Promise, Uncertainty and the Cost of Changing the Night.\nB. How One Food Festival Ended Light Pollution.\nC. Why Shielded Lamps Always Prevent Pedestrian Accidents.\nD. A Complete Catalogue of Redcombe's Nocturnal Wildlife.",
        opts: [
          "A. Redcombe in the Dark: Promise, Uncertainty and the Cost of Changing the Night.",
          "B. How One Food Festival Ended Light Pollution.",
          "C. Why Shielded Lamps Always Prevent Pedestrian Accidents.",
          "D. A Complete Catalogue of Redcombe's Nocturnal Wildlife.",
        ],
        cor: 0,
        explanation: "A. A captures the environmental promise, uncertainty about effects and disagreement over costs — matching the passage's full scope. B attributes policy success to the food festival alone. C makes an absolute claim about safety. D is too narrow.",
      },
    ],
  },

  // ── 4. AUTHOR & SPEAKER VIEWPOINT ────────────────────────────────────────
  {
    key: "author-viewpoint",
    label: "Author & Speaker Viewpoint",
    formats: ["mcq"],
    tagline: "Separate whose view is whose — and measure how strongly each view is held.",
    whatItTests: "Your ability to separate **whose view is whose**, measure **how strongly** each view is held, and identify **conditions or qualifications** attached to each position.",
    howToIdentify: "Questions name a specific person or 'the author' and ask about their position: 'Which best describes X's view?', 'On which point would A and B agree?', 'How does the author regard Y?' Passages typically feature multiple named speakers.",
    method: [
      { title: "Step 1 — List all speakers in the passage", body: "Before answering, note every named person and the author. Draw a mental column for each and assign claims as you read." },
      { title: "Step 2 — Attribute every claim correctly", body: "For each opinion, confirm whose it is. Reporting someone else's view ('X believes…') is different from the author endorsing it." },
      { title: "Step 3 — Identify hedging and conditions", body: "These words limit the claim that precedes them: 'provided that', 'nevertheless', 'although', 'but'. Note what conditions apply to each speaker's position." },
      { title: "Step 4 — Map the attitude strength", body: "Classify each speaker's stance: fully for (unconditional), conditionally for (with a requirement), neutral (no clear stance), or against." },
      { title: "Step 5 — For agreement questions, find shared ground only", body: "Speakers agree only on something both explicitly address. Silence on a topic is not agreement or disagreement." },
    ],
    traps: [
      "**Attribution error** — attaching one speaker's reason to a different speaker.",
      "**Reported ≠ endorsed** — treating the author's summary of a view as the author's own position.",
      "**Silence as opposition** — 'doesn't mention X' does not mean 'opposes X'.",
      "**Unconditional vs conditional** — selecting 'fully supports' when the text shows partial support.",
      "**False agreement** — assuming speakers who share one concern also agree on solutions.",
    ],
    shortcut: "For each option ask three questions: **WHO** holds this view? **HOW STRONGLY?** **WITH WHAT CONDITION?** — all three before you choose.",
    passage: WEXFORD_MUSEUM,
    workedQs: [
      {
        format: "mcq",
        passage: WIND_FARM,
        question: "Which statement best reflects the author's view?",
        opts: [
          "A. Developer-funded archaeology is worthless because its results cannot be independent.",
          "B. The wind farm should proceed unchanged because recording removes every archaeological risk.",
          "C. The survey is valuable, although its funding and the development's effects require scrutiny.",
          "D. Archaeological evidence matters only when individual finds are visually impressive.",
        ],
        cor: 2,
        steps: [
          { label: "Identify evaluative language across the whole passage", body: "Don't stop at the critics' view in the first paragraph — track what the author says throughout.", highlight: "That judgement is too simple." },
          { label: "Find the author's positive judgement", body: "The author clearly approves of the survey's contribution.", highlight: "it has already transformed knowledge of the moor" },
          { label: "Find the author's reservations", body: "The author also stresses costs and the need for scrutiny.", highlight: ["does not mean the development poses no archaeological cost", "Nor should funding by a developer make scrutiny unnecessary"] },
          { label: "Match to an option", body: "C — 'valuable, although its funding and effects require scrutiny' — preserves both sides. A and B are extremes the author explicitly rejects. D contradicts the author's view that unremarkable finds together are significant." },
          { label: "Final answer → C", body: "C captures the author's balanced position: the survey has real value and has produced real knowledge, but the development's costs and the funding relationship both warrant continued scrutiny. Answer: C." },
        ],
        answer: "C — The survey is valuable, although its funding and the development's effects require scrutiny.",
        answerNote: "The author calls dismissal 'too simple', praises the survey's knowledge contribution, but also insists on scrutiny and acknowledges archaeological cost. C preserves all three elements.",
      },
      {
        format: "mcq",
        passage: OPEN_TEXTBOOKS,
        question: "How does the author regard open textbooks?",
        opts: [
          "A. As inherently superior to commercial textbooks in accuracy.",
          "B. As potentially valuable when supported by proper editorial systems.",
          "C. As financially costless for both students and institutions.",
          "D. As too fragmented to be suitable for university teaching.",
        ],
        cor: 1,
        steps: [
          { label: "Locate the author's qualified conclusion", body: "The final paragraph is the author's verdict.", highlight: "openness permits institutions to build quality while widening access—provided they accept the labour and accountability that serious publishing requires." },
          { label: "Identify the condition attached", body: "The word 'provided' introduces the condition — proper editorial work must be done.", highlight: "provided they accept the labour and accountability that serious publishing requires" },
          { label: "Match to an option", body: "B — 'potentially valuable when supported by proper editorial systems' — accurately paraphrases 'permits quality... provided they accept the labour'.", highlight: "The strongest case for open textbooks is not that openness automatically creates quality." },
          { label: "Eliminate A, C and D", body: "A claims automatic accuracy — contradicted by 'neither guarantees a good book'. C ignores production costs ('Free to the student does not mean free to produce'). D turns a possible risk into a universal rejection.", highlight: ["neither guarantees a good book", "'Free to the student' does not mean 'free to produce'"] },
          { label: "Final answer → B", body: "B correctly captures conditional support. The author approves of openness's potential but insists on the editorial work that makes quality possible. Answer: B." },
        ],
        answer: "B — As potentially valuable when supported by proper editorial systems.",
        answerNote: "The author acknowledges real benefits but insists that 'openness permits quality' only when institutions accept the labour and accountability. B is the only option that preserves this conditional support.",
      },
      {
        format: "mcq",
        passage: POETRY_TRANSLATION,
        question: "Which description best characterises the author's attitude towards the translation software?",
        opts: [
          "A. Uncritical enthusiasm for replacing human translators.",
          "B. Complete rejection of any computational aid in literary work.",
          "C. Cautious acceptance of the software as a tool under human responsibility.",
          "D. Indifference to whether publishers disclose machine assistance.",
        ],
        cor: 2,
        steps: [
          { label: "Separate the author's voice from the two extreme positions", body: "The creators emphasise speed. Reviewers say exclude machines. The author's own position is between these extremes.", highlight: ["Its creators emphasise speed", "Some reviewers respond that machines can never translate poetry"] },
          { label: "Find the author's acceptance", body: "The author acknowledges the software can be useful.", highlight: ["may become a useful instrument", "rapid alternatives can reveal choices a translator had not considered"] },
          { label: "Find the author's conditions", body: "Acceptance is conditional on disclosure and human responsibility.", highlight: ["Publishers should therefore identify machine-assisted translations and retain a human translator", "Readers may reasonably wish to know who took responsibility for those decisions"] },
          { label: "Eliminate A, B and D", body: "A and B are the rejected extremes. D contradicts the explicit recommendation for disclosure.", highlight: "Publishers should therefore identify machine-assisted translations" },
          { label: "Final answer → C", body: "C — 'cautious acceptance as a tool under human responsibility' — exactly matches: the software may help, but human judgement and transparent attribution must remain in control. Answer: C." },
        ],
        answer: "C — Cautious acceptance of the software as a tool under human responsibility.",
        answerNote: "The author says the software 'may become a useful instrument' but insists publishers must identify its use and retain a human translator. This is acceptance, not enthusiasm or rejection.",
      },
    ],
    practice: [
      {
        passage: WEXFORD_MUSEUM,
        question: "Which option best describes the author's overall attitude towards the recommendation system?\n\nA. Enthusiastic acceptance without reservation.\nB. Conditional support accompanied by concern about bias and transparency.\nC. Neutral description without any recommendation.\nD. Opposition to all forms of guidance inside museums.",
        opts: [
          "A. Enthusiastic acceptance without reservation.",
          "B. Conditional support accompanied by concern about bias and transparency.",
          "C. Neutral description without any recommendation.",
          "D. Opposition to all forms of guidance inside museums.",
        ],
        cor: 1,
        explanation: "B. The author recommends continuing but only with publication of how recommendations are generated, broader digitisation and monitoring. That is conditional support. C is wrong because the author makes explicit recommendations. D is contradicted by the author's approval of the experiment continuing.",
      },
      {
        passage: WEXFORD_MUSEUM,
        question: "How does the author treat the director's claim that the system will 'democratise discovery'?\n\nA. As a proven description of the trial's outcome.\nB. As an attractive aim that has not yet been fully demonstrated.\nC. As an intentionally dishonest statement.\nD. As irrelevant because visitors refuse to use handheld guides.",
        opts: [
          "A. As a proven description of the trial's outcome.",
          "B. As an attractive aim that has not yet been fully demonstrated.",
          "C. As an intentionally dishonest statement.",
          "D. As irrelevant because visitors refuse to use handheld guides.",
        ],
        cor: 1,
        explanation: "B. The author calls the ambition 'appealing' but says the language 'gets ahead of the evidence'. This is qualified approval of the aim, not proof of the outcome. C invents dishonesty; D contradicts the evidence that visitors did enter new galleries.",
      },
      {
        passage: WEXFORD_MUSEUM,
        question: "Which statement would the author be most likely to support?\n\nA. Algorithms should replace curators because digital recommendations are neutral.\nB. The experiment should end unless every object is equally popular.\nC. Recommendation systems can continue if their operation and effects are open to examination.\nD. Visitors were completely free from influence before the system was introduced.",
        opts: [
          "A. Algorithms should replace curators because digital recommendations are neutral.",
          "B. The experiment should end unless every object is equally popular.",
          "C. Recommendation systems can continue if their operation and effects are open to examination.",
          "D. Visitors were completely free from influence before the system was introduced.",
        ],
        cor: 2,
        explanation: "C. The final paragraphs argue for continued use with transparency and scrutiny. A contradicts the claim that the algorithm is not neutral. B invents an impossible condition. D is explicitly contradicted — labels and gallery layout have always directed attention.",
      },
      {
        passage: WEXFORD_MUSEUM,
        question: "What is the author's attitude towards the curator's concern about a 'contest for clicks'?\n\nA. The concern is legitimate but does not by itself justify rejecting the system.\nB. The concern is absurd because recommendation systems cannot shape attention.\nC. The concern proves that printed trails should also be removed immediately.\nD. The concern is more important than every potential benefit of the trial.",
        opts: [
          "A. The concern is legitimate but does not by itself justify rejecting the system.",
          "B. The concern is absurd because recommendation systems cannot shape attention.",
          "C. The concern proves that printed trails should also be removed immediately.",
          "D. The concern is more important than every potential benefit of the trial.",
        ],
        cor: 0,
        explanation: "A. The concern is described as 'not trivial', showing the author takes it seriously. But the author then qualifies it and continues to support a controlled experiment. A preserves both parts of that judgement. B and D are extremes the author avoids; C misreads the author's point about existing guidance.",
      },
    ],
  },

  // ── 5. MEANING IN CONTEXT ────────────────────────────────────────────────
  {
    key: "meaning-in-context",
    label: "Meaning in Context",
    formats: ["mcq"],
    tagline: "Cover the word, predict the gap — then find the option that preserves the sentence's logic and tone.",
    whatItTests: "Your ability to determine what a word or phrase means from its **role in the sentence** and surrounding context — not from its standard dictionary definition, which may be different or broader.",
    howToIdentify: "A word or phrase is highlighted or quoted and the question asks: 'What does X most nearly mean in this context?' or 'In the context of the passage, X is best interpreted as…' The target is usually a single word or short phrase.",
    method: [
      { title: "Step 1 — Return to the exact location", body: "Never answer from the word alone. Go back to the passage." },
      { title: "Step 2 — Read the complete sentence", body: "Then read at least one sentence before and after. A word's meaning depends on the logical relationship the sentence creates — cause, contrast, consequence or condition." },
      { title: "Step 3 — Cover the word and predict the gap", body: "Hide the target word and ask: what meaning would make this sentence work? Form your own answer before reading the options." },
      { title: "Step 4 — Substitute and test each option", body: "Place each option back into the sentence. The correct option maintains the original logic, preserves the tone and does not change the relationship between clauses." },
      { title: "Step 5 — Use contrast and examples to decide", body: "Words such as *but*, *rather*, *although* and *in other words* often reveal the intended meaning. Reject dictionary meanings that do not fit." },
    ],
    traps: [
      "**Default meaning** — defaulting to the word's most common meaning without checking the specific sentence context.",
      "**Missed negative** — missing a negative that flips the word's usual implication.",
      "**False synonym** — selecting a synonym that sounds right but changes the logical relationship.",
      "**Clause blindness** — ignoring clause structure — who does what to whom changes the meaning significantly.",
      "**Literal vs figurative** — taking a figurative phrase too literally, or a literal phrase too figuratively.",
    ],
    shortcut: "**Cover the target word.** What would you fill in to make the sentence work? Now find the option that matches.",
    passage: EXPLORERS_NOTEBOOKS,
    workedQs: [
      {
        format: "mcq",
        passage: POTTERY,
        question: "In the passage, what does 'bottleneck' most nearly mean?",
        opts: [
          "A. A narrow part of the workshop through which pots had to be carried.",
          "B. The stage that restricted the overall rate at which work could be completed.",
          "C. A defect caused when a vase neck cools too rapidly.",
          "D. A temporary fall in the number of pieces being made.",
        ],
        cor: 1,
        steps: [
          { label: "Return to the exact location and read the sentence", body: "Read the sentence containing 'bottleneck' and the sentences around it.", highlight: "During the winter exhibition period, the kilns became the collective's bottleneck." },
          { label: "Read the surrounding context to understand what happened", body: "The following sentences explain the effect: demand rose but the kilns' cycle time stayed fixed, causing work to accumulate.", highlight: ["Demand for firing rose sharply, while the time required for each firing cycle remained fixed.", "Shelves of dry work accumulated even though members were producing no faster than usual."] },
          { label: "Cover the word and predict the meaning", body: "What would make this sentence work? The kilns became the 'thing that slowed everything else down' — the constraining stage in the whole process." },
          { label: "Test each option by substituting", body: "B — 'the stage that restricted the overall rate' — fits exactly. A forces a literal pottery/workshop meaning. C invents a manufacturing defect. D says members produced less — contradicted by 'producing no faster than usual'.", highlight: "members were producing no faster than usual" },
          { label: "Final answer → B", body: "B describes the kilns as the constraining stage — the figurative meaning that makes the paragraph coherent. Answer: B." },
        ],
        answer: "B — The stage that restricted the overall rate at which work could be completed.",
        answerNote: "Work accumulated because every piece needed limited kiln time, while other production continued. The kilns were the constraining stage — the figurative meaning of 'bottleneck'.",
      },
      {
        format: "mcq",
        passage: SHADOW_ARCHIVE,
        question: "What does 'shadow archive' mean as used in the passage?",
        opts: [
          "A. A forged set of recordings designed to imitate the museum's holdings.",
          "B. Recordings that exist outside the formally catalogued collection.",
          "C. Audio that is too faint to be restored.",
          "D. A secret collection deliberately hidden from all researchers.",
        ],
        cor: 1,
        steps: [
          { label: "Return to the defining moment — read the examples after the colon", body: "The passage defines the phrase through examples immediately after introducing it.", highlight: "unlabelled cassettes kept in kitchen drawers, rehearsal recordings held by musicians and copies exchanged privately among former colleagues" },
          { label: "Identify the shared feature of all examples", body: "All examples share one feature: they exist outside the donated, labelled museum collection.", highlight: "outside official catalogues" },
          { label: "Cover the phrase and predict the meaning", body: "These items sit alongside the official collection but outside it — 'parallel collection beyond the formal archive'." },
          { label: "Reject the distractor meanings", body: "D says 'secret collection deliberately hidden' — but the very next paragraph says the phrase does not imply secrecy. A says 'forged' — no evidence. C says 'too faint' — no evidence.", highlight: "The phrase does not imply secrecy in every case." },
          { label: "Final answer → B", body: "B — 'recordings that exist outside the formally catalogued collection' — matches both the defining examples and the author's explicit clarification about secrecy. Answer: B." },
        ],
        answer: "B — Recordings that exist outside the formally catalogued collection.",
        answerNote: "The examples all share location outside the museum's formal holdings. The passage also explicitly states the phrase does not imply secrecy, ruling out D.",
      },
      {
        format: "mcq",
        passage: STONEBRIDGE,
        question: "In this context, 'elasticity' refers to the tradition's:",
        opts: [
          "A. Ability to adapt while retaining recognisable continuity.",
          "B. Use of ingredients with a flexible texture.",
          "C. Decline caused by departures from a single authentic recipe.",
          "D. Dependence on stretching the historical evidence dishonestly.",
        ],
        cor: 0,
        steps: [
          { label: "Read the full sentence containing 'elasticity'", body: "Read the sentence and what immediately follows.", highlight: "For historian Laleh Morris, this elasticity does not make the supper fraudulent." },
          { label: "Identify the contrast the sentence sets up", body: "The sentence says elasticity does not equal fraud — so elasticity must describe change that is compatible with authenticity.", highlight: ["Traditions may preserve a sequence, a social role or a method of preparation even when ingredients change.", "neighbours still cook in shared ovens, carry dishes to the hall in procession"] },
          { label: "Cover the word and predict the meaning", body: "The tradition has changed ingredients but kept practices — 'capacity to change without losing its essential character'." },
          { label: "Test A against the surrounding examples", body: "A — 'ability to adapt while retaining recognisable continuity' — matches: ingredients changed, but procession and social roles continued.", highlight: ["substituted smoked herring", "replaced the fish with baked roots", "still cook in shared ovens, carry dishes to the hall in procession"] },
          { label: "Eliminate B, C and D", body: "B is an unrelated literal meaning (ingredient texture). C says elasticity means decline — contradicted by Morris's defence. D says dishonesty — contradicted by 'honest adaptation'.", highlight: "She nevertheless distinguishes honest adaptation from careless invention" },
        ],
        answer: "A — Ability to adapt while retaining recognisable continuity.",
        answerNote: "Morris says elasticity does not make the supper fraudulent. Ingredients changed but cooking practices, procession and social roles continued — adapting without losing continuity.",
      },
    ],
    practice: [
      {
        passage: EXPLORERS_NOTEBOOKS,
        question: "What does the editor mean by 'roads not taken'?\n\nA. Routes that explorers were physically unable to travel.\nB. Ideas or interpretations considered but excluded from the final report.\nC. Notebooks that were lost while explorers were travelling.\nD. Search links that no longer lead to a digital page.",
        opts: [
          "A. Routes that explorers were physically unable to travel.",
          "B. Ideas or interpretations considered but excluded from the final report.",
          "C. Notebooks that were lost while explorers were travelling.",
          "D. Search links that no longer lead to a digital page.",
        ],
        cor: 1,
        explanation: "B. The surrounding sentence refers to crossed-out identifications, uncertain measurements and questions omitted from published accounts. 'Roads not taken' therefore means abandoned lines of thought, not literal routes.",
      },
      {
        passage: EXPLORERS_NOTEBOOKS,
        question: "In the second paragraph, what does 'flatten a page' most nearly mean?\n\nA. Physically damage the original notebook.\nB. Make every digital image the same size.\nC. Reduce a complex page to isolated searchable text.\nD. Correct uncertain measurements automatically.",
        opts: [
          "A. Physically damage the original notebook.",
          "B. Make every digital image the same size.",
          "C. Reduce a complex page to isolated searchable text.",
          "D. Correct uncertain measurements automatically.",
        ],
        cor: 2,
        explanation: "C. The following examples show search separating a plant name from sketches, ink changes and later corrections. 'Flatten' describes loss of the page's relationships and complexity — reducing it to isolated lines of text.",
      },
      {
        passage: EXPLORERS_NOTEBOOKS,
        question: "What is meant by the notebooks gaining 'currency' as searchable sources?\n\nA. They become more useful and widely consulted.\nB. They acquire a stated financial value.\nC. They record the currencies used by explorers.\nD. They become more recent than the published reports.",
        opts: [
          "A. They become more useful and widely consulted.",
          "B. They acquire a stated financial value.",
          "C. They record the currencies used by explorers.",
          "D. They become more recent than the published reports.",
        ],
        cor: 0,
        explanation: "A. The contrast is between becoming searchable (gained currency) and losing awareness of physical arrangement. 'Currency' therefore means increased use, relevance or circulation — not money or recency.",
      },
      {
        passage: EXPLORERS_NOTEBOOKS,
        question: "In the final sentence, what does 'the surrounding record' refer to?\n\nA. Only the line containing the searched plant name.\nB. The financial records of the digitisation project.\nC. The wider page and neighbouring material around a retrieved detail.\nD. Every exploration report ever published.",
        opts: [
          "A. Only the line containing the searched plant name.",
          "B. The financial records of the digitisation project.",
          "C. The wider page and neighbouring material around a retrieved detail.",
          "D. Every exploration report ever published.",
        ],
        cor: 2,
        explanation: "C. The project keeps full-page images and neighbouring pages visible. The phrase refers to the contextual material — sketch, ink changes, later notes — that surrounds an isolated search result.",
      },
    ],
  },

  // ── 6. COMPARISONS & RELATIONSHIPS ──────────────────────────────────────
  {
    key: "comparisons",
    label: "Comparisons & Relationships",
    formats: ["tf", "mcq"],
    tagline: "Compare the right groups with the right measure — name the relationship the passage actually states.",
    whatItTests: "Your ability to compare groups accurately using the **right measure**, and to identify precisely what **type of relationship** the passage states — not what you might expect from the topic.",
    howToIdentify: "Look for numbers, dates or percentages in the statement, or comparison words: *more, less, higher, lower, greater, before, after*. Questions may ask about changes over time, relative rankings, or the relationship between events.",
    method: [
      { title: "Step 1 — Name the two sides", body: "Write or mentally label A and B. Do not compare a figure for A with the wrong measure for B." },
      { title: "Step 2 — Identify the comparison measure", body: "Are you comparing a number, proportion, rate, change, date, opinion or outcome? Swapping any one of these produces a wrong answer." },
      { title: "Step 3 — Preserve the direction", body: "Translate the statement into a simple form such as A > B, A earlier than B, or both A and B share X." },
      { title: "Step 4 — Locate both pieces of evidence", body: "Do not answer after finding information about only one side." },
      { title: "Step 5 — Check whether the relationship is stated or merely assumed", body: "A difference between two groups does not by itself prove what caused the difference." },
    ],
    traps: [
      "**Absolute vs percentage** — a large total change can correspond to a small percentage, and vice versa.",
      "**Reversed direction** — correctly finding the figures but reversing which is larger.",
      "**Different measures** — comparing cost in one group with revenue in another.",
      "**Different baselines** — assuming equal changes mean equal final values.",
      "**Sequence as cause** — treating 'followed by' as proof of causation.",
    ],
    shortcut: "Highlight: the **groups**, the **measure**, and the **time period**. Calculate only on those three. Then **name** the relationship — don't invent it.",
    passage: HALDEN_MERROW,
    workedQs: [
      {
        passage: DESALINATION,
        question: "Vessa relied less on purchased electricity but adjusted its output less rapidly than Orlin.",
        steps: [
          { label: "Name the two sides and identify both comparison dimensions", body: "A = Vessa, B = Orlin. Two dimensions: (1) purchased electricity use, and (2) speed of adjusting output. Both must be checked." },
          { label: "Find evidence for the electricity comparison", body: "Locate the sentence comparing electricity use for each plant.", highlight: ["Vessa bought less electricity because much of its heat would otherwise have been released by the factory", "Its pumps, however, used more purchased electricity per litre than Vessa's system."] },
          { label: "Find evidence for the output-speed comparison", body: "Locate the sentence describing how quickly each plant can change output.", highlight: ["Orlin required less land and could alter its output quickly when demand changed", "starting and stopping the thermal process took longer"] },
          { label: "Check the direction of both comparisons", body: "Electricity: Vessa bought less — correct, matches 'relied less'. Speed: Orlin could alter output quickly while Vessa took longer — so Vessa adjusted less rapidly. Both halves hold." },
          { label: "Classify → TRUE", body: "Both parts of the statement preserve the correct direction. Answer: TRUE." },
        ],
        answer: "TRUE",
        answerNote: "Vessa bought less electricity (confirmed) and took longer to start and stop (confirmed). Both comparisons are correctly stated.",
      },
      {
        passage: SCHOOL_LUNCH,
        question: "East Mere spent less on ingredients per meal and also used fewer staff hours per meal than Brookfield.",
        steps: [
          { label: "Name the two sides and identify both comparison dimensions", body: "A = East Mere, B = Brookfield. Two dimensions: (1) ingredient cost per portion, (2) staff hours per meal." },
          { label: "Find evidence for ingredient cost", body: "Locate the sentence giving ingredient cost per portion.", highlight: "East Mere spent more on ingredients per portion but had fewer meals left uneaten." },
          { label: "Find evidence for staffing", body: "Locate the sentence giving staffing cost per meal.", highlight: "East Mere did not have lower total staffing costs: maintaining three separate kitchens required more staff hours per meal." },
          { label: "Compare each claim with the passage", body: "The statement says East Mere spent less — the passage says East Mere spent more. The statement says East Mere used fewer staff hours — the passage says more staff hours per meal. Both are reversed." },
          { label: "Classify → FALSE", body: "Both comparisons in the statement are directly contradicted. Answer: FALSE." },
        ],
        answer: "FALSE",
        answerNote: "East Mere spent more on ingredients per portion and required more staff hours per meal — both are the opposite of what the statement claims.",
        trap: "The timetable change is real — but the statement gives the wrong reason. Read the stated cause carefully before answering.",
      },
      {
        format: "mcq",
        passage: GREENRISE_FIELDWAY,
        question: "According to the passage, which comparison is correct?",
        opts: [
          "A. Greenrise uses more public-supply water and less electricity per kilogram.",
          "B. Fieldway has no energy use because its lettuce grows outdoors.",
          "C. Greenrise uses less public-supply water but more electricity per kilogram.",
          "D. Fieldway sends all surplus lettuce to waste.",
        ],
        cor: 2,
        steps: [
          { label: "Build a comparison frame for each option", body: "Split each option into the quantities being compared: water use and electricity use per kilogram." },
          { label: "Find the water evidence", body: "Locate the sentence about public-supply water.", highlight: "Greenrise uses less water drawn from the public supply because it recirculates most irrigation." },
          { label: "Find the electricity evidence", body: "Locate the sentence about electricity use.", highlight: "Its electricity use is considerably higher, mainly because of lighting and climate control." },
          { label: "Test C: both directions correct", body: "Greenrise: less public-supply water (confirmed) AND more electricity (confirmed). C keeps both directions right. A reverses them both.", highlight: ["Greenrise uses less water drawn from the public supply", "Its electricity use is considerably higher"] },
          { label: "Eliminate B and D", body: "B ignores that Fieldway uses a diesel tractor and refrigerated storage. D changes 'sometimes sends surplus to a processor' into 'all surplus to waste'.", highlight: ["Fieldway uses little electricity on site but relies on a diesel tractor and refrigerated storage", "Fieldway sometimes sends surplus lettuce to a processor"] },
        ],
        answer: "C — Greenrise uses less public-supply water but more electricity per kilogram.",
        answerNote: "Both directions are confirmed by the passage. A reverses both; B ignores Fieldway's tractor and storage; D overstates 'sometimes' as 'all'.",
      },
    ],
    practice: [
      {
        passage: HALDEN_MERROW,
        question: "A higher proportion of Merrow's planted trees survived for three years than Halden's.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. The stated survival proportions are 88% in Merrow and 81% in Halden. The statement compares proportions, and Merrow's is higher.",
      },
      {
        passage: HALDEN_MERROW,
        question: "Despite its lower survival percentage, Halden had more surviving programme trees than Merrow after three years.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. Halden had 81% of 1,200 = approximately 972 surviving trees. Merrow had 88% of 900 = 792. Halden therefore had more surviving trees even though its survival percentage was lower.",
      },
      {
        passage: HALDEN_MERROW,
        question: "Canopy cover increased more at the monitored streets in Merrow than at those in Halden.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. The monitored streets gained six percentage points in Halden and nine in Merrow. The statement stays limited to monitored streets and compares the same measure — both conditions hold.",
      },
      {
        passage: HALDEN_MERROW,
        question: "The review established that contractor watering produces higher tree survival than resident watering.",
        opts: ["True", "False", "Can't Tell"],
        cor: 2,
        explanation: "Can't Tell. Merrow had contractor watering and higher survival, but the programmes also differed in species, location, soil preparation and duration of support. The review explicitly warned against assigning the difference to any single factor. Causation is not established.",
      },
    ],
  },

  // ── 7. SCOPE & EVIDENCE ──────────────────────────────────────────────────
  {
    key: "scope",
    label: "Scope & Evidence",
    formats: ["tf", "mcq"],
    tagline: "Ask three questions: who was studied, what was measured, does the statement stay within those boundaries?",
    whatItTests: "Your ability to recognise what evidence **can and cannot establish** — specifically whether findings extend beyond the studied group, whether language overstates certainty, and whether missing information means **False** or **Can't Tell**.",
    howToIdentify: "Look for certainty words in the statement: 'proves', 'all', 'will definitely', 'every', 'none'. Or the statement extends findings to a group, place or time that was not studied.",
    method: [
      { title: "Step 1 — Define the study's exact scope", body: "Note exactly who or what was studied: sample size and age group, location and time period. Everything outside these boundaries is off-limits." },
      { title: "Step 2 — Identify what was measured vs excluded", body: "Look for explicit statements of what the study did NOT measure. An excluded variable cannot be concluded from — even if it seems related." },
      { title: "Step 3 — Check language strength", body: "Compare the certainty word in the **statement** against the **passage**. Statement: 'will', 'proves', 'all'. Passage: 'may', 'suggests', 'associated with'. Any upgrade in strength is a red flag." },
      { title: "Step 4 — Apply the scope test", body: "Statement applies to a group not studied → Can't Tell. Passage actively contradicts the statement → False. Statement stays within the studied scope → True." },
      { title: "Step 5 — Missing info = Can't Tell, not False", body: "**False** requires a **direct contradiction**. If the passage simply doesn't mention something, that gap produces **Can't Tell**." },
    ],
    traps: [
      "**Silence = False** — missing information gives Can't Tell, not False.",
      "**Over-extension** — extending local or limited findings to a broader population or different context.",
      "**Certainty upgrade** — upgrading 'may' to 'will', or 'expected to' to 'definitely'.",
      "**Hidden qualifiers** — missing words like 'only', 'every' or 'none' that turn a partial truth into a false claim.",
      "**Context transfer** — applying a one-time or single-location result to an entirely different setting.",
    ],
    shortcut: "Three questions: **Who was studied? What was measured? Does the statement stay within those boundaries?** Anything outside → **Can't Tell**.",
    passage: ORCHARDS,
    workedQs: [
      {
        passage: AIR_CLEANERS,
        question: "The trial proved that portable air cleaners reduce illness-related absence among all primary-school pupils.",
        steps: [
          { label: "Mark the strength words in the statement", body: "Three strength words need checking: 'proved', 'illness-related' and 'all primary-school pupils'. Each one can independently invalidate the statement." },
          { label: "Define the study's exact scope", body: "What was actually studied?", highlight: "Researchers installed portable air cleaners in eight classrooms at one primary school during a six-week winter trial." },
          { label: "Check what was measured and what was excluded", body: "The study measured particles and recorded absence, but explicitly did not measure causes of absence.", highlight: ["The trial collected no information about pupils' symptoms, home air quality or causes of absence", "It did not attribute the difference in absence to the machines."] },
          { label: "Compare statement against scope", body: "'Proved' overclaims (the report explicitly refused causation). 'Illness-related' substitutes an unmeasured outcome for the recorded one. 'All primary-school pupils' expands far beyond eight classrooms at one school." },
          { label: "Classify → FALSE", body: "The passage actively contradicts all three strength claims — it explicitly states causation was not attributed. Answer: FALSE." },
        ],
        answer: "FALSE",
        answerNote: "The report explicitly refused to attribute the absence difference to the machines, and only measured particle counts — not illness-related absence. 'Proved', 'illness-related' and 'all primary-school pupils' are all directly contradicted.",
      },
      {
        passage: HYBRID_WORK,
        question: "The company considered hybrid working workable for the two departments that participated.",
        steps: [
          { label: "Check the scope of the statement", body: "The statement refers only to 'the two departments that participated' — not the whole company. This is the important limit to verify." },
          { label: "Locate the company's own conclusion", body: "Find where the company characterised its findings.", highlight: "It therefore described the findings as evidence that hybrid work was feasible for the two participating departments, not as proof that it would improve performance across the company." },
          { label: "Match the statement's language to the passage", body: "'Workable' accurately paraphrases 'feasible'. The statement does not claim universal performance improvement — it stays within the scope.", highlight: "evidence that hybrid work was feasible for the two participating departments" },
          { label: "Confirm the statement does not exceed the scope", body: "The passage contrasts 'feasible for two departments' with 'proof across the company'. The statement uses the smaller, accurate scope." },
          { label: "Classify → TRUE", body: "The statement matches the passage's population (two departments) and its cautious language ('feasible' = 'workable'). Answer: TRUE." },
        ],
        answer: "TRUE",
        answerNote: "'Workable' accurately paraphrases 'feasible'. The statement keeps its claim within the two departments the company itself named — not the whole company.",
      },
      {
        format: "mcq",
        passage: SCREENS,
        question: "Which conclusion is justified by the study's findings?",
        opts: [
          "A. Evening phone use causes sleep problems in every age group.",
          "B. Heavier evening phone use was associated with later sleep in the pupils studied.",
          "C. Watching videos is the only screen activity affecting sleep.",
          "D. All pupils using phones for two hours slept badly.",
        ],
        cor: 1,
        steps: [
          { label: "Test A — check population and causal claim", body: "A says 'causes' and 'every age group'. The study only included 14–16 year olds and researchers recommended a controlled follow-up. Both claims exceed the evidence.", highlight: ["A research team investigated evening screen use among 240 pupils aged 14 to 16 from four secondary schools", "They recommended a controlled follow-up study in which participants would be assigned different screen-use limits."] },
          { label: "Test B — read the researchers' own conclusion", body: "B mirrors the researchers' own wording exactly.", highlight: "The researchers concluded that heavier evening phone use was associated with later sleep among the participating pupils." },
          { label: "Test C — check what was actually measured", body: "The app could not distinguish videos from homework. 'Only' and the content-type claim both exceed what was measured.", highlight: "The application recorded screen activity but not what pupils were doing. It could not distinguish between homework, messaging, videos or reading." },
          { label: "Test D — check for variation", body: "'All pupils slept badly' is contradicted — there was considerable variation within both groups.", highlight: "However, there was considerable variation within both groups." },
          { label: "Final answer → B", body: "B matches the sample (pupils studied), the relationship (associated, not caused), and the cautious language the researchers used. Answer: B." },
        ],
        answer: "B — Heavier evening phone use was associated with later sleep in the pupils studied.",
        answerNote: "B is the researchers' own conclusion, preserved verbatim in scope and language. A, C and D each expand beyond what was measured or claim causation without justification.",
      },
    ],
    practice: [
      {
        passage: ORCHARDS,
        question: "The project proved that pollinator corridors increase apple yields throughout the country.",
        opts: ["True", "False", "Can't Tell"],
        cor: 1,
        explanation: "False. Harvested yield did not differ significantly during the study, the orchards came from one region, and the researchers called for wider randomised trials. The statement changes the outcome (yield), expands the population (throughout the country) and claims causation — all three are contradicted.",
      },
      {
        passage: ORCHARDS,
        question: "All participating managers recorded their pesticide use accurately.",
        opts: ["True", "False", "Can't Tell"],
        cor: 2,
        explanation: "Can't Tell. Managers completed forms, but the records were not independently checked against purchase records. The passage neither proves that every form was accurate nor states that any manager was inaccurate.",
      },
      {
        passage: ORCHARDS,
        question: "The findings are consistent with flower corridors increasing common wild-bee abundance in the participating orchards.",
        opts: ["True", "False", "Can't Tell"],
        cor: 0,
        explanation: "True. This matches the researchers' own limited conclusion: 'consistent with pollinator corridors improving the abundance of common wild bees'. The statement says 'consistent with', refers to common wild bees, and keeps the claim within the participating orchards.",
      },
      {
        passage: ORCHARDS,
        question: "The study eliminated pre-existing differences between participating and comparison orchards as an explanation for the results.",
        opts: ["True", "False", "Can't Tell"],
        cor: 1,
        explanation: "False. The groups were not randomly assigned, and participating orchards were already more likely to have existing wildflower margins before the project began. Pre-existing differences were therefore not eliminated — the passage directly states this limitation.",
      },
    ],
  },
];

export type VRNavGroup = {
  type: "tf" | "mcq";
  label: string;
  subtypes: string[];
};

export const VR_NAV: VRNavGroup[] = [
  {
    type: "tf",
    label: "True / False / Can't Tell",
    subtypes: VR_SUBTYPES.filter(s => s.formats.includes("tf")).map(s => s.key),
  },
  {
    type: "mcq",
    label: "Multiple Choice",
    subtypes: VR_SUBTYPES.filter(s => s.formats.includes("mcq")).map(s => s.key),
  },
];

export function getSubtype(key: string): VRSubtype | undefined {
  return VR_SUBTYPES.find(s => s.key === key);
}
