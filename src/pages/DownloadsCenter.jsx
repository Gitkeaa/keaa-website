import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import { downloadResources } from '../data/content';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

export default function DownloadsCenter() {
  useSEO({
    title: 'Downloads & Resources',
    description:
      'Download KEAA\'s corporate brochure, product catalogues, technical datasheets and installation guides.',
  });

  return (
    <>
      <PageHero
        eyebrow="Downloads Center"
        title="Downloads &amp;"
        accent="Resources."
        desc="Brochures, catalogues, technical datasheets and installation guides — everything you need, in one place."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Downloads Center' }]}
      image={img.factoryInterior}
      />

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow="All Downloads" title="Download Files" />
          <div className="mt-10 divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
            {downloadResources.map((d) => (
              <div key={d.title} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {d.type}
                  </p>
                  <p className="mt-1 text-body-compact font-medium text-text">{d.title}</p>
                  {d.size && <p className="text-xs text-muted font-mono">{d.size}</p>}
                </div>
                <Button
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlineNavy"
                  size="sm"
                  className="text-[13px] font-bold uppercase tracking-[0.12em]"
                >
                  Open / Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Can&rsquo;t Find"
        accent="What You Need?"
        desc="Reach out and we&rsquo;ll send the right document directly to you."
        cta={{ label: 'Contact Our Team', to: '/contact' }}
      />
    </>
  );
}
