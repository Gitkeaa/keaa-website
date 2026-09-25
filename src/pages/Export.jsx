import { Link } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import CtaBand from '../components/CtaBand';
import { company } from '../data/company';
import { img, atWidth, imgSrcSet } from '../data/images';
import { exportTermsPdfUrl, EXPORT_TERMS_PDF_FILENAME } from '../data/exportTerms';
import useSEO from '../hooks/useSEO';
import { absoluteUrl } from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * /export: the landing page for overseas buyers, importers and distributors.
 *
 * WHY THIS PAGE EXISTS
 * --------------------
 * Export enquiries were reachable only as a tab on /contact, which no search engine can rank
 * for "scaffolding exporter from India" because the page is titled Contact Us and is about a
 * form. Buyers in that market search for the capability, not for a contact form. This page
 * gives that intent a page of its own, with a title and description built around it.
 *
 * EVERY FIGURE HERE COMES FROM company.js
 * ---------------------------------------
 * Countries served, years in business, the certifications, the plant and the European sales
 * office are all read from the same record the About, Manufacturing and Certifications pages
 * read, so this page cannot drift from them and nothing on it is invented.
 *
 * DELIBERATELY ABSENT: Incoterms, lead times and the port of loading. The SEO brief asks for
 * them and they would genuinely help a buyer, but they are not published anywhere on this
 * site and guessing a commercial term would be worse than omitting it. They belong in
 * company.js once the owner confirms them, and this page will render them without further
 * change: see EXPORT_TERMS below.
 */

/**
 * Commercial terms, filled in from company.js when they exist. Left empty, the section does
 * not render at all rather than showing an empty shell or a placeholder.
 */
const EXPORT_TERMS = [
  { key: 'incoterms', label: 'Incoterms offered', value: company.export?.incoterms },
  { key: 'leadTime', label: 'Typical lead time', value: company.export?.leadTime },
  { key: 'portOfLoading', label: 'Port of loading', value: company.export?.portOfLoading },
  { key: 'packing', label: 'Export packing', value: company.export?.packing },
].filter((t) => t.value);

const statValue = (label) => company.stats.find((s) => s.label === label)?.value;

