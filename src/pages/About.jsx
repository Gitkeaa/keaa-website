import { Link } from 'react-router-dom';
import { Linkedin, Mail, ShieldCheck, Globe2, Factory, Handshake } from 'lucide-react';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import { PANEL_CARD } from '../components/ui/panelCard';
import PurposePath from '../components/about/PurposePath';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { company, managingDirectors, chairmanMessage } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import Photo from '../components/ui/Photo';
import { useLT } from '../i18n/LocaleContext';

/**
 * The public About page at /about: KEAA's story, leadership and managing directors, the
 * chairman's message, purpose and values, and company stats.
 *
 * Rendered by App.jsx on the /about route. Content is read from data/company.js (company,
 * leadership, managingDirectors, chairmanMessage); edit the copy there and reorder sections below.
 */

const whoWeAre = [
  { title: 'Quality First', desc: 'We follow strict quality standards in every stage of production.' },
  { title: 'Global Reach', desc: 'Serving customers across 42+ countries with consistent reliability.' },
  { title: '6 Manufacturing Units', desc: '100,000+ sq. m of in-house facilities in Ludhiana, Punjab.' },
  { title: 'Reliable Partner', desc: 'Long-term partnerships built on trust, since 2003.' },
];

/* Icons are positional rather than a field on the objects above, so the copy stays free of
   presentation and the same four strings can be rendered without icons anywhere else. */
const WHO_WE_ARE_ICONS = [ShieldCheck, Globe2, Factory, Handshake];

/* The angled strip beside the copy. Four frames, ordered to read process → product →
   automation → output rather than as four interchangeable factory shots. Chosen for
   brightness: the earlier set (steelFrame, weldersFactory) rendered near-black once the
   skew-crop zoomed into their shadows, so the strip read as a dark block instead of the
   reference's vivid one. `steelFrame` is swapped for the brighter `factoryMachines`. */
const COLLAGE = [
  { src: img.metalSparks, alt: 'Sparks from steel cutting on the shop floor' },
  { src: img.scaffoldRacks, alt: 'Finished scaffolding tubes racked for dispatch' },
  { src: img.factoryMachines, alt: 'The manufacturing floor and machinery' },
  { src: img.weldersFactory, alt: 'Welding in the production hall' },
];

const manufacturingStrength = [
  'Advanced In-house Manufacturing Facilities',
  'Dedicated Tool Room & R&D Centre',
  'In-house Hot Dip Galvanization Plant',
  'Material Testing & Quality Inspection Lab',
  'Certified Welders & Skilled Technical Workforce',
  'State-of-the-Art CNC & Automated Machinery',
  'Europe Office / Warehouse'
];

