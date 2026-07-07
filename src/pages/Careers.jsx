import { useState } from 'react';
import { MapPin, Clock, Send, TrendingUp, GraduationCap, ShieldCheck, Users2 } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import { careers } from '../data/content';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

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

  const [applied, setApplied] = useState(null);

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
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Why Work With Us
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-navy-800">Build Your Career. Build the Future.</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {perks.map((p) => (
                <div key={p.title} className="flex gap-3">
                  <p.icon className="h-5 w-5 flex-shrink-0 text-gold-500" />
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

      <section className="section-pad bg-navy-50">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading align="left" eyebrow="Open Positions" title="Current Openings" className="!mx-0" />
          </div>
          <div className="mt-8 divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white">
            {careers.map((job) => (
              <div key={job.title} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                <div>
                  <h4 className="font-display text-sm font-semibold text-navy-800">{job.title}</h4>
                  <div className="mt-1 flex items-center gap-4 text-xs text-ink/55">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {job.type}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={applied === job.title ? 'navy' : 'outlineNavy'}
                  onClick={() => setApplied(job.title)}
                >
                  {applied === job.title ? 'Application Sent' : 'Apply Now'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page rounded-2xl bg-navy-900 p-10 text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold">Can&rsquo;t Find the Right Role?</h3>
            <p className="mt-1 text-white/60">Send us your resume and we&rsquo;ll reach out when a suitable opportunity is available.</p>
          </div>
          <Button href={`mailto:${'careers@keaa-international.net'}`} icon={Send} className="mt-6 flex-shrink-0 sm:mt-0">
            Send Resume
          </Button>
        </div>
      </section>
    </>
  );
}