export default function Export() {
  const lt = useLT('export');

  const countries = statValue('Countries Exported');
  const termsPdf = exportTermsPdfUrl();

  const highlights = [
    {
      key: 'reach',
      value: countries,
      title: lt('highlights.reach.title', 'Countries served'),
      desc: lt('highlights.reach.desc', 'Shipments to construction, agriculture and hardware buyers across Europe, the Middle East, Africa and Asia.'),
    },
    {
      key: 'since',
      value: String(company.founded),
      title: lt('highlights.since.title', 'Exporting since'),
      desc: lt('highlights.since.desc', 'An established supplier, not a trading intermediary. Everything shipped is made in our own plant.'),
    },
    /* The third card named the European sales office and was removed with the office's
       address card further down the page, on the owner's instruction. Two cards is a
       deliberate count, not a leftover: the grid below sizes itself from this array. */
  ].filter((h) => h.value);

  useSEO({
    title: lt('seo.title', 'Scaffolding & Formwork Exporter from India'),
    description: lt(
      'seo.description',
      `ISO 9001:2015 certified manufacturer exporting scaffolding, formwork, safety and livestock housing products to ${countries || '40+'} countries. Request an export quotation.`
    ),
    breadcrumbs: [{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.current', 'Export') }],
    /**
     * The page is a service offering rather than a product, so it is described as a Service
     * whose provider is the Organization already declared site-wide in index.html, and whose
     * area served is the export markets. Nothing here duplicates that Organization block.
     */
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Export of scaffolding, formwork, safety and livestock housing products',
      serviceType: 'Manufacturing and export',
      provider: {
        '@type': 'Organization',
        name: company.name,
        url: absoluteUrl('/'),
      },
      areaServed: 'Worldwide',
      url: absoluteUrl('/export'),
    },
  });

  return (
    <>
      {/* A type-led opener rather than a photo banner: this page is read by buyers comparing
          suppliers, and the first thing they look for is what is made and where it ships. */}
      <section className="section-pad border-b border-navy-100 bg-gradient-to-b from-navy-50/60 via-white to-white">
        <div className="container-page">
          <nav aria-label={lt('crumbs.aria', 'Breadcrumb')} className="text-sm text-muted">
            <Link to="/" className="transition-colors hover:text-primary-dark">
              {lt('crumbs.home', 'Home')}
            </Link>
            <span aria-hidden className="mx-2">/</span>
            <span className="text-navy-800">{lt('crumbs.current', 'Export')}</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <div>
              <span className="eyebrow text-primary-darker">{lt('hero.eyebrow', 'Export')}</span>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {lt('hero.title', 'Scaffolding and formwork, exported from India')}
              </h1>
              <p className="body-copy mt-5">
                {lt(
                  'hero.body',
                  `KEAA International manufactures scaffolding systems, formwork accessories, safety products, livestock housing and garden hardware at its own plant in Ludhiana, and supplies them to buyers in ${countries || '40+'} countries. We work with importers, distributors, rental fleets and contractors, and quote against your drawings, standards and volumes.`
                )}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button to="/contact?tab=export">{lt('hero.cta', 'Request an export quotation')}</Button>
                <Button to="/downloads" variant="secondary">
                  {lt('hero.ctaSecondary', 'Download the catalogues')}
                </Button>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {highlights.map((h) => (
                <div key={h.key} className="rounded-card border border-navy-100 bg-white p-5 shadow-card">
                  <dt className="font-display text-2xl font-bold text-primary-dark">{h.value}</dt>
                  <dd className="mt-1">
                    <p className="text-sm font-semibold text-navy-800">{h.title}</p>
                    <p className="mt-1 text-sm text-muted">{h.desc}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* What a buyer checks before they send an RFQ: is this a real factory, and is the
          product certified to the standard their market enforces. Both answers already exist
          on this site; this page states them where the export buyer is reading. */}
      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow={lt('capability.eyebrow', 'Manufacturing')}
            title={lt('capability.title', 'Made in our own plant, not sourced')}
            desc={lt(
              'capability.desc',
              'Laser cutting, robotic welding, hot dip galvanizing, powder coating and electroplating are all in house, which is what lets us hold a specification across a full container load and repeat it on the next order.'
            )}
            className="!mx-0"
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: 'area', label: lt('capability.area', 'Covered area'), value: company.facilities.area },
              { key: 'units', label: lt('capability.units', 'Manufacturing units'), value: String(company.facilities.units) },
              { key: 'capacity', label: lt('capability.capacity', 'Annual capacity'), value: company.facilities.capacity },
              { key: 'galv', label: lt('capability.galvanizing', 'Galvanizing'), value: company.facilities.galvanizingBaths },
              { key: 'powder', label: lt('capability.powder', 'Powder coating'), value: company.facilities.powderCoating },
              { key: 'testing', label: lt('capability.testing', 'In-house testing'), value: company.facilities.testing },
            ]
              .filter((c) => c.value)
              .map((c) => (
                <Reveal key={c.key}>
                  <div className="h-full rounded-card border border-navy-100 bg-white p-5 shadow-card">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{c.label}</p>
                    <p className="mt-2 text-sm text-navy-800">{c.value}</p>
                  </div>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy-50/40">
        {/* Two columns from `lg`. The copy here runs to about half the width of a desktop
            container and the section left the other half empty, which read as a missing
            element rather than as space. The photograph is the welding floor because that is
            what the text beside it is about: EN 1090-2 / 3834-2 welders and product conformity.
            One column on smaller screens, image last, so the certifications stay first. */}
        <div className="container-page grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <div>
            <SectionHeading
              align="left"
              eyebrow={lt('standards.eyebrow', 'Compliance')}
              title={lt('standards.title', 'Certified for the markets we ship to')}
              desc={lt(
                'standards.desc',
                'Independently audited management systems, plus welding and product conformity assessed by European bodies. Full certificates are on the certifications page.'
              )}
              className="!mx-0"
            />

            <ul className="mt-8 flex flex-wrap gap-2.5">
              {company.certifications.map((c) => (
                <li
                  key={c.name}
                  className="rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-800"
                >
                  {c.name}
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-2 text-sm text-muted">
              {company.facilities.welders && <p>{company.facilities.welders}</p>}
              {company.facilities.quality && <p>{company.facilities.quality}</p>}
            </div>

            <Button to="/certifications" variant="secondary" className="mt-7">
              {lt('standards.cta', 'See the certificates')}
            </Button>
          </div>

          {/* `alt=""` and `aria-hidden`: the photograph illustrates the claim the text already
              makes in full, so announcing it again would only lengthen the section for a screen
              reader. `sizes` is the column's real width, not the viewport's, so a phone is not
              sent a desktop rendition of it. */}
          <div className="overflow-hidden rounded-card shadow-card">
            <img
              src={atWidth(img.weldersFactory, 1024)}
              srcSet={imgSrcSet(img.weldersFactory)}
              sizes="(min-width: 1024px) 26rem, 100vw"
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* The terms grid renders only once the owner has confirmed those values in company.js:
          an export page that states an Incoterm the company has not agreed to is worse than
          one that omits it, so nothing here is a placeholder. The download renders as soon as
          a PDF address exists, independently, because the two arrive at different times. */}
      {(EXPORT_TERMS.length > 0 || termsPdf) && (
        <section className="section-pad">
          <div className="container-page">
            <SectionHeading
              align="left"
              eyebrow={lt('terms.eyebrow', 'Shipping')}
              title={lt('terms.title', 'Commercial terms')}
              className="!mx-0"
            />
            {EXPORT_TERMS.length > 0 && (
              <dl className="mt-8 grid gap-5 sm:grid-cols-2">
                {EXPORT_TERMS.map((t) => (
                  <div key={t.key} className="rounded-card border border-navy-100 bg-white p-5 shadow-card">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                      {lt(`terms.${t.key}`, t.label)}
                    </dt>
                    <dd className="mt-2 text-sm text-navy-800">{t.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* Nothing renders while src/data/exportTerms.js is empty. A download button that
                leads to a missing file reads as a broken site to the buyer it is meant to
                reassure. `download` asks the browser to save rather than open it, and the
                filename is a readable one rather than a Cloudinary id. */}
            {termsPdf && (
              <a
                href={termsPdf}
                download={EXPORT_TERMS_PDF_FILENAME}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-dark px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-darker"
              >
                {lt('terms.download', 'Download Export Terms PDF')}
              </a>
            )}
          </div>
        </section>
      )}

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            align="left"
            eyebrow={lt('offices.eyebrow', 'Where we are')}
            title={lt('offices.title', 'Where we manufacture')}
            className="!mx-0"
          />
          {/* The European sales office card was removed on the owner's instruction, so this is
              the manufacturing address alone. `sm:grid-cols-2` went with it: a lone card in a
              two-column grid sits in the left half with an empty right half beside it.
              The `salesOffice` record it read from is gone from data/company.js entirely, and
              the privacy policy no longer claims an EU establishment. */}
          <div className="mt-8 grid max-w-xl gap-5">
            {[company.manufacturing].map((o) => (
              <address key={o.label} className="rounded-card border border-navy-100 bg-white p-5 not-italic shadow-card">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{o.label}</p>
                <p className="mt-2 text-sm text-navy-800">{o.line1}</p>
                <p className="text-sm text-navy-800">{o.line2}</p>
                {o.phone && <p className="mt-2 text-sm text-muted">{o.phone}</p>}
              </address>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={lt('cta.eyebrow', 'Export enquiries')}
        title={lt('cta.title', 'Tell us the specification and the volume')}
        desc={lt('cta.desc', 'Send drawings, standards or a parts list and we will come back with a quotation and a lead time.')}
        cta={{ label: lt('cta.label', 'Request an export quotation'), to: '/contact?tab=export' }}
      />
    </>
  );
}