export default function About() {
  const lt = useLT('about');

  useSEO({
    title: lt('seo.title', 'About Us'),
    description:
      lt('seo.description', 'Two decades of in-house manufacturing excellence. Learn KEAA International\'s journey, leadership team, vision and certifications.'),
  });

  return (
    <>
      {/* PAGE OPENER — a flat, branded header, not the old image banner.
          Breadcrumb and eyebrow sit above the title; the intro sits alongside it on desktop
          so the first fold is type rather than a stock welding photo. The page's single h1
          lives here — PageHero used to own it. A hairline closes the header off from the
          first content section without a full band change. */}
      <section className="border-b border-navy-100 pt-9 sm:pt-11">
        <div className="container-page pb-12 sm:pb-14">
          <nav aria-label={lt('breadcrumb.label', 'Breadcrumb')}>
            <ol className="flex items-center gap-2 text-xs text-muted">
              <li>
                <Link to="/" className="transition-colors hover:text-primary-dark">
                  {lt('breadcrumb.home', 'Home')}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="font-medium text-text" aria-current="page">
                {lt('breadcrumb.aboutUs', 'About Us')}
              </li>
            </ol>
          </nav>

          <div className="mt-9 grid gap-x-12 gap-y-6 lg:grid-cols-2 lg:items-end">
            <Reveal>
              <span className="eyebrow text-primary-darker">{lt('hero.eyebrow', 'About Us')}</span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-text sm:text-5xl xl:text-[3.5rem]">
                {lt('hero.title1', 'Building Strength.')}
                <br />
                {lt('hero.title2', 'Delivering Trust.')}
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="body-copy lg:pb-1.5">
                {lt('hero.intro', 'At KEAA International, we combine engineering expertise, in-house manufacturing and uncompromising quality to deliver scaffolding, formwork and industrial hardware that build a safer, stronger world.')}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE KEAA — copy + navy pillar card on the left, angled photo collage right */}
      <section id="who-we-are" className="overflow-hidden pt-16 sm:pt-20 lg:pt-24">
        {/* `items-stretch` (not center): the collage fills the column's full height so its
            top and bottom line up with the copy block and the navy card beside it. Centering
            left the fixed-height strip floating, so its lower edge fell below the card's. */}
        <div className="container-page grid items-stretch gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
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
                {lt('why.eyebrow', 'Why Choose KEAA')}
              </span>
              <span aria-hidden className="h-px w-16 bg-primary/50" />
            </span>

            {/* One colour across the whole headline — the accent span on "Global Reach" is
                gone. It was the design's only two-tone heading, and every other h2 on the
                site sets solid `text-text`. */}
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-text sm:text-5xl">
              {lt('why.title1', 'Engineering Excellence')}
              <br />
              {lt('why.title2', 'with Global Reach')}
            </h2>

            <p className="body-copy mt-6">
              {lt('why.p1', 'For over two decades, the KEAA International name has stood for engineering precision, manufacturing strength and close customer partnership. With entrepreneurial thinking, reliability and a genuine passion for the people we serve, we have grown into a trusted  manufacturer and exporter of scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware.')}
            </p>

            {/* The four pillars, on the deep navy ground — one considered statement rather
                than four loose tiles. Navy is also what lets the icons carry real colour:
                `primary` is only 3.89:1 on white but 4.75:1 here. */}
            <div className="mt-10 rounded-card bg-surface-deep p-6 sm:p-8">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-white/10">
                {whoWeAre.map((w, i) => {
                  const Icon = WHO_WE_ARE_ICONS[i];
                  return (
                    <li key={w.title} className={i > 0 ? 'xl:pl-8' : ''}>
                      <Icon aria-hidden className="h-7 w-7 text-primary" strokeWidth={1.5} />
                      <h3 className="mt-4 text-sm font-semibold text-white">{lt(`who.${i}.title`, w.title)}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/65">{lt(`who.${i}.desc`, w.desc)}</p>
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
          <Reveal delay={0.1} className="lg:h-full">
            {/* `lg:h-full` so the strip matches the left column's height exactly (its bottom
                meets the navy card's bottom); the fixed `h-[26rem]` still governs the mobile
                stack, where the two are no longer side by side. */}
            <div className="flex h-[26rem] -skew-x-[7deg] gap-2 overflow-hidden lg:h-full">
              {COLLAGE.map((c, i) => (
                <div key={c.alt} className="relative flex-1 overflow-hidden">
                  {/* `brightness-110` lifts the moody stock frames toward the reference's
                      vivid look; `scale-125` still covers the corners the skew exposes. */}
                  <img
                    src={c.src}
                    alt={lt(`collage.${i}.alt`, c.alt)}
                    loading="lazy"
                    className="h-full w-full skew-x-[7deg] scale-125 object-cover brightness-110"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* BUILT ON TRUST — the remaining company narrative, with the headline figures.
          The copy runs the FULL page width now, as two columns of prose, rather than a narrow
          column squeezed into the left half beside the stats card. The figures then sit in
          their own full-width band directly below it. */}
      <section className="section-pad bg-surface-tint">
        <div className="container-page">
          <Reveal>
            <span className="flex items-center gap-4">
              <span className="eyebrow text-primary-darker">
                {lt('trust.eyebrow', 'Built on Trust. Driven by Excellence.')}
              </span>
            </span>
            <span aria-hidden className="mt-3 block h-px w-16 bg-primary/50" />
            {/* One single full-width column. Both sentences run as one continuous paragraph —
                "…globally operating business." flows straight into "More than 150…" with no
                break between them. `max-w-none` releases the 768px measure `.body-copy` clamps
                to, so the copy fills the container edge to edge. */}
            <div className="mt-6">
              <p className="body-copy max-w-none">
                {lt('trust.p1', 'Since our foundation in 2003, our headquarters and 100,000+ sq. m of in-house manufacturing in Ludhiana, India. More than 1000 skilled professionals working in the company, serving customers in over 42 countries. Under the promise of delivering the best service to every client, our team tackles the daily challenges of the construction process together with contractors, builders, scaffolders and engineers worldwide.')}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-12 rounded-card border border-navy-100 bg-white p-8 shadow-card">
              <ul className="grid grid-cols-2 gap-y-10 sm:grid-cols-2 xl:grid-cols-4 xl:divide-x xl:divide-navy-100">
                {company.stats.slice(0, 4).map((s, i) => (
                  /* Number leads, big and bold; the label sits under it in the muted tone. */
                  <li key={s.label} className={`min-w-0 ${i > 0 ? 'xl:pl-6' : ''}`}>
                    <p className="font-display text-3xl font-bold leading-none text-text">
                      <AnimatedCounter value={s.value} />
                    </p>
                    <p className="mt-1.5 text-xs leading-snug text-muted">{lt(`trust.stats.${i}.label`, s.label)}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* JOURNEY TIMELINE — the horizontal rail that used to sit on the Home page, moved here
          so the story lives in one place. Numbered steps run above a hairline, and each dot is
          punched out of that line by a ring in the section's own background colour, so the rail
          appears to break at the dot rather than run underneath it. Hence the explicit
          `bg-surface-bright` — the ring has to match whatever is behind it.

          Placed directly after "Built on Trust", ahead of "Why KEAA Stands Apart": the story
          (who we became) reads before the capability claim (why we are different). */}
      <section id="journey" className="section-pad bg-surface-bright">
        <div className="container-page">
        <div className={PANEL_CARD}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.68fr)_minmax(0,1.32fr)] lg:items-start lg:gap-14">
          <Reveal>
            <span className="eyebrow text-primary-darker">{lt('journey.eyebrow', 'Our Journey')}</span>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-text sm:text-4xl">
              {lt('journey.title1', 'From Vision to')}
              <br />
              {lt('journey.title2', 'Global Impact')}
            </h2>
            <p className="body-copy mt-5 max-w-[24rem]">
              {lt('journey.p1', 'Our journey is built on a foundation of hard work, innovation and a relentless focus on our customers.')}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="relative grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5">
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
                  <h3 className="mt-1 font-display text-sm font-bold text-text">{lt(`journey.timeline.${i}.title`, t.title)}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink">{lt(`journey.timeline.${i}.desc`, t.desc)}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
        </div>
        </div>
      </section>

      {/* WHY KEAA STANDS APART */}
      <section className="section-pad overflow-hidden">
        <div className="container-page">
        <div className={PANEL_CARD}>
          <div>
            <Reveal className="max-w-3xl">
              <span className="eyebrow text-primary-darker">
                {lt('apart.eyebrow', 'Why KEAA Stands Apart')}
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-text">
                {lt('apart.title', 'Complete Production Control, In-House')}
              </h3>
              <p className="body-copy mt-3">
                {lt('apart.p1', 'Unlike conventional manufacturers, KEAA controls the complete production process in-house, ensuring consistent quality, faster lead times and dependable performance across every product line.')}
              </p>
            </Reveal>
            <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {manufacturingStrength.map((m, i) => (
                <StaggerItem key={m}>
                  {/* Flat inside the panel — see the note on the vision columns. */}
                  <div className="flex h-full items-center gap-3">
                    <p className="border-l-2 border-primary/40 pl-4 text-body-compact font-medium leading-snug text-text">{lt(`apart.items.${i}`, m)}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
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
              eyebrow={lt('leadership.eyebrow', 'Leadership')}
              title={lt('leadership.title', 'Leadership That Inspires Excellence')}
              className="!mx-0"
            />
            <div className="mt-6 space-y-5">
              <p className="body-copy max-w-none">
                {lt('leadership.p1', 'Behind every successful project is a leadership team driven by vision, innovation, and engineering excellence. At KEAA International, our leaders combine strategic thinking with deep manufacturing expertise to deliver high-quality solutions, foster continuous improvement, and create lasting value for customers worldwide.')}
              </p>
              <p className="body-copy max-w-none">
                {lt('leadership.p2', 'With decades of industry experience, they empower our people, embrace advanced technologies, and uphold the highest standards of quality, integrity, and operational excellence. Their commitment to innovation and customer success continues to strengthen KEAA International’s position as a trusted engineering and manufacturing partner, serving industries across 42+ countries.')}
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
              <Photo
                src={chairmanMessage.photo}
                cloudinaryId={chairmanMessage.cloudinaryId}
                alt={lt('chairman.photoAlt', '{name}, KEAA International', { name: chairmanMessage.name || lt('chairman.photoAltFallback', 'Chairman') })}
                /* A fixed 400px column on desktop, full width on a phone. */
                sizes="(min-width: 1024px) 400px, 90vw"
                width={800}
                className="aspect-square w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow text-primary-darker">
              {lt('chairman.eyebrow', 'Message from Chairman, keaa international Pvt. Ltd.')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">
              {lt('chairman.title', 'A Legacy of Trust & Quality')}
            </h2>
            <p className="body-copy mt-4">{lt('chairman.message', chairmanMessage.message)}</p>
            <p className="mt-5 font-display font-semibold text-navy-800">
              {chairmanMessage.name ? (
                <>
                  {chairmanMessage.name}
                  <span className="block text-sm font-normal text-muted">{lt('chairman.role', chairmanMessage.role)}</span>
                </>
              ) : (
                <>{lt('chairman.role', chairmanMessage.role)}</>
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
                        <Photo
                          src={m.photo}
                          cloudinaryId={m.cloudinaryId}
                          alt={lt('directors.photoAlt', '{name}, {role}', { name: m.name, role: lt(`directors.${i}.role`, m.role) })}
                          sizes="(min-width: 1024px) 400px, 90vw"
                          width={800}
                          className="aspect-square w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    {/* Only the photograph swaps sides on the second row. The copy stays
                        left-aligned in both: right-aligning a paragraph leaves a ragged left
                        edge, so the eye has to hunt for the start of every line. */}
                    <div className={flip ? 'lg:order-1' : ''}>
                      <span className="eyebrow text-primary-darker">{m.name}</span>
                      <p className="body-copy mt-4">{lt(`directors.${i}.message`, m.message)}</p>
                      {/* Designation only — the name is already the eyebrow above this message,
                          so repeating it here printed the name twice. */}
                      <p className="mt-5 text-sm font-medium text-muted">{lt(`directors.${i}.role`, m.role)}</p>
                      {/* Both addresses were already in data/company.js and neither reached
                          the page, so a buyer who wanted to write to a Managing Director had
                          no way to. Each link is rendered only when its field is filled, so
                          blanking one in the data removes it here rather than leaving a
                          control that goes nowhere. */}
                      <div className="mt-4 flex items-center gap-3">
                        {m.linkedin && (
                          <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-colors hover:border-primary/60 hover:text-primary-dark"
                            aria-label={lt('directors.linkedinLabel', '{name} LinkedIn', { name: m.name })}
                          >
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email.trim()}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-colors hover:border-primary/60 hover:text-primary-dark"
                            /* The address itself goes in the accessible name, not just
                               "email": a screen reader user deciding whether to click, and
                               speech input aiming at it, both need to hear which address. */
                            aria-label={lt('directors.emailLabel', 'Email {name} at {email}', {
                              name: m.name,
                              email: m.email.trim(),
                            })}
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
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

    </>
  );
}
