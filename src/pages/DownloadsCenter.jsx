import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import { downloadResources } from '../data/content';
import useSEO from '../hooks/useSEO';

export default function DownloadsCenter() {
  useSEO({
    title: 'Downloads & Resources',
    description:
      'Download KEAA\'s corporate brochure, product catalogues, technical datasheets and installation guides.',
  });

  return (
    <>
      <GalleryHero
        eyebrow="Downloads Center"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Downloads Center' }]}
        slides={heroSlides.downloads}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
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

    </>
  );
}
