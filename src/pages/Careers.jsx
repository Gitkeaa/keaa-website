import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Clock, Send, TrendingUp, GraduationCap, ShieldCheck, Users2, ChevronDown } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import JobApplicationModal from '../components/JobApplicationModal';
import { careers } from '../data/content';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import CtaBand from '../components/CtaBand';

const perks = [
  { icon: TrendingUp, title: 'Growth Opportunities', desc: 'Clear paths to grow within production, quality, exports and management.' },
  { icon: ShieldCheck, title: 'Competitive Benefits', desc: 'Fair compensation and benefits aligned with industry standards.' },
  { icon: GraduationCap, title: 'Learning & Development', desc: 'On-the-job training across our certified manufacturing processes.' },
  { icon: Users2, title: 'Safe & Inclusive Workplace', desc: 'A culture built on safety, respect and teamwork on the shop floor.' },
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
      <PageHero
        eyebrow="Careers"
        title="Join Our"
        accent="Team."
        desc="Build your career with KEAA International and be part of a mission to deliver excellence in manufacturing."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Careers' }]}
      image={img.personTool}
      />

      <section className="section-pad">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <ImagePlaceholder src={img.scaffoldWorker2} label="Life at KEAA — our manufacturing team" icon={Users2} ratio="aspect-[4/3]" />
          <div>
            <span className="eyebrow text-primary-darker">
              Why Work With Us
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-navy-800">Build Your Career. Build the Future.</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {perks.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <p.icon className="h-5 w-5 flex-shrink-0 text-primary-dark" />
                  <div>
                    <h4 className="text-sm font-semibold text-navy-800">{p.title}</h4>
                    <p className="mt-0.5 text-xs text-ink/60">{p.desc}</p>
                  </div>
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
          <div className="mt-8 divide-y divide-navy-100 rounded-2xl border border-black bg-white">
            {careers.map((job) => {
              const isOpen = job.status === 'open';
              const expanded = openDetail === job.title;
              return (
                <div key={job.title} className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-display text-sm font-semibold text-navy-800">{job.title}</h4>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-navy-100 text-ink/55'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-ink/40'}`} />
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-ink/55">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {job.type}
                        </span>
                      </div>
                      {job.description && (
                        <button
                          type="button"
                          onClick={() => setOpenDetail(expanded ? null : job.title)}
                          aria-expanded={expanded}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-darker transition-colors hover:text-primary-deep"
                        >
                          {expanded ? 'Hide details' : 'View details'}
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                      )}
                    </div>
                    {isOpen ? (
                      <Button size="sm" variant="outlineNavy" onClick={() => setActiveJob(job)}>
                        Apply Now
                      </Button>
                    ) : (
                      <span className="cursor-not-allowed rounded-md border border-navy-100 bg-navy-50 px-4 py-2 text-sm font-medium text-ink/40">
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
                        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/65">
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
        cta={{ label: 'Send Resume', href: 'mailto:careers@keaa-international.net', icon: Send }}
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
