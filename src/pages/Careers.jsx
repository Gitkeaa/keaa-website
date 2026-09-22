import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SectionHeading from '../components/ui/SectionHeading';
import Reveal from '../components/ui/Reveal';
import Button from '../components/ui/Button';
import JobApplicationModal from '../components/JobApplicationModal';
import { careers } from '../data/content';
import { company } from '../data/company';
import useSEO from '../hooks/useSEO';
import { localPhoto, localPhotoSrcSet } from '../data/images';
import CtaBand from '../components/CtaBand';
import { EASE } from '../lib/motion';
import { useLT } from '../i18n/LocaleContext';
import { entryInitial } from '../lib/firstPaint';

/**
 * Careers page: hero, a KEAA stats band, perks, and expandable job listings with an apply modal.
 *
 * Rendered at the public /careers route, lazy-loaded in App.jsx. Openings come from data/content.js
 * and the stat figures from data/company.js; edit those to change what this page shows.
 */
const perks = [
  { title: 'Growth Opportunities', desc: 'Clear paths to grow within production, quality, exports and management.' },
  { title: 'Learning & Development', desc: 'On-the-job training across our certified manufacturing processes.' },
  { title: 'Competitive Benefits', desc: 'Fair compensation and benefits aligned with industry standards.' },
  { title: 'Safe & Inclusive Workplace', desc: 'A culture built on safety, respect and teamwork on the shop floor.' },
];

// Headline figures for the careers banner, read from company.js so they can never drift
// from the About page. The supplied mock-up carried placeholder numbers (500+ employees,
// 30+ countries, 40+ years); these are the real ones on record.
const statValue = (label) => company.stats.find((s) => s.label === label)?.value;

const bannerStats = [
  { value: statValue('Skilled Employees'), label: 'Skilled Employees', sub: 'A team that grows together' },
  { value: statValue('Years of Experience'), label: 'Years of Excellence', sub: 'A legacy of quality and trust' },
  { value: statValue('Countries Exported'), label: 'Countries Served', sub: 'Global reach, local impact' },
  { value: statValue('Manufacturing Facilities'), label: 'Manufacturing Units', sub: 'State-of-the-art facilities' },
].filter((s) => s.value);

