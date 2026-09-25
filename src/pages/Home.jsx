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
import CertificationStrip from '../components/home/CertificationStrip';
import useSEO from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';
import { certificationLogos } from '../data/certificationLogos';
import { cldImage } from '../data/cloudinary';
import { featuredProjects, featuredProjectImages } from '../data/content';

/** Same rule as CertificationStrip: an `id` may be a public_id or an already-built URL. */
const markSrc = (id, h) => (/^https?:\/\//.test(id) ? id : cldImage(id, { h, crop: 'fit' }));

/**
 * The public home page at the index route "/": assembles the landing sections in order.
 *
 * Rendered by App.jsx as the index route. The sections live in components/home/* and
 * data/*, so change their content there and reorder them in the JSX returned below.
 */

export default function Home() {
  const lt = useLT('home');
  useSEO({
    /**
     * The brand name is appended by useSEO, so it is deliberately NOT repeated here. It
     * used to be, which produced "KEAA International | ... | KEAA International", 88
     * characters, truncated in every search result and wasting the opening words on a
     * name nobody is searching for yet.
     *
     * The words that earn the click come first: what is made, and that it is made here
     * rather than resold.
     */
    title: lt('seo.title', 'Scaffolding & Formwork Manufacturer & Exporter'),
    description:
      lt('seo.description', 'ISO 9001:2015 certified manufacturer and exporter of scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware. Exporting to 42+ countries since 2003.'),
  });

  return (
    <>
      {/* HERO — branding experiment. Revert: restore the original <section> from git. */}
      <HomeHeroBrandTest />

      {/* CERTIFICATION STRIP — a calm trust line. Was a row of black-bordered cards that
          competed with the hero right above it; softened to a floating rail of accreditation
          marks with an edge fade so it reads as quiet reassurance. The full set with scopes
          lives in the Certifications section below and on /certifications, so this stays
          deliberately understated. Add a mark by pasting its Cloudinary key into
          data/certificationLogos.js — see CertificationStrip.jsx. */}
      <CertificationStrip />

      {/* WHO WE ARE + PRODUCT CATEGORIES — merged into one band. */}
      <CoreSolutions />
      {/* MANUFACTURING EXCELLENCE — capabilities and scale figures, all read from company.js.
          Placed before "Products at KEAA": the company pitch leads into how KEAA makes things,
          establishing the manufacturing strength before the catalogue shows what comes out of it. */}
      <ManufacturingBand />
      {/* PRODUCTS AT KEAA — the catalogue's shop window. With the manufacturing capability
          established just above, this answers "and here is what that produces". */}
      <ProductsShowcase />

      {/* FEATURED PROJECTS */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            {/* "Applications", not "Featured Projects": the entries below are the sectors the
                equipment is built for, not named jobs. See the note on featuredProjects in
                data/content.js for how to switch this back when real records exist. */}
            <SectionHeading eyebrow={lt('projects.eyebrow', 'Applications')} title={lt('projects.title', 'Where KEAA Equipment Is Used')} />
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
              {lt('global.eyebrow', 'Global Presence')}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-text">{lt('global.title', 'Serving Customers Worldwide')}</h3>
            <p className="mt-2 text-body-compact leading-relaxed text-ink">
              {lt('global.body', 'Trusted exports to 42+ countries across the Middle East, Europe, Africa and Asia.')}
            </p>
            <div className="my-6 flex flex-1 items-center overflow-hidden rounded-card bg-navy-50/30 p-4">
              <img
                src="/images/global-presence-map.png"
                alt={lt('global.mapAlt', 'KEAA global presence, export markets across 42+ countries')}
                loading="lazy"
                width={1200}
                height={355}
                className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {lt('global.countries', 'Countries Served')}
                  </p>
                  <p className="mt-0.5 font-display text-body-compact font-bold text-text">42+</p>
                </div>
                
              </div>
              <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {lt('global.clients', 'Happy Clients')}
                  </p>
                  <p className="mt-0.5 font-display text-body-compact font-bold text-text">1000+</p>
                </div>
            </div>
          </Reveal>

          {/* Certifications */}
          <Reveal delay={0.1} className="flex flex-col rounded-card border border-navy-100 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
            <span className="eyebrow text-primary-darker">
              {lt('certsCard.eyebrow', 'Certifications')}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-text">
              {lt('certsCard.title1', 'Certified for Quality - Committed to Excellence.')}
            </h3>
            <p className="mt-2 text-body-compact leading-relaxed text-ink">
              {lt('certsCard.body', 'Independently audited and certified by TÜV Rheinland and the Government of India.')}
            </p>
            {/* The marks themselves rather than their names — the same set as the strip under
                the hero, read from data/certificationLogos.js, so adding a mark there shows it
                in both places. The individual certificate documents are one click away behind
                "View All Certificates" below. */}
            <ul className="mt-6 grid grid-cols-3 gap-3">
              {certificationLogos.map((c) => (
                <li
                  key={c.name}
                  title={c.body}
                  className="flex items-center justify-center rounded-card border border-navy-100 bg-white px-2 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card"
                >
                  <img
                    src={markSrc(c.id, 96)}
                    srcSet={`${markSrc(c.id, 96)} 1x, ${markSrc(c.id, 192)} 2x`}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                    className="h-10 w-auto max-w-full object-contain"
                  />
                </li>
              ))}
            </ul>
            <Button to="/certifications" variant="ghost" size="sm" className="mt-auto pt-6 !px-0">
              {lt('certsCard.cta', 'View All Certificates')}
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
