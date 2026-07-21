import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import { company } from '../data/company';
import useSEO from '../hooks/useSEO';

export default function Certifications() {
  useSEO({
    title: 'Certifications & Compliance',
    description:
      'ISO 9001:2015, CE, AEO, BSCI and more -- KEAA International\'s certifications and quality compliance documents.',
  });

  return (
    <>
      <GalleryHero
        eyebrow="Certifications & Compliance"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Certifications & Compliance' }]}
        slides={heroSlides.certifications}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow="Our Certifications"
            title="Quality You Can Verify"
            desc="Independently audited and certified by TÜV Rheinland and the Government of India. Click any certificate to open the full document."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {company.certifications.map((c) => (
              <div
                key={c.name}
                className="group flex flex-col overflow-hidden rounded-card border border-navy-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
              >
                <div className="overflow-hidden border-b border-navy-100 bg-navy-50/40 p-4">
                  <img
                    src={c.image}
                    alt={`${c.name} certificate, KEAA International`}
                    loading="lazy"
                    className="mx-auto max-h-[440px] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold text-text">{c.name}</h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary-darker">
                    {c.scope}, {c.body}
                  </p>
                  <p className="mt-2 text-body-compact leading-relaxed text-ink">{c.note}</p>
                  <a
                    href={c.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex w-fit items-center border-b border-transparent pb-0.5 text-[13px] font-bold uppercase tracking-[0.12em] text-navy-700 transition-colors hover:border-primary hover:text-primary-darker"
                  >
                    View Certificate
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
              In-House Testing
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-text">
              Tested Before It Leaves Our Facility
            </h3>
            <p className="mt-3 text-body-compact leading-relaxed text-ink">{company.facilities.testing}.</p>
          </div>
          <div>
            <span className="eyebrow text-primary-darker">
              Certified Workforce
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-text">
              Certified Welders, Verified Process
            </h3>
            <p className="mt-3 text-body-compact leading-relaxed text-ink">{company.facilities.welders}.</p>
          </div>
        </div>
      </section>
    </>
  );
}
