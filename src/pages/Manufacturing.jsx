import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { company } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

const infraStats = [
  { value: '5', label: 'Manufacturing Facilities' },
  { value: '25,000 sq.m', label: 'Covered Area' },
  { value: '150+', label: 'Skilled Employees' },
  { value: '5,000+', label: 'MT Annual Production Capacity' },
];

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
  'Final product testing as per international standards',
  'Third-party inspection and certifications (SLV, Sigma Karlsruhe)',
];

export default function Manufacturing() {
  useSEO({
    title: 'Manufacturing',
    description:
      'Inside KEAA\'s 25,000 sq.m manufacturing facilities -- advanced machinery, certified welders and ISO 9001:2015 quality control.',
  });

  return (
    <>
      <PageHero
        eyebrow="Manufacturing"
        title="Advanced Manufacturing."
        accent="Built on Precision."
        desc="At KEAA International, our advanced manufacturing facilities, modern machinery and skilled workforce enable us to deliver superior quality products that meet global standards."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Manufacturing' }]}
        image={img.weldersFactory}
        stats={[
          { value: '5', label: 'Manufacturing Facilities' },
          { value: 'ISO', label: 'Certified Quality' },
          { value: 'EN 1090', label: 'Welding Standard' },
        ]}
      />

      {/* INFRASTRUCTURE */}
      <section className="section-pad overflow-hidden">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow text-primary-darker">
              Our Infrastructure
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">
              World-Class Manufacturing Facilities
            </h2>
            <p className="body-copy mt-4">
              Our two manufacturing units in Ludhiana, Punjab are equipped with modern
              infrastructure and in-house technology — including hot dip galvanizing baths,
              powder coating lines and dedicated mould rooms — to ensure precision engineering,
              consistent quality and timely delivery.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {infraStats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-text">
                    <AnimatedCounter value={s.value} />
                  </p>
                  <p className="text-body-compact text-ink">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ImagePlaceholder
              src={img.metalBuilding}
              label="Manufacturing plant — Ludhiana, Punjab"
              ratio="aspect-[4/3]"
              className="shadow-xl"
            />
          </Reveal>
        </div>
      </section>

      {/* PROCESS FLOW */}
      <section id="process" className="section-pad bg-navy-900 text-white">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              light
              eyebrow="Our Manufacturing Process"
              title="From Raw Material to Reliable Products"
            />
          </Reveal>
          <StaggerGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-7" stagger={0.06}>
            {company.processSteps.map((s) => (
              <StaggerItem key={s.step} className="relative flex flex-col items-center text-center">
                <span aria-hidden className="font-display text-sm font-bold text-primary">
                  {s.step}
                </span>
                <h4 className="mt-4 font-display text-sm font-semibold">{s.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">{s.desc}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* MACHINERY */}
      <section id="machinery" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Advanced Machinery" title="Powerful Machines. Precision Output." />
          </Reveal>
          {/* 4 columns, matching the Projects & Gallery tiles — the image ratio was already
              4/3, so the columns were the only reason a machinery card rendered ~120px
              wider than every other image tile on the site. Six items lay out 4 + 2, the
              same as the featured projects grid. */}
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {company.machinery.map((m, i) => (
              <StaggerItem key={m.name}>
                <div className="overflow-hidden rounded-card border border-navy-100 shadow-card transition-shadow hover:shadow-cardHover">
                  <ImagePlaceholder src={machineryImages[i]} label={m.name} ratio="aspect-[4/3]" />
                  <div className="p-5">
                    <h4 className="font-display text-sm font-semibold text-text">{m.name}</h4>
                    <p className="mt-1.5 text-body-compact text-ink">{m.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* QUALITY ASSURANCE */}
      <section className="section-pad overflow-hidden">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow text-primary-darker">
              Quality Assurance
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-text">Quality in Every Step</h2>
            <p className="body-copy mt-4">
              We follow stringent quality control procedures at every stage of manufacturing —
              backed by in-house tensile, compression, bend and weld-penetration testing — to
              ensure every product meets global standards.
            </p>
            <ul className="mt-6 space-y-3">
              {qaSteps.map((q) => (
                <li key={q} className="border-l-2 border-primary/40 pl-4 text-body-compact text-ink">
                  {q}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <ImagePlaceholder src={img.personTool} label="In-house testing & quality inspection" ratio="aspect-[4/3]" className="shadow-xl" />
          </Reveal>
        </div>
      </section>

      {/* STATS STRIP */}
      <section id="stats" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Manufacturing Statistics" title="Engineering Output at Scale" />
          </Reveal>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: '25,000 sq.m', label: 'Total Manufacturing Area' },
              { value: '6+', label: 'Core Machinery Lines' },
              { value: '5,000+ MT', label: 'Annual Production Capacity' },
              { value: '8', label: 'Certifications Held' },
            ].map((s) => (
              <StaggerItem key={s.label}>
                <div className="rounded-card border border-navy-100 p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
                  <p className="font-display text-xl font-bold text-text">{s.value}</p>
                  <p className="text-xs text-ink">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FINAL CTA */}
      <CtaBand
        title="Looking for a Reliable"
        accent="Manufacturing Partner?"
        desc="We are ready to support your business with quality products and on-time delivery."
        cta={{ label: 'Request a Quote', to: '/rfq' }}
      />
    </>
  );
}
