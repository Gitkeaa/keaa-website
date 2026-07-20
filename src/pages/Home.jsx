import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
// BRANDING EXPERIMENT: swap this import + the <HomeHeroBrandTest /> usage below to
// restore the original hero. Nothing else on the page depends on it.
import HomeHeroBrandTest from '../components/home/HomeHeroBrandTest';
import CoreSolutions from '../components/home/CoreSolutions';
import ProductsShowcase from '../components/home/ProductsShowcase';
import ManufacturingBand from '../components/home/ManufacturingBand';
import ProjectCarousel from '../components/home/ProjectCarousel';
import CtaBand from '../components/CtaBand';
import useSEO from '../hooks/useSEO';
import { company } from '../data/company';
import { featuredProjects, featuredProjectImages } from '../data/content';

const certificationCards = [
  { name: 'ISO 9001:2015', body: 'TÜV Rheinland' },
  { name: 'CE Certified', body: 'European Union' },
  { name: 'SLV Mannheim', body: 'Germany EN 1090' },
  { name: 'Sigma Karlsruhe', body: 'Germany EN 74' },
  { name: 'AEO Certificate', body: 'Govt. of India' },
  { name: 'Star Export House', body: 'Ministry of Commerce' },
  { name: 'BSCI Compliant', body: 'Social Standards' },
  { name: 'ETA Nailing Plates', body: 'Denmark' },
];

export default function Home() {
  useSEO({
    title: 'KEAA International | Scaffolding, Formwork & Industrial Manufacturer',
    description:
      'ISO 9001:2015 certified manufacturer and exporter of scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware. Exporting to 42+ countries since 2003.',
  });

  return (
    <>
      {/* HERO — branding experiment. Revert: restore the original <section> from git. */}
      <HomeHeroBrandTest />

      {/* CERTIFICATION STRIP — a calm trust line. Was a row of black-bordered cards that
          competed with the hero right above it; softened to muted names alone with an edge
          fade so it reads as quiet reassurance. The full set lives in the Certifications section
          below and on /certifications, so this stays deliberately understated. */}
      <div className="border-b border-navy-100 bg-white">
        <div className="container-page flex items-center gap-6 py-5 sm:gap-9">
          <span className="hidden flex-shrink-0 whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted sm:block">
            Certified &amp; Accredited
          </span>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-9">
              {[...certificationCards, ...certificationCards].map((c, i) => (
                <div key={i} className="flex items-center gap-2.5 opacity-60 transition-opacity duration-300 hover:opacity-100">
                  <span className="whitespace-nowrap text-xs font-semibold text-text">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* WHO WE ARE + PRODUCT CATEGORIES — merged into one band. */}
      <CoreSolutions />
      {/* PRODUCTS AT KEAA — the catalogue's shop window, straight after the company pitch:
          the visitor has just been told who KEAA is, so this is where "what do they make?"
          gets answered before the page moves on to how it is made. */}
      <ProductsShowcase />
      {/* MANUFACTURING EXCELLENCE — capabilities and scale figures, all read from company.js.
          Sits after "Products at KEAA": the visitor now knows what KEAA makes, so this is
          where how it is made belongs. */}
      <ManufacturingBand />

      {/* FEATURED PROJECTS */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Featured Projects" title="Trusted by Clients Worldwide" />
          </Reveal>
          {/* All six projects on one snap-scrolling rail — see ProjectCarousel for why this is
              a native scroll container rather than a transformed track. Every card already
              links to the gallery, so the old "View All Projects" button underneath was a
              third route to the same page and has gone. */}
          <ProjectCarousel projects={featuredProjects} images={featuredProjectImages} />
        </div>
      </section>

      {/* GLOBAL PRESENCE + CERTIFICATIONS */}
      <section className="section-pad">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          {/* Global presence */}
          <Reveal className="group flex flex-col rounded-card border border-navy-100 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
            <span className="eyebrow text-primary-darker">
              Global Presence
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-text">Serving Customers Worldwide</h3>
            <p className="mt-2 text-body-compact leading-relaxed text-ink">
              Trusted exports to 42+ countries across the Middle East, Europe, Africa and Asia.
            </p>
            <div className="my-6 flex flex-1 items-center overflow-hidden rounded-card bg-navy-50/30 p-4">
              <img
                src="/images/global-presence-map.png"
                alt="KEAA global presence — export markets across 42+ countries"
                loading="lazy"
                className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    Countries Served
                  </p>
                  <p className="mt-0.5 font-display text-body-compact font-bold text-text">42+</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    Happy Clients
                  </p>
                  <p className="mt-0.5 font-display text-body-compact font-bold text-text">1000+</p>
                </div>
              </div>
              <Button to="/about" variant="ghost" size="sm" className="!px-0">
                View Our Global Presence
              </Button>
            </div>
          </Reveal>

          {/* Certifications */}
          <Reveal delay={0.1} className="flex flex-col rounded-card border border-navy-100 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
            <span className="eyebrow text-primary-darker">
              Certifications
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-text">
              Certified for Quality. <span className="text-primary-dark">Committed to Excellence.</span>
            </h3>
            <p className="mt-2 text-body-compact leading-relaxed text-ink">
              Independently audited and certified by TÜV Rheinland and the Government of India.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {company.certifications.map((c) => (
                <a
                  key={c.name}
                  href={c.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-card border border-navy-100 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card"
                >
                  <span className="mt-3 block truncate text-xs font-bold text-navy-800">{c.name}</span>
                  <span className="block truncate text-[10px] text-muted">{c.body}</span>
                </a>
              ))}
            </div>
            <Button to="/certifications" variant="ghost" size="sm" className="mt-auto pt-6 !px-0">
              View All Certificates
            </Button>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <CtaBand />
    </>
  );
}
