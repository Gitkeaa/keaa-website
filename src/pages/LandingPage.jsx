import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import useSEO, { absoluteUrl } from '../hooks/useSEO';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import { getLandingPage } from '../data/landingPages';
import { getProductById } from '../data/productHelpers';
import { productPath } from '../data/productPaths';
import { img } from '../data/images';
import { useLT } from '../i18n/LocaleContext';

/**
 * One component for all nine keyword landing pages. The content lives in data/landingPages.js,
 * keyed by path, so adding a tenth page is a data edit plus a route.
 *
 * WHY THESE PAGES EXIST ALONGSIDE THE CATALOGUE
 * ---------------------------------------------
 * A catalogue page answers "show me the parts". These answer "what is this system, which one do
 * I need, and who makes it". Different searches, different people, different stages of the same
 * purchase. One page serving both gets worse at each, so they are separate and cross linked.
 *
 * They also sit on the URLs buyers guess at. /scaffolding, /formwork and /garden-hardware all
 * returned a hard 404 before this.
 *
 * STRUCTURED DATA
 * ---------------
 * FAQPage is emitted from the same `faqs` array the accordion renders, never written
 * separately, because markup describing questions the page does not show is a policy violation.
 * The answers are in the DOM whether or not the accordion is open, hidden with CSS rather than
 * unmounted, for the same reason.
 */
