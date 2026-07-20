import { Linkedin, ShieldCheck, Globe2, Factory, Handshake, Award, Maximize } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import CardRail from '../components/ui/CardRail';
import { PANEL_CARD } from '../components/ui/panelCard';
import PurposePath from '../components/about/PurposePath';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { company, leadership, managingDirectors, chairmanMessage } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

/**
 * How wide a leadership card sits on the rail: just under a full screen on a phone so the next
 * one peeks in and the rail is discoverable, then 2 / 3 / 4 across. The `calc` subtracts the
 * 1.5rem gaps so the cards land flush with the container edges.
 */
const TEAM_CARD_W =
  'w-[74%] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]';

/** Placeholder cards on the end of the rail, for team members not yet published. */
const OPEN_SLOTS = 4;

/**
 * The rail covers everyone except the CMD and the MDs. Those three carry the company's voice,
 * so they get a full message section with a large square portrait higher up the page rather
 * than a thumbnail on a rail — putting them in both read as a demotion.
 */
const TEAM = leadership.filter(
  (l) => l.role !== 'Chief Managing Director' && l.role !== 'Managing Director'
);

const whoWeAre = [
  { title: 'Quality First', desc: 'We follow strict quality standards in every stage of production.' },
  { title: 'Global Reach', desc: 'Serving customers across 42+ countries with consistent reliability.' },
  { title: '5 Manufacturing Units', desc: '25,000 sq. m of in-house facilities in Ludhiana, Punjab.' },
  { title: 'Reliable Partner', desc: 'Long-term partnerships built on trust, since 2003.' },
];

/* Icons are positional rather than a field on the objects above, so the copy stays free of
   presentation and the same four strings can be rendered without icons anywhere else. */
const WHO_WE_ARE_ICONS = [ShieldCheck, Globe2, Factory, Handshake];
const STAT_ICONS = [Award, Globe2, Factory, Maximize];

/* The angled strip beside the copy. Four frames, ordered to read process → product →
   automation → output rather than as four interchangeable factory shots. */
const COLLAGE = [
  { src: img.metalSparks, alt: 'Sparks from steel cutting on the shop floor' },
  { src: img.scaffoldRacks, alt: 'Finished scaffolding tubes racked for dispatch' },
  { src: img.weldersFactory, alt: 'Robotic welding cell in operation' },
  { src: img.steelFrame, alt: 'Galvanized steel components stacked in the yard' },
];

const manufacturingStrength = [
  'Advanced In-house Manufacturing Facilities',
  'Dedicated Tool Room & R&D Centre',
  'In-house Hot Dip Galvanization Plant',
  'Material Testing & Quality Inspection Lab',
  'Certified Welders & Skilled Technical Workforce',
  'State-of-the-Art CNC & Automated Machinery',
];

