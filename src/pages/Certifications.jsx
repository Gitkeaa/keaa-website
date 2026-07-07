import { Download, ShieldCheck, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import { company } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

// The four independently-audited certificates, shown as framed images with a
// link to the full PDF (files live in public/images and public/certificates).
const certificateGallery = [
  {
    img: '/images/cert-iso-9001.jpg',
    pdf: '/certificates/iso-9001.pdf',
    title: 'ISO 9001:2015',
    body: 'Quality Management System — TÜV Rheinland',
    desc: 'Certifies our quality management system for the manufacture of sheet-metal and fabricated components — scaffolding, framework, garden hardware and livestock products.',
  },
  {
    img: '/images/cert-iso-14001.jpg',
    pdf: '/certificates/iso-14001.pdf',
    title: 'ISO 14001:2015',
    body: 'Environmental Management System — TÜV Rheinland',
    desc: 'Certifies an environmental management system that ensures responsible, low-impact and sustainable manufacturing across all operations.',
  },
  {
    img: '/images/cert-iso-45001.jpg',
    pdf: '/certificates/iso-45001.pdf',
    title: 'ISO 45001:2018',
    body: 'Occupational Health & Safety — TÜV Rheinland',
    desc: 'Certifies an occupational health & safety management system that protects our workforce and maintains a safe production environment.',
  },
  {
    img: '/images/cert-zed-silver.jpg',
    pdf: '/certificates/zed-silver.pdf',
    title: 'ZED Silver',
    body: 'MSME Sustainable (ZED) — Govt. of India',
    desc: 'Zero Defect Zero Effect (ZED) Silver certification under the Government of India MSME Sustainable scheme, recognising quality-driven and eco-conscious manufacturing.',
  },
];

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
            {certificateGallery.map((c) => (
              <div
                key={c.title}
                className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
              >
                <div className="overflow-hidden border-b border-navy-100 bg-navy-50/40 p-4">
                  <img
                    src={c.img}
                    alt={`${c.title} certificate — KEAA International`}
                    loading="lazy"
                    className="mx-auto max-h-[440px] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 text-gold-500" />
                    <h3 className="font-display text-lg font-semibold text-navy-800">{c.title}</h3>
                  </div>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-gold-600">{c.body}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{c.desc}</p>
                  <a
                    href={c.pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 transition-colors hover:text-gold-600"
                  >
                    <Download className="h-4 w-4" /> View Certificate (PDF)
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
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> In-House Testing
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Tested Before It Leaves Our Facility
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{company.facilities.testing}.</p>
          </div>
          <div>
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Certified Workforce
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Certified Welders, Verified Process
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{company.facilities.welders}.</p>
          </div>
        </div>
      </section>

      <section className="bg-navy-900">
        <div className="container-page flex flex-col items-center justify-between gap-6 py-12 sm:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Need a Specific Compliance Document?</h3>
            <p className="mt-1 text-white/60">We&rsquo;re happy to share full certification packs for your project or tender.</p>
          </div>
          <Button to="/contact" icon={ArrowRight} className="flex-shrink-0">
            Contact Our Team
          </Button>
        </div>
      </section>
    </>
  );
}
