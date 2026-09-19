import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { getCategoryPillar } from '../../data/categoryPillars';
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
 * ONLY ON THE CATEGORY PAGE, NEVER A SUBCATEGORY
 * ----------------------------------------------
 * The caller renders this only when no subcategory is selected. Repeating the same 400 words
 * on all seventeen subcategory pages of a category would make them near-duplicates of each
 * other, which is the problem this whole exercise exists to fix.
 *
 * The component list is read from the live subcategory names rather than written out here,
 * so adding a subcategory to the catalogue updates the copy automatically.
 */
export default function CategoryPillar({ category }) {
  const lt = useLT('catalog');
  const pillar = getCategoryPillar(category?.slug);
  const [openFaq, setOpenFaq] = useState(null);

  if (!pillar) return null;

  const subs = category.subcategories || [];
  const countries = company.stats.find((s) => s.label === 'Countries Exported')?.value;

  return (
    <section className="section-pad border-t border-navy-100 bg-navy-50/30">
      <div className="container-page">
        <SectionHeading
          align="left"
          eyebrow={lt('pillar.eyebrow', 'About this range')}
          title={lt(`pillar.${category.slug}.title`, category.name)}
          className="!mx-0"
        />

        <div className="mt-6 max-w-3xl">
          <p className="body-copy">{lt(`pillar.${category.slug}.intro`, pillar.intro)}</p>
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
                {lt(`pillar.${category.slug}.sections.${i}.heading`, sec.heading)}
              </h3>
              <p className="body-copy mt-2.5">{lt(`pillar.${category.slug}.sections.${i}.body`, sec.body)}</p>
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
                        {lt(`pillar.${category.slug}.faqs.${i}.q`, f.q)}
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
                      <p className="body-copy">{lt(`pillar.${category.slug}.faqs.${i}.a`, f.a)}</p>
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