export default function About() {
  useSEO({
    title: 'About Us',
    description:
      'Two decades of in-house manufacturing excellence -- learn KEAA International\'s journey, leadership team, vision and certifications.',
  });

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Building Strength."
        accent="Delivering Trust."
        desc="At KEAA International, we combine engineering expertise, in-house manufacturing and uncompromising quality to deliver scaffolding, formwork and industrial hardware that build a safer, stronger world."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
        image={img.steelFrame}
      />

      {/* WHY CHOOSE KEAA — copy + navy pillar card on the left, angled photo collage right */}
      <section id="who-we-are" className="overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
          <Reveal>
            {/* Brand blue, not the gold this block was first built in. Gold reads as a
                second accent the rest of the site does not use — the token file calls it
                unsanctioned outside dark surfaces, and measured on white it is 1.93:1,
                which cannot legally carry text at all.

                The blues used here are the documented ones: `primary-darker` for the
                eyebrow, `primary-dark` (4.87:1 on white) for the heading accent, and
                `primary` for the icons on the navy card (4.75:1 on that ground). */}
            <span className="flex items-center gap-4">
              <span className="eyebrow text-primary-darker">
                Why Choose KEAA
              </span>
              <span aria-hidden className="h-px w-16 bg-primary/50" />
            </span>

            {/* One colour across the whole headline — the accent span on "Global Reach" is
                gone. It was the design's only two-tone heading, and every other h2 on the
                site sets solid `text-text`. */}
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-text sm:text-5xl">
              Engineering Excellence
              <br />
              with Global Reach
            </h2>

            <p className="body-copy mt-6">
              For over two decades, the KEAA International name has stood for engineering
              precision, manufacturing strength and close customer partnership. With
              entrepreneurial thinking, reliability and a genuine passion for the people we
              serve, we have grown into a trusted Indo-Dutch manufacturer and exporter of
              scaffolding systems, formwork accessories, safety products, livestock housing
              solutions and garden hardware.
            </p>

            {/* The four pillars, on the deep navy ground — one considered statement rather
                than four loose tiles. Navy is also what lets the icons carry real colour:
                `primary` is only 3.89:1 on white but 4.75:1 here. */}
            <div className="mt-10 rounded-card bg-surface-deep p-6 sm:p-8">
              <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-white/10">
                {whoWeAre.map((w, i) => {
                  const Icon = WHO_WE_ARE_ICONS[i];
                  return (
                    <li key={w.title} className={i > 0 ? 'xl:pl-8' : ''}>
                      <Icon aria-hidden className="h-7 w-7 text-primary" strokeWidth={1.5} />
                      <h3 className="mt-4 text-sm font-semibold text-white">{w.title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/65">{w.desc}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          {/* Angled collage. The whole strip is skewed and each photo is counter-skewed by
              the same amount, so the PANELS lean while the photographs stay upright —
              skewing the images themselves would visibly distort every machine in them.
              `scale` covers the corners the rotation would otherwise expose. */}
          <Reveal delay={0.1}>
            <div className="flex h-[26rem] -skew-x-[7deg] gap-2 overflow-hidden lg:h-[32rem]">
              {COLLAGE.map((c) => (
                <div key={c.alt} className="relative flex-1 overflow-hidden">
                  <img
                    src={c.src}
                    alt={c.alt}
                    loading="lazy"
                    className="h-full w-full skew-x-[7deg] scale-125 object-cover"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* BUILT ON TRUST — the remaining company narrative, with the headline figures */}
      <section className="section-pad bg-surface-tint">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <Reveal>
            <span className="flex items-center gap-4">
              <span className="eyebrow text-primary-darker">
                Built on Trust. Driven by Excellence.
              </span>
            </span>
            <span aria-hidden className="mt-3 block h-px w-16 bg-primary/50" />
            <p className="body-copy mt-6">
              Since our foundation in 2003, our headquarters and 25,000 sq. m of in-house
              manufacturing in Ludhiana, India — together with our European sales office in
              Eindhoven, the Netherlands — have steered the fortunes of our globally operating
              business.
            </p>
            <p className="body-copy mt-6">
              More than 150 skilled professionals work for us, serving customers in over 42
              countries. Under the promise of delivering the best service to every client, our
              team tackles the daily challenges of the construction process together with
              contractors, builders, scaffolders and engineers worldwide.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-card border border-navy-100 bg-white p-8 shadow-card">
              <ul className="grid gap-y-10 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-navy-100">
                {company.stats.slice(0, 4).map((s, i) => {
                  const Icon = STAT_ICONS[i];
                  return (
                    <li
                      key={s.label}
                      className={`flex items-center gap-4 xl:flex-col xl:items-start xl:gap-3 ${
                        i > 0 ? 'xl:pl-6' : ''
                      }`}
                    >
                      <span
                        aria-hidden
                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-primary/35 text-primary-dark"
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-2xl font-bold leading-none text-text">
                          <AnimatedCounter value={s.value} />
                        </p>
                        <p className="mt-1.5 text-xs leading-snug text-ink">{s.label}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* WHY KEAA STANDS APART */}
      <section className="section-pad overflow-hidden">
        <div className="container-page">
        <div className={PANEL_CARD}>
          {/* This used to be a `mt-16 border-t pt-12` divider inside the Who We Are panel.
              That panel is now its own section, so the rule and top margin are gone — the
              block opens its own card instead. */}
          <div>
            <Reveal className="max-w-3xl">
              <span className="eyebrow text-primary-darker">
                Why KEAA Stands Apart
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-text">
                Complete Production Control, In-House
              </h3>
              <p className="body-copy mt-3">
                Unlike conventional manufacturers, KEAA controls the complete production process
                in-house — ensuring consistent quality, faster lead times and dependable
                performance across every product line.
              </p>
            </Reveal>
            <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {manufacturingStrength.map((m) => (
                <StaggerItem key={m}>
                  {/* Flat inside the panel — see the note on the vision columns. */}
                  <div className="flex h-full items-center gap-3">
                    <p className="border-l-2 border-primary/40 pl-4 text-body-compact font-medium leading-snug text-text">{m}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
        </div>
      </section>

      {/* JOURNEY TIMELINE — the horizontal rail that used to sit on the Home page, moved here
          so the story lives in one place. Numbered steps run above a hairline, and each dot is
          punched out of that line by a ring in the section's own background colour, so the rail
          appears to break at the dot rather than run underneath it. Hence the explicit
          `bg-surface-bright` — the ring has to match whatever is behind it. */}
      <section id="journey" className="section-pad bg-surface-bright">
        <div className="container-page">
        <div className={PANEL_CARD}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:items-start lg:gap-14">
          <Reveal>
            <span className="eyebrow text-primary-darker">Our Journey</span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-text sm:text-4xl">
              From Vision to
              <br />
              Global Impact
            </h2>
            <p className="body-copy mt-5 max-w-[24rem]">
              Our journey is built on a foundation of hard work, innovation and a relentless focus
              on our customers.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
              {/* The rail the dots sit on. Desktop only — stacked items need no connector.
                  46px = step index (20) + mt-5 (20) + half the 12px dot. */}
              <span aria-hidden className="absolute inset-x-0 top-[46px] hidden h-px bg-navy-200 lg:block" />
              {company.timeline.map((t, i) => (
                <li key={t.year} className="relative">
                  <span aria-hidden className="block font-display text-sm font-bold leading-5 text-primary-dark">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden
                    className="relative z-10 mt-5 block h-3 w-3 rounded-full bg-primary-dark ring-4 ring-surface-raised"
                  />
                  <p className="mt-5 font-display text-lg font-bold text-primary-dark">{t.year}</p>
                  <h3 className="mt-1 font-display text-sm font-bold text-text">{t.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink">{t.desc}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        </div>
        </div>
      </section>

      {/* OUR PURPOSE — vision / mission / core values as a numbered path. Deliberately a
          full-bleed band rather than a PANEL_CARD: the connector and its background texture
          are the section's surface, so a panel around them would box a box. */}
      <PurposePath />

      {/* MESSAGE FROM THE CHAIRMAN — moved here from the Home page. It sits directly above the
          managing directors so the page reads Chairman → Managing Directors → Leadership Team,
          which is the order the company itself is structured in. */}
      <section className="section-pad overflow-hidden">
        <div className="container-page">
          {/* LEADERSHIP INTRO — opens the whole leadership run (Chairman → Managing Directors
              → Leadership Team), so it sits above the chairman rather than above the directors,
              and stays unpanelled: it is the section's opening statement, not one of its cards.
              `max-w-none` on each paragraph is what actually makes it run edge to edge —
              `.body-copy` clamps itself to a 768px reading measure in index.css. */}
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Leadership"
              title="Leadership That Inspires Excellence"
              className="!mx-0"
            />
            <div className="mt-6 space-y-5">
              <p className="body-copy max-w-none">
                Behind every successful project is a leadership team driven by vision, innovation,
                and engineering excellence. At KEAA International, our leaders combine strategic
                thinking with deep manufacturing expertise to deliver high-quality solutions,
                foster continuous improvement, and create lasting value for customers worldwide.
              </p>
              <p className="body-copy max-w-none">
                With decades of industry experience, they empower our people, embrace advanced
                technologies, and uphold the highest standards of quality, integrity, and
                operational excellence. Their commitment to innovation and customer success
                continues to strengthen KEAA International&rsquo;s position as a trusted
                engineering and manufacturing partner, serving industries across 42+ countries.
              </p>
            </div>
          </Reveal>

        <div className={`${PANEL_CARD} mt-12`}>
        <div className="grid items-center gap-10 lg:grid-cols-[400px_1fr]">
          <Reveal x={-20} y={0}>
            {/* Square, and the same frame the managing directors use below. Square because the
                supplied portraits are square: a 4:3 box would crop the top and bottom off a
                1:1 source. The column is 400px, so a 900×900 file still has better than 2×
                pixel density on a retina screen. */}
            <div className="group overflow-hidden rounded-card ring-1 ring-text/[0.08]">
              <img
                src={chairmanMessage.photo}
                alt={`${chairmanMessage.name || 'Chairman'} — KEAA International`}
                loading="lazy"
                className="aspect-square w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow text-primary-darker">
              Message from Chairman, keaa international Pvt. Ltd.
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">
              A Legacy of Trust &amp; Quality
            </h2>
            <p className="body-copy mt-4">{chairmanMessage.message}</p>
            <p className="mt-5 font-display font-semibold text-navy-800">
              {chairmanMessage.name ? (
                <>
                  — {chairmanMessage.name}
                  <span className="block text-sm font-normal text-muted">{chairmanMessage.role}</span>
                </>
              ) : (
                <>— {chairmanMessage.role}</>
              )}
            </p>
          </Reveal>
        </div>
        </div>
        </div>
      </section>

      {/* MESSAGE FROM MANAGING DIRECTORS */}
      <section id="leadership" className="section-pad overflow-hidden">
        <div className="container-page">
          {/* No heading here — the leadership intro above the chairman opens this whole run,
              and each message below is introduced by the director's own name. */}
          <div className={PANEL_CARD}>
          <div className="space-y-14">
            {managingDirectors.map((m, i) => {
              /* The chairman's block above sits photo-left, so the first director here flips to
                 photo-right and the second returns to photo-left. That makes the three messages
                 alternate left → right → left down the page instead of opening with two
                 photo-left blocks in a row. */
              const flip = i % 2 === 0;
              return (
                <Reveal key={m.name} delay={i * 0.1}>
                  <div
                    className={`grid items-center gap-10 ${
                      flip ? 'lg:grid-cols-[1fr_400px]' : 'lg:grid-cols-[400px_1fr]'
                    }`}
                  >
                    <div className={flip ? 'lg:order-2' : ''}>
                      {/* Same frame as the chairman above and the team cards below. */}
                      <div className="group overflow-hidden rounded-card ring-1 ring-text/[0.08]">
                        <img
                          src={m.photo}
                          alt={`${m.name} — ${m.role}`}
                          loading="lazy"
                          className="aspect-square w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    {/* Only the photograph swaps sides on the second row. The copy stays
                        left-aligned in both: right-aligning a paragraph leaves a ragged left
                        edge, so the eye has to hunt for the start of every line. */}
                    <div className={flip ? 'lg:order-1' : ''}>
                      <span className="eyebrow text-primary-darker">{m.name}</span>
                      <p className="body-copy mt-4">{m.message}</p>
                      <p className="mt-5 font-display font-semibold text-navy-800">
                        — {m.name}
                        <span className="block text-sm font-normal text-muted">{m.role}</span>
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-colors hover:border-primary/60 hover:text-primary-dark"
                          aria-label={`${m.name} LinkedIn`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEAM */}
      <section id="team" className="section-pad">
        <div className="container-page">
          {/* No heading. The directors' messages directly above already open the leadership
              run, so a second "Our Leadership Team / Experienced Leaders" title restated it.
              The rail still carries its own accessible name (`label` on CardRail), so the
              `/about#team` link from the nav panel lands on a labelled region. */}
          {/* Photo-led cards on a scrolling rail. Every name in the leadership list rides it,
              including the CMD and the MDs — they used to be filtered out here because they
              already have a message section above, but that left the rail reading as "everyone
              except the people in charge".

              Some of these people have no photograph on file yet. Rather than leave a hole, the
              same block renders their initials on the brand ground at the identical aspect
              ratio. Drop a file into that person's `photo` in data/company.js and it takes over
              with no change here. */}
          <CardRail
            label="Leadership team"
            labels={[
              ...TEAM.map((l) => `Show ${l.name}`),
              ...Array.from({ length: OPEN_SLOTS }, (_, i) => `Open position ${i + 1}`),
            ]}
          >
            {TEAM.map((l) => (
                <article key={l.name} className={`${TEAM_CARD_W} group flex flex-none snap-start flex-col overflow-hidden rounded-card ring-1 ring-text/[0.08] transition-all duration-300 hover:-translate-y-1 hover:ring-text/[0.16]`}>
                  {l.photo ? (
                    <img
                      src={l.photo}
                      alt={l.name}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950 font-display text-4xl font-bold tracking-[0.08em] text-primary-light"
                    >
                      {l.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  )}

                  <div className="flex flex-1 flex-col bg-navy-50 p-5">
                    <h3 className="font-display text-lg font-bold leading-snug text-text">{l.name}</h3>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-darker">
                      {l.role}
                    </p>
                    <p className="mt-3 text-body-compact leading-relaxed text-ink">{l.bio}</p>
                    {l.linkedin && (
                      <a
                        href={l.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex w-fit items-center gap-2 pt-4 text-navy-700 transition-colors hover:text-primary-darker"
                        aria-label={`${l.name} on LinkedIn`}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </article>
            ))}

            {/* Empty slots for the people still to be added. They are marked aria-hidden and
                carry no text, so a screen reader is never told about a person who is not there;
                sighted visitors read them as "more to come" rather than as broken cards. */}
            {Array.from({ length: OPEN_SLOTS }, (_, i) => (
              <div
                key={`slot-${i}`}
                aria-hidden
                className={`${TEAM_CARD_W} flex flex-none snap-start flex-col overflow-hidden rounded-card ring-1 ring-text/[0.06]`}
              >
                <span className="block aspect-[3/4] w-full bg-navy-50" />
                <div className="flex flex-1 flex-col gap-2.5 bg-navy-50 p-5">
                  <span className="block h-4 w-2/3 rounded-card bg-navy-100" />
                  <span className="block h-2.5 w-1/3 rounded-card bg-navy-100" />
                  <span className="mt-1.5 block h-2.5 w-full rounded-card bg-navy-100" />
                  <span className="block h-2.5 w-5/6 rounded-card bg-navy-100" />
                </div>
              </div>
            ))}
          </CardRail>
        </div>
      </section>

      {/* FINAL CTA. The old block carried a secondary "Contact Our Team" button in the
          `outline` variant, which is white-on-dark and would vanish on this light card.
          Contact is one click away from both the nav and the footer. */}
      <CtaBand
        title="Building Long-Term"
        accent="Partnerships Worldwide"
        desc="From concept to delivery, KEAA International combines engineering expertise, modern manufacturing and global export experience to provide reliable solutions trusted by customers across the world."
        note="Built for Safety. Built to Last."
        cta={{ label: 'Request a Quote', to: '/rfq' }}
      />
    </>
  );
}
