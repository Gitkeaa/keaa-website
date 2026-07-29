import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import { company } from '../data/company';
import useSEO from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * Certifications & Compliance page: hero, a grid of certificate cards from company.certifications,
 * and the in-house testing plus certified-workforce blurbs.
 *
 * Rendered at the /certifications route (lazy-loaded in App.jsx) and linked from the main
 * navigation. Edit the certificate list in src/data/company.js; adjust layout and copy here.
 */
export default function Certifications() {
  const lt = useLT('certifications');
  useSEO({
    title: lt('seo.title', 'Certifications & Compliance'),
    description: lt(
      'seo.description',
      'ISO 9001:2015, CE, AEO, BSCI and more -- KEAA International\'s certifications and quality compliance documents.'
    ),
  });

  return (
    <>
      <GalleryHero
        eyebrow="Certifications & Compliance"
        crumbs={[{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.current', 'Certifications & Compliance') }]}
        slides={heroSlides.certifications}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow={lt('intro.eyebrow', 'Our Certifications')}
            title={lt('intro.title', 'Quality You Can Verify')}
            desc={lt('intro.desc', 'Independently audited and certified by TÜV Rheinland and the Government of India. Click any certificate to open the full document.')}
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {company.certifications.map((c, i) => (
              <div
                key={c.name}
                className="group flex flex-col overflow-hidden rounded-card border border-navy-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
              >
                <div className="overflow-hidden border-b border-navy-100 bg-navy-50/40 p-4">
                  <img
                    src={c.image}
                    alt={lt('certs.alt', '{name} certificate, KEAA International', { name: c.name })}
                    loading="lazy"
                    className="mx-auto max-h-[440px] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold text-text">{c.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary-darker">
                    {lt(`certs.${i}.scope`, c.scope)}, {c.body}
                  </p>
                  <p className="mt-2 text-body-compact leading-relaxed text-ink">{lt(`certs.${i}.note`, c.note)}</p>
                  <a
                    href={c.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-fit items-center border-b border-transparent pb-0.5 text-[13px] font-bold uppercase tracking-[0.12em] text-navy-700 transition-colors hover:border-primary hover:text-primary-darker"
                  >
                    {lt('certs.view', 'View Certificate')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow text-primary-darker">
              {lt('testing.eyebrow', 'In-House Testing')}
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-text">
              {lt('testing.title', 'Tested Before It Leaves Our Facility')}
            </h3>
            <p className="mt-3 text-body-compact leading-relaxed text-ink">{lt('testing.body', company.facilities.testing)}.</p>
          </div>
          <div>
            <span className="eyebrow text-primary-darker">
              {lt('welders.eyebrow', 'Certified Workforce')}
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-text">
              {lt('welders.title', 'Certified Welders, Verified Process')}
            </h3>
            <p className="mt-3 text-body-compact leading-relaxed text-ink">{lt('welders.body', company.facilities.welders)}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