export default function Careers() {
  const lt = useLT('careers');
  /**
   * JobPosting structured data, one entry per open role, so the openings can appear in
   * Google for Jobs rather than only on this page. Built from the same `careers` array the
   * list below renders, so the markup and the copy cannot drift apart.
   *
   * Only roles marked open are emitted: advertising a closed one wastes a candidate's time
   * and Google treats stale postings as a quality problem.
   *
   * datePosted is included the moment a role carries one. Every entry now has a
   * `postedDate` field, empty until someone reopens the role and fills in the real date.
   * An empty one is omitted rather than defaulted to today, because a guessed date claims a
   * vacancy has been open for a length of time that is not true.
   *
   * While every role is closed this produces an empty array and no JobPosting markup at all,
   * which is correct: there is nothing to advertise.
   */
  const jobSchema = careers
    .filter((job) => job.status === 'open')
    .map((job) => ({
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      employmentType: job.type === 'Full Time' ? 'FULL_TIME' : job.type,
      ...(job.postedDate ? { datePosted: job.postedDate } : {}),
      hiringOrganization: {
        '@type': 'Organization',
        name: company.name,
        sameAs: `https://${company.website}`,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          streetAddress: company.manufacturing.line1,
          addressLocality: 'Ludhiana',
          addressRegion: 'Punjab',
          addressCountry: 'IN',
        },
      },
      directApply: true,
    }));

  useSEO({
    title: lt('seo.title', 'Careers'),
    description:
      lt('seo.desc', 'Join KEAA International\'s team: explore current openings in production, quality, exports and more.'),
    breadcrumbs: [{ label: 'Home', to: '/' }, { label: 'Careers' }],
    schema: jobSchema,
  });

  const [activeJob, setActiveJob] = useState(null);
  const [openDetail, setOpenDetail] = useState(null);

  return (
    <>
      {/* --------------------------------------------------------------------- hero
          Rebuilt to match the framed GalleryHero used on every other interior page: one
          full-bleed team photo shown whole and bright, the breadcrumb top-left, and just
          the headline + a single "View Open Positions" button over a light bottom fade.
          The old split cropped the five-person group into a narrow right column and two
          navy gradients muted it; here the photo stays centred and light. The real KEAA
          figures moved out of the hero into the slim band directly below. The photo loads
          eagerly as the LCP image. */}
      <section className="px-3 sm:px-5 lg:px-6">
        <div className="relative isolate flex min-h-[460px] overflow-hidden rounded-3xl sm:min-h-[520px] lg:min-h-[600px]">
          <img
            src={localPhoto('/images/Career.jpg', 1600)}
            srcSet={localPhotoSrcSet('/images/Career.jpg')}
            sizes="100vw"
            alt={lt('hero.imgAlt', 'The KEAA team on the factory floor in branded uniform and safety gear')}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          {/* Bottom-weighted scrim only: the headline reads over the lower frame while the
              faces in the upper-middle stay bright. Far lighter than the old split's navy fade. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent"
          />
          {/* short top scrim so the breadcrumb stays legible over the bright factory ceiling */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-20 bg-gradient-to-b from-navy-950/65 to-transparent"
          />

          <nav
            aria-label={lt('breadcrumb.label', 'Breadcrumb')}
            className="absolute left-6 top-5 z-10 flex items-center gap-1.5 text-xs text-white/85 sm:left-10 sm:top-8 lg:left-12"
          >
            <Link to="/" className="border-b border-transparent pb-0.5 transition-colors hover:border-white/70">
              {lt('breadcrumb.home', 'Home')}
            </Link>
            <span aria-hidden className="text-white/45">/</span>
            <span aria-current="page">{lt('breadcrumb.current', 'Careers')}</span>
          </nav>

          <div className="relative z-10 mt-auto w-full p-6 sm:p-10 lg:p-12">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
                {lt('hero.title1', 'Build Your Career.')}
                <span className="block text-primary-light">{lt('hero.title2', 'Build the Future.')}</span>
              </h1>
              <Button href="#openings" variant="primary" className="mt-7">
                {lt('hero.cta', 'View Open Positions')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* real headline figures — moved out of the hero card into their own slim band so the
          hero itself stays light. Same width and gutter as the hero so the two read as a pair. */}
      <section className="px-3 sm:px-5 lg:px-6">
        <div className="mt-3 rounded-3xl border border-navy-100 bg-white px-6 py-7 shadow-card sm:mt-5 sm:px-10 lg:mt-6 lg:px-12">
          <ul className="grid grid-cols-2 gap-y-6 sm:grid-cols-4">
            {bannerStats.map((s, i) => (
              <li
                key={s.label}
                className={`text-center sm:text-left ${
                  i > 0 ? 'sm:border-l sm:border-navy-100 sm:pl-6' : ''
                }`}
              >
                <div className="font-display text-3xl font-bold leading-none text-primary-darker sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-2 text-sm font-semibold text-text">{lt(`stats.${i}.label`, s.label)}</div>
                <div className="mt-0.5 text-xs text-muted">{lt(`stats.${i}.sub`, s.sub)}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------- why work with us */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow={lt('why.eyebrow', 'Why Work With Us')}
              title={lt('why.title', 'A Career You Can Build On')}
              desc={lt('why.desc', 'Join an Indian manufacturer trusted across 42+ countries, built on advanced machinery, certified processes and a team that puts safety and quality first.')}
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="group h-full rounded-card border border-navy-100 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-cardHover">
                  <h4 className="font-display text-base font-semibold text-text">{lt(`perks.${i}.title`, p.title)}</h4>
                  <p className="mt-1.5 text-body-compact text-muted">{lt(`perks.${i}.desc`, p.desc)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="openings" className="section-pad scroll-mt-24">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading align="left" eyebrow={lt('openings.eyebrow', 'Open Positions')} title={lt('openings.title', 'Current Openings')} className="!mx-0" />
          </div>
          <div className="mt-8 divide-y divide-navy-100 rounded-card border border-navy-100 bg-white">
            {careers.map((job, i) => {
              const isOpen = job.status === 'open';
              const expanded = openDetail === job.title;
              return (
                <div key={job.title} className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h4 className="font-display text-sm font-semibold text-text">{lt(`jobs.${i}.title`, job.title)}</h4>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-navy-100 text-ink'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-ink/40'}`} />
                          {isOpen ? lt('jobs.open', 'Open') : lt('jobs.closed', 'Closed')}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-start gap-x-8 gap-y-3 text-xs text-ink">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{lt('jobs.locationLabel', 'Location')}</p>
                          <p className="mt-0.5">{lt(`jobs.${i}.location`, job.location)}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{lt('jobs.typeLabel', 'Type')}</p>
                          <p className="mt-0.5">{lt(`jobs.${i}.type`, job.type)}</p>
                        </div>
                      </div>
                      {job.description && (
                        <button
                          type="button"
                          onClick={() => setOpenDetail(expanded ? null : job.title)}
                          aria-expanded={expanded}
                          className="mt-3 inline-flex items-center border-b border-transparent pb-0.5 text-xs font-semibold text-primary-darker transition-colors hover:border-primary hover:text-primary-deep"
                        >
                          {expanded ? lt('jobs.hideDetails', 'Hide details') : lt('jobs.viewDetails', 'View details')}
                        </button>
                      )}
                    </div>
                    {isOpen ? (
                      <Button size="sm" variant="outlineNavy" onClick={() => setActiveJob(job)}>
                        {lt('jobs.apply', 'Apply Now')}
                      </Button>
                    ) : (
                      <span className="cursor-not-allowed rounded-card border border-navy-100 bg-navy-50 px-4 py-2 text-sm font-medium text-muted">
                        {lt('jobs.closedNote', 'Applications Closed')}
                      </span>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {expanded && job.description && (
                      <motion.div
                        key="detail"
                        initial={entryInitial({ opacity: 0, height: 0 })}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 max-w-3xl text-body-compact leading-relaxed text-ink">
                          {lt(`jobs.${i}.desc`, job.description)}
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
