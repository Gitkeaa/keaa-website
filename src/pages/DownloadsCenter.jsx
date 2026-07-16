import { ExternalLink, FileText, FileSpreadsheet, ArrowRight } from 'lucide-react';
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
          <div className="mt-10 divide-y divide-navy-100 rounded-2xl border border-black bg-white">
            {downloadResources.map((d) => (
              <div key={d.title} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                    {d.type === 'PPTX' ? (
                      <FileSpreadsheet className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-navy-800">{d.title}</p>
                    <p className="text-xs text-ink/50 font-mono">
                      {d.type}
                      {d.size ? ` · ${d.size}` : ''}
                    </p>
                  </div>
                </div>
                <Button
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlineNavy"
                  size="sm"
                  icon={ExternalLink}
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
        cta={{ label: 'Contact Our Team', to: '/contact', icon: ArrowRight }}
      />
    </>
  );
}
