import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download } from 'lucide-react';
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

  // Which grouped entry (e.g. the brand logos) is currently expanded. Only one at a time.
  const [openGroup, setOpenGroup] = useState(null);

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
            {downloadResources.map((d) => {
              // Grouped entry (e.g. the brand logos): one labelled row whose "Download"
              // button expands to the individual files. Each file is served same-origin from
              // /public/downloads with the `download` attribute, so a click saves it under
              // its own filename (see downloadResources in content.js).
              if (d.files) {
                const expanded = openGroup === d.title;
                return (
                  <div key={d.title} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                          {d.type}
                        </p>
                        <p className="mt-1 text-body-compact font-medium text-text">{d.title}</p>
                        <p className="text-xs text-muted">
                          {d.files.length} {d.files.length === 1 ? 'file' : 'files'}
                        </p>
                      </div>
                      <Button
                        onClick={() => setOpenGroup(expanded ? null : d.title)}
                        variant="outlineNavy"
                        size="sm"
                        aria-expanded={expanded}
                        className="text-[13px] font-bold uppercase tracking-[0.12em]"
                      >
                        {expanded ? 'Close' : 'Download'}
                      </Button>
                    </div>

                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.ul
                          key="files"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="mt-4 overflow-hidden rounded-card border border-navy-100 bg-navy-50 divide-y divide-navy-100"
                        >
                          {d.files.map((f) => (
                            <li
                              key={f.url}
                              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                            >
                              <span className="text-body-compact font-medium text-text">{f.label}</span>
                              <a
                                href={f.url}
                                download={f.filename}
                                className="inline-flex items-center gap-1.5 rounded-card border border-primary/55 bg-white px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-[0.12em] text-primary-dark transition-colors hover:border-primary-dark hover:bg-primary-dark hover:text-white"
                              >
                                <Download className="h-3.5 w-3.5" strokeWidth={2} />
                                Download
                              </a>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              // Single-file entry: a straight link to the resource (unchanged).
              return (
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
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
