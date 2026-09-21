import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { getCategoryPillar } from '../../data/categoryPillars';
import { getSubcategoryPillar } from '../../data/subcategoryPillars';
import Button from '../ui/Button';
import { company } from '../../data/company';
import { useLT } from '../../i18n/LocaleContext';

/**
 * The long-form half of a category page: what the system is, its components, the standards
 * it is built to, where it is used, why buy it here, and the questions buyers ask.
 *
 * WHY IT SITS BELOW THE PRODUCT GRID
 * ----------------------------------
 * A visitor who arrived from a search for a specific part wants the grid, not an essay, so
 * the essay goes underneath. Search engines read the whole document either way. Putting it
 * above would push the products below the fold to serve a crawler, which is the wrong trade.
 *
 * ONE COMPONENT, TWO SCOPES
 * -------------------------
 * Pass `category` alone and it renders the category pillar. Pass `subcategory` as well and it
 * renders that range's own pillar from data/subcategoryPillars.js instead.
 *
 * The two never carry the same words. That was the original reason this was category-only:
 * repeating one essay across seventeen subcategory pages would make them near-duplicates,
 * which is the problem the exercise exists to fix. Every subcategory now has copy written for
 * it alone, so the pages are distinct rather than absent.
 *
 * The component list is read from the live subcategory names rather than written out here, so
 * adding a subcategory to the catalogue updates the category copy automatically. A subcategory
 * has no children, so it shows no chips and states its contents in prose instead.
 */
export default function CategoryPillar({ category, subcategory }) {
  const lt = useLT('catalog');
  const pillar = subcategory
    ? getSubcategoryPillar(subcategory.slug)
    : getCategoryPillar(category?.slug);
  const [openFaq, setOpenFaq] = useState(null);

  if (!pillar) return null;

  // Translation key namespace. Subcategory copy is new and untranslated, so `lt` falls back to
  // the English written in the data file, which is the correct behaviour until it is translated.
  const key = subcategory ? `subpillar.${subcategory.slug}` : `pillar.${category.slug}`;
  const heading = subcategory ? lt(`sub.${subcategory.slug}.name`, subcategory.name) : category.name;
  const subs = subcategory ? [] : category.subcategories || [];
  const countries = company.stats.find((s) => s.label === 'Countries Exported')?.value;

  return (
    <section className="section-pad border-t border-navy-100 bg-navy-50/30">
      <div className="container-page">
        <SectionHeading
          align="left"
          eyebrow={lt('pillar.eyebrow', 'About this range')}
          title={lt(`${key}.title`, heading)}
          className="!mx-0"
        />

        <div className="mt-6 max-w-3xl">
          <p className="body-copy">{lt(`${key}.intro`, pillar.intro)}</p>
        </div>

        {/* The component list, read from the catalogue rather than repeated in prose, and
            rendered as real links so a crawler can follow them into the subcategories. */}
        {subs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
              {lt('pillar.components', 'What this range includes')}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {subs.map((s) => (
                <li key={s.slug}>
                  <Link
                    to={`/products/${category.slug}/${s.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:border-primary/60 hover:text-primary-dark"
                  >
                    {lt(`sub.${s.slug}.name`, s.name)}
                    <span className="text-xs font-normal text-muted">{s.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {pillar.sections.map((sec, i) => (
            <div key={sec.heading}>
              <h3 className="font-display text-lg font-bold text-text">
                {lt(`${key}.sections.${i}.heading`, sec.heading)}
              </h3>
              <p className="body-copy mt-2.5">{lt(`${key}.sections.${i}.body`, sec.body)}</p>
            </div>
          ))}
        </div>

        {/* Trust signals the SEO brief asks for on every category page, read from company.js
            so they cannot contradict the About and Certifications pages. */}
        <ul className="mt-10 flex flex-wrap gap-2.5">
          {[
            company.certifications[0]?.name,
            lt('pillar.since', 'Manufacturing since {year}', { year: String(company.founded) }),
            countries && lt('pillar.countries', 'Exported to {n} countries', { n: countries }),
          ]
            .filter(Boolean)
            .map((badge) => (
              <li
                key={badge}
                className="rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary-darker"
              >
                {badge}
              </li>
            ))}
        </ul>

        {/* The ask, at the point someone has just read what the range is and what it is made
            to. Range pages only: the three category pages were signed off without one and
            changing a page that is already working is not what this exercise is for. */}
        {subcategory && (
          <div className="mt-12 rounded-card border border-primary/25 bg-primary/5 px-6 py-6 sm:px-8">
            <h3 className="font-display text-lg font-bold text-text">
              {lt('pillar.ctaTitle', 'Need a quotation for this range?')}
            </h3>
            <p className="body-copy mt-2 max-w-2xl">
              {lt(
                'pillar.ctaBody',
                'Send the sizes, finish and quantities you need. We manufacture in our own plants in Ludhiana, India and export to more than 42 countries, so quotations are for container volumes as readily as for single lines.',
              )}
            </p>
            <Button to="/request-a-quote" className="mt-5">
              {lt('pillar.ctaButton', 'Request a Quote')}
            </Button>
          </div>
        )}

        {pillar.faqs?.length > 0 && (
          <div className="mt-14 max-w-3xl">
            <h3 className="font-display text-xl font-bold text-text">
              {lt('pillar.faqTitle', 'Common questions')}
            </h3>
            <div className="mt-5 divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
              {pillar.faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-navy-800">
                        {lt(`${key}.faqs.${i}.q`, f.q)}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                    {/* Rendered whether or not it is expanded, and hidden with CSS rather than
                        unmounted, so the answers are in the HTML for the FAQPage markup to
                        correspond to. Structured data that describes text the page does not
                        contain is a Google policy violation. */}
                    <div className={open ? 'px-5 pb-5' : 'hidden'}>
                      <p className="body-copy">{lt(`${key}.faqs.${i}.a`, f.a)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