export default function LandingPage() {
  const location = useLocation();
  const lt = useLT('landing');
  const page = getLandingPage(location.pathname);
  const [openFaq, setOpenFaq] = useState(null);

  /**
   * Everything below tolerates a missing page, and the early return comes AFTER useSEO.
   *
   * A route exists for every key in data/landingPages.js, so `page` is only ever missing if the
   * two drift apart. Returning early before the hook would still be a bug: hooks have to run in
   * the same order on every render, and an early return above one breaks that rule the moment
   * the condition changes between renders.
   */
  const parent = page?.parent ? getLandingPage(page.parent) : null;

  const crumbs = [
    { label: lt('crumbs.home', 'Home'), to: '/' },
    ...(parent ? [{ label: parent.h1, to: parent.path }] : []),
    ...(page ? [{ label: page.h1 }] : []),
  ];

  const faqSchema = page?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : undefined;

  /**
   * The page is about a range rather than a single item, so CollectionPage is the honest type.
   * Product schema belongs on product pages, where there is an actual product to describe.
   */
  const collectionSchema = page
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: page.h1,
        description: page.description,
        url: absoluteUrl(page.path),
      }
    : undefined;

  useSEO({
    title: page?.title,
    description: page?.description,
    appendSiteName: false,
    breadcrumbs: page ? crumbs : undefined,
    schema: [collectionSchema, faqSchema].filter(Boolean),
  });

  if (!page) return null;

  const products = (page.products || []).map((id) => getProductById(String(id))).filter(Boolean);

  return (
    <>
      <PageHero
        eyebrow={lt('eyebrow', 'Manufacturer and Exporter')}
        title={page.h1}
        desc={page.intro.split('. ').slice(0, 2).join('. ') + '.'}
        crumbs={crumbs}
        image={img.heroScaffoldTower}
      />

      <section className="section-pad">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="body-copy">{page.intro}</p>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            {page.sections.map((sec) => (
              <div key={sec.heading}>
                <h2 className="font-display text-xl font-bold text-text">{sec.heading}</h2>
                <p className="body-copy mt-3">{sec.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specification table */}
      {page.specs?.length > 0 && (
        <section className="section-pad border-t border-navy-100 bg-navy-50/30">
          <div className="container-page">
            <SectionHeading align="left" eyebrow={lt('specs.eyebrow', 'Specification')} title={lt('specs.title', 'At a glance')} className="!mx-0" />
            <div className="mt-8 overflow-hidden rounded-card border border-navy-100 bg-white">
              <table className="w-full text-left text-sm">
                <tbody className="divide-y divide-navy-100">
                  {page.specs.map((s) => (
                    <tr key={s.label}>
                      <th scope="row" className="w-1/3 px-5 py-3.5 align-top font-semibold text-navy-800">
                        {s.label}
                      </th>
                      <td className="px-5 py-3.5 align-top text-text-body">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Standards, as a definition list so the relationship is in the markup. */}
            {page.standards?.length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-xl font-bold text-text">{lt('standards.title', 'Standards')}</h2>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  {page.standards.map((st) => (
                    <div key={st.code} className="rounded-card border border-navy-100 bg-white p-5">
                      <dt className="font-semibold text-primary-darker">{st.code}</dt>
                      <dd className="body-copy mt-1.5 text-sm">{st.covers}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {page.applications?.length > 0 && (
              <div className="mt-10 max-w-3xl">
                <h2 className="font-display text-xl font-bold text-text">{lt('applications.title', 'Where it is used')}</h2>
                <ul className="mt-4 space-y-2">
                  {page.applications.map((a) => (
                    <li key={a} className="flex gap-3 text-body-compact text-text-body">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Into the catalogue: ranges first, then named products. Both are real links so a
          crawler follows them, which is half the point of these pages existing. */}
      <section className="section-pad">
        <div className="container-page">
          <SectionHeading align="left" eyebrow={lt('ranges.eyebrow', 'The catalogue')} title={lt('ranges.title', 'Browse the range')} className="!mx-0" />
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {page.ranges.map((r) => (
              <li key={r.to}>
                <Link
                  to={r.to}
                  className="inline-flex items-center rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:border-primary/60 hover:text-primary-dark"
                >
                  {r.label}
                </Link>
              </li>
            ))}
          </ul>

          {products.length > 0 && (
            <div className="mt-10">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                {lt('products.title', 'Products in this range')}
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={productPath(p.id) || `/product/${p.id}`}
                      className="flex h-full flex-col rounded-card border border-navy-100 bg-white px-4 py-3.5 transition-colors hover:border-primary/60"
                    >
                      <span className="text-sm font-semibold text-navy-800">{p.name}</span>
                      {p.itemCode && <span className="mt-0.5 text-xs text-muted">{p.itemCode}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Child landing pages, where this page has them. */}
          {page.children?.length > 0 && (
            <div className="mt-10">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                {lt('children.title', 'More detail')}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {page.children.map((c) => {
                  const child = getLandingPage(c);
                  return child ? (
                    <li key={c}>
                      <Link
                        to={c}
                        className="inline-flex items-center rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary-darker transition-colors hover:bg-primary/10"
                      >
                        {child.h1}
                      </Link>
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      {page.faqs?.length > 0 && (
        <section className="section-pad border-t border-navy-100 bg-navy-50/30">
          <div className="container-page max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-text">{lt('faq.title', 'Common questions')}</h2>
            <div className="mt-6 divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
              {page.faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-navy-800">{f.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    {/* In the DOM whether open or not, so the FAQPage markup describes text the
                        page actually contains. */}
                    <div className={open ? 'px-5 pb-5' : 'hidden'}>
                      <p className="body-copy">{f.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="section-pad">
        <div className="container-page">
          <div className="rounded-card border border-primary/25 bg-primary/5 px-6 py-8 sm:px-10">
            <h2 className="font-display text-2xl font-bold text-text">{lt('cta.title', 'Request a quotation')}</h2>
            <p className="body-copy mt-3 max-w-2xl">
              {lt(
                'cta.body',
                'Send the sizes, finish, standard and quantities you need. We manufacture in our own plants in Ludhiana, India and export to more than 42 countries, so quotations are prepared for container volumes as readily as for single lines.',
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/request-a-quote">{lt('cta.button', 'Request a Quote')}</Button>
              <Button to="/export" variant="secondary">
                {lt('cta.export', 'Export enquiries')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
