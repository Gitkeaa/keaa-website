import { lazy, Suspense, useState } from 'react';
import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import { catalogueDownloads } from '../data/content';
import useSEO from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';

/**
 * Every catalogue here is gated: the visitor fills a short form and the file opens on submit.
 * That turns an anonymous download into a qualified lead in the admin console (see
 * components/CatalogueRequestModal.jsx). The modal is lazy — it pulls in the country picker
 * and the phone/email fields, which no one needs until they click Download.
 */
const CatalogueRequestModal = lazy(() => import('../components/CatalogueRequestModal'));

export default function DownloadsCenter() {
  const lt = useLT('downloads');
  useSEO({
    title: lt('seo.title', 'Downloads & Resources'),
    description:
      lt('seo.desc', "Download KEAA's product catalogues: scaffolding and formworks, livestock housing solutions, and wood connectors and garden hardware."),
  });

  // The catalogue the visitor asked for, or null when the gate is closed.
  const [requested, setRequested] = useState(null);

  return (
    <>
      <GalleryHero
        eyebrow="Downloads Center"
        crumbs={[{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.page', 'Downloads Center') }]}
        slides={heroSlides.downloads.map((s, i) => ({
          ...s,
          title: lt(`hero.${i}.title`, s.title),
          accent: s.accent && lt(`hero.${i}.accent`, s.accent),
          desc: s.desc && lt(`hero.${i}.desc`, s.desc),
        }))}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page">
          <SectionHeading eyebrow={lt('catalogues.eyebrow', 'Catalogues')} title={lt('catalogues.title', 'Download Our Catalogues')} />
          <div className="mt-10 divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
            {/* Catalogues only. Brand artwork and company presentations are internal and live
                in the portal's Resource Library (admin/components/ResourceLibrary.jsx). */}
            {catalogueDownloads.map((d, i) => (
              <div key={d.title} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                    {d.type}
                  </p>
                  <p className="mt-1 text-body-compact font-medium text-text">{lt(`catalogues.${i}.title`, d.title)}</p>
                </div>
                <Button
                  onClick={() => setRequested(d)}
                  variant="outlineNavy"
                  size="sm"
                  className="text-[13px] font-bold uppercase tracking-[0.12em]"
                >
                  {lt('catalogues.download', 'Download')}
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            {lt('catalogues.note', 'Catalogues are free. We ask for your details so our team can follow up with pricing, samples or technical support if you need them.')}
          </p>
        </div>
      </section>

      {requested && (
        <Suspense fallback={null}>
          <CatalogueRequestModal item={requested} onClose={() => setRequested(null)} />
        </Suspense>
      )}
    </>
  );
}
