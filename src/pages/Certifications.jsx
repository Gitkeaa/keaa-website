import { Eye, ShieldCheck, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import { company } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

export default function Certifications() {
  useSEO({
    title: 'Certifications & Compliance',
    description:
      'ISO 9001:2015, CE, AEO, BSCI and more -- KEAA International\'s certifications and quality compliance documents.',
  });

  return (
    <>
      <PageHero
        eyebrow="Certifications & Compliance"
        title="Committed To"
        accent="Global Standards."
        desc="ISO, CE and EU compliance backed by independent third-party testing and certification bodies across Germany, Denmark and India."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Certifications & Compliance' }]}
      image={img.grinderMetal}
      />

      <section className="section-pad">
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
                className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
              >
                <div className="overflow-hidden border-b border-navy-100 bg-navy-50/40 p-4">
                  <img
                    src={c.image}
                    alt={`${c.name} certificate — KEAA International`}
                    loading="lazy"
                    className="mx-auto max-h-[440px] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary-dark" />
                    <h3 className="font-display text-lg font-semibold text-navy-800">{c.name}</h3>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary-darker">
                    {c.scope} — {c.body}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{c.note}</p>
                  <a
                    href={c.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 transition-colors hover:text-primary-deep"
                  >
                    <Eye className="h-4 w-4" /> View Certificate
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-navy-50">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow text-primary-darker">
              In-House Testing
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Tested Before It Leaves Our Facility
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{company.facilities.testing}.</p>
          </div>
          <div>
            <span className="eyebrow text-primary-darker">
              Certified Workforce
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Certified Welders, Verified Process
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{company.facilities.welders}.</p>
          </div>
        </div>
      </section>

      <CtaBand
        title="Need a Specific"
        accent="Compliance Document?"
        desc="We&rsquo;re happy to share full certification packs for your project or tender."
        cta={{ label: 'Contact Our Team', to: '/contact', icon: ArrowRight }}
      />
    </>
  );
}
