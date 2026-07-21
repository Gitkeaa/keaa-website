import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GalleryHero from '../components/gallery/GalleryHero';
import { heroSlides } from '../data/heroSlides';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import JobApplicationModal from '../components/JobApplicationModal';
import { careers } from '../data/content';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

const perks = [
  { title: 'Growth Opportunities', desc: 'Clear paths to grow within production, quality, exports and management.' },
  { title: 'Competitive Benefits', desc: 'Fair compensation and benefits aligned with industry standards.' },
  { title: 'Learning & Development', desc: 'On-the-job training across our certified manufacturing processes.' },
  { title: 'Safe & Inclusive Workplace', desc: 'A culture built on safety, respect and teamwork on the shop floor.' },
];

export default function Careers() {
  useSEO({
    title: 'Careers',
    description:
      'Join KEAA International\'s team -- explore current openings in production, quality, exports and more.',
  });

  const [activeJob, setActiveJob] = useState(null);
  const [openDetail, setOpenDetail] = useState(null);

  return (
    <>
      <GalleryHero
        eyebrow="Careers"
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Careers' }]}
        slides={heroSlides.careers}
        scrollTo="content"
      />

      <section id="content" className="section-pad">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <ImagePlaceholder src={img.scaffoldWorker2} label="Life at KEAA, our manufacturing team" ratio="aspect-[4/3]" />
          <div>
            <span className="eyebrow text-primary-darker">
              Why Work With Us
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-text">Build Your Career. Build the Future.</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {perks.map((p) => (
                <div key={p.title}>
                  <h4 className="text-sm font-semibold text-text">{p.title}</h4>
                  <p className="mt-0.5 text-xs text-ink">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading align="left" eyebrow="Open Positions" title="Current Openings" className="!mx-0" />
          </div>
          <div className="mt-8 divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
            {careers.map((job) => {
              const isOpen = job.status === 'open';
              const expanded = openDetail === job.title;
              return (
                <div key={job.title} className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-display text-sm font-semibold text-text">{job.title}</h4>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-navy-100 text-ink'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-ink/40'}`} />
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-start gap-x-8 gap-y-3 text-xs text-ink">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">Location</p>
                          <p className="mt-0.5">{job.location}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">Type</p>
                          <p className="mt-0.5">{job.type}</p>
                        </div>
                      </div>
                      {job.description && (
                        <button
                          type="button"
                          onClick={() => setOpenDetail(expanded ? null : job.title)}
                          aria-expanded={expanded}
                          className="mt-3 inline-flex items-center border-b border-transparent pb-0.5 text-xs font-semibold text-primary-darker transition-colors hover:border-primary hover:text-primary-deep"
                        >
                          {expanded ? 'Hide details' : 'View details'}
                        </button>
                      )}
                    </div>
                    {isOpen ? (
                      <Button size="sm" variant="outlineNavy" onClick={() => setActiveJob(job)}>
                        Apply Now
                      </Button>
                    ) : (
                      <span className="cursor-not-allowed rounded-card border border-navy-100 bg-navy-50 px-4 py-2 text-sm font-medium text-muted">
                        Applications Closed
                      </span>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded && job.description && (
                      <motion.div
                        key="detail"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 max-w-3xl text-body-compact leading-relaxed text-ink">
                          {job.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* No phone line here: the number on file is the sales line, not recruitment. */}
      <CtaBand
        title="Can&rsquo;t Find"
        accent="the Right Role?"
        desc="Send us your resume and we&rsquo;ll reach out when a suitable opportunity is available."
        cta={{ label: 'Send Resume', href: 'mailto:careers@keaa-international.net' }}
        showPhone={false}
      />

      <AnimatePresence>
        {activeJob && (
          <JobApplicationModal
            key={activeJob.title}
            job={activeJob}
            onClose={() => setActiveJob(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
