import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import CardRail from '../components/ui/CardRail';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { company } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

/** Read a headline figure out of company.stats by its label, so nothing is retyped here. */
const statValue = (label) => company.stats.find((s) => s.label === label)?.value;

/*
  ONE figure band for the whole page — every number lives in exactly one place. The old page
  stated the same figures twice (an inline 2x2 in the infrastructure block AND a closing
  "stats strip"), which is the number-level version of saying the same thing twice. All four
  are derived from company.js so the page and the data can never drift.
*/
const OUTPUT_FIGURES = [
  { value: String(company.facilities.units), label: 'Manufacturing units' },
  { value: company.facilities.area, label: 'Covered area' },
  { value: statValue('Skilled Employees'), label: 'Skilled employees' },
  { value: company.facilities.capacity, label: 'Annual capacity' },
].filter((f) => f.value);

/* The in-house capabilities that make KEAA vertically integrated — the real proof behind
   "we run the whole process ourselves". Straight from company.facilities. */
const CAPABILITIES = [
  company.facilities.galvanizingBaths,
  company.facilities.powderCoating,
  company.facilities.moldRooms,
];

/* One machinery photograph per company.machinery entry, index-matched. */
const machineryImages = [
  img.metalSparks,
  img.grinderMetal,
  img.weldersFactory,
  img.factoryMachines,
  img.metalPour,
  img.steelFrame,
];

const qaSteps = [
  'Raw material inspection and verification',
  'In-process quality control checks',
  'Final product testing to international standards',
  'Third-party inspection (SLV, Sigma Karlsruhe)',
];

export default function Manufacturing() {
  useSEO({
    title: 'Manufacturing',
    description:
      "Inside KEAA's 25,000 sq. m manufacturing facilities: advanced machinery, certified welders and ISO 9001:2015 quality control.",
  });

  return (
    <>
      <GalleryHero
        eyebrow="Manufacturing"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Manufacturing' }]}
        slides={heroSlides.manufacturing}
        stats={[
          { value: '5', label: 'Manufacturing Facilities' },
          { value: 'ISO 9001', label: 'Certified Quality' },
          { value: 'EN 1090', label: 'Welding Standard' },
        ]}
        scrollTo="content"
      />

      {/* INFRASTRUCTURE — a portrait plant photo beside the overview, then the page's single
          figure band and the in-house capability list. No inline stats: the numbers all live
          in the one band below, not scattered through the prose. */}
      <section id="content" className="section-pad overflow-hidden">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Our Infrastructure"
                title="World-Class Manufacturing Facilities"
                desc="Five manufacturing units in Ludhiana, Punjab run the complete production process in-house, for precision engineering, consistent quality and on-time export delivery."
                className="!mx-0 max-w-none"
              />
              {/* The vertical-integration proof: the in-house capabilities, on the same
                  blue-hairline motif the quality list below uses, so the page reads as one
                  system. */}
              <ul className="mt-8 space-y-3">
                {CAPABILITIES.map((c) => (
                  <li key={c} className="border-l-2 border-primary/40 pl-4 text-body-compact text-ink">
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Portrait (3/4), deliberately NOT the 4/3 crop the machinery cards use, so the
                page's two photographic moments do not read as the same frame twice. */}
            <Reveal delay={0.1}>
              <ImagePlaceholder
                src={img.metalBuilding}
                label="Manufacturing plant, Ludhiana, Punjab"
                ratio="aspect-[3/4]"
                className="shadow-xl"
              />
            </Reveal>
          </div>

          {/* THE figure band — the only counters on the page, derived from company.js. Carries
              id="stats" because the nav's "Output at Scale" link points at /manufacturing#stats,
              and these figures ARE the output at scale. */}
          <div id="stats" className="mt-14 border-t border-navy-100 pt-10">
            <StaggerGroup className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {OUTPUT_FIGURES.map((f) => (
                <StaggerItem key={f.label}>
                  <p className="font-display text-3xl font-bold text-text sm:text-4xl">
                    <AnimatedCounter value={f.value} />
                  </p>
                  <p className="mt-2 text-body-compact text-ink">{f.label}</p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* PROCESS — the page's centrepiece, rebuilt from seven cramped columns into a vertical
          numbered ladder on the one dark band: a sticky heading on the left, the seven stages
          full-width on the right at real reading size. The big brand-blue numbers carry the
          sequence; the row dividers give it structure. */}
      <section id="process" className="section-pad bg-navy-900 text-white">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <Reveal>
              <SectionHeading
                light
                align="left"
                eyebrow="Our Manufacturing Process"
                title="From Raw Material to Reliable Products"
                desc="Seven controlled stages, every one in-house, from raw steel to dispatch."
                className="!mx-0 max-w-none"
              />
            </Reveal>
          </div>

          <div className="lg:col-span-8">
            <StaggerGroup stagger={0.06}>
              {company.processSteps.map((s, i) => (
                <StaggerItem
                  key={s.step}
                  className={`flex gap-6 py-6 sm:gap-8 ${
                    i === 0 ? '' : 'border-t border-white/10'
                  }`}
                >
                  <span
                    aria-hidden
                    className="w-14 flex-none font-display text-4xl font-bold leading-none text-primary sm:w-16 sm:text-5xl"
                  >
                    {s.step}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold text-white">{s.title}</h3>
                    <p className="mt-2 text-body-compact leading-relaxed text-white/70">{s.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* MACHINERY — a scroll-snap rail (ui/CardRail) with prev / dots / next, so six machines
          read as swipeable rather than a lopsided 4 + 2 grid. */}
      <section id="machinery" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Advanced Machinery" title="Powerful Machines. Precision Output." />
          </Reveal>
          <CardRail
            label="Advanced machinery"
            labels={company.machinery.map((m) => `Show ${m.name}`)}
          >
            {company.machinery.map((m, i) => (
              <div
                key={m.name}
                className="w-[82%] flex-none snap-start overflow-hidden rounded-card border border-navy-100 shadow-card transition-shadow hover:shadow-cardHover sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              >
                <ImagePlaceholder src={machineryImages[i]} label={m.name} ratio="aspect-[4/3]" />
                <div className="p-5">
                  <h4 className="font-display text-sm font-semibold text-text">{m.name}</h4>
                  <p className="mt-1.5 text-body-compact text-ink">{m.desc}</p>
                </div>
              </div>
            ))}
          </CardRail>
        </div>
      </section>

      {/* QUALITY & STANDARDS — type-led, no photograph, so it breaks the image-beside-copy
          rhythm the infrastructure block set. Four control stages as numbered tiles, then the
          accreditations spelled out beneath. */}
      <section id="quality" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Quality & Standards"
              title="Quality in Every Step"
              desc="Stringent quality control at every stage of manufacturing, backed by in-house tensile, compression, bend and weld-penetration testing, so every product meets global standards."
            />
          </Reveal>

          <StaggerGroup className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {qaSteps.map((q, i) => (
              <StaggerItem key={q}>
                <div className="h-full rounded-card border border-navy-100 p-6 shadow-card">
                  <span className="font-display text-2xl font-bold text-primary-dark">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-3 text-body-compact text-ink">{q}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <Reveal>
            <p className="mx-auto mt-10 max-w-3xl text-center text-body-compact text-ink">
              {company.facilities.welders}. {company.facilities.quality}.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
