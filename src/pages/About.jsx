import { Building2, Target, Eye, Gem, Globe2, ShieldCheck, ArrowRight, Quote, Linkedin, MessageCircle, CheckCircle2 } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { company, leadership, managingDirectors } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

const whoWeAre = [
  { icon: ShieldCheck, title: 'Quality First', desc: 'We follow strict quality standards in every stage of production.' },
  { icon: Globe2, title: 'Global Reach', desc: 'Serving customers across 42+ countries with consistent reliability.' },
  { icon: Building2, title: '5 Manufacturing Units', desc: '25,000 sq. m of in-house facilities in Ludhiana, Punjab.' },
  { icon: Gem, title: 'Reliable Partner', desc: 'Long-term partnerships built on trust, since 2003.' },
];

const manufacturingStrength = [
  'Advanced In-house Manufacturing Facilities',
  'Dedicated Tool Room & R&D Centre',
  'In-house Hot Dip Galvanization Plant',
  'Material Testing & Quality Inspection Lab',
  'Certified Welders & Skilled Technical Workforce',
  'State-of-the-Art CNC & Automated Machinery',
];

export default function About() {
  useSEO({
    title: 'About Us',
    description:
      'Two decades of in-house manufacturing excellence -- learn KEAA International\'s journey, leadership team, vision and certifications.',
  });

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title="Building Strength."
        accent="Delivering Trust."
        desc="At KEAA International, we combine engineering expertise, in-house manufacturing and uncompromising quality to deliver scaffolding, formwork and industrial hardware that build a safer, stronger world."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
        image={img.steelFrame}
      />

      {/* WHO WE ARE */}
      <section className="section-pad overflow-hidden">
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Who We Are
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy-800">
              Engineering Excellence with Global Reach
            </h2>
            <p className="mt-4 text-ink/70 leading-relaxed">
              KEAA International Pvt. Ltd. is a leading Indo-Dutch manufacturer and exporter of
              scaffolding systems, formwork accessories, safety products, livestock housing
              solutions and garden hardware. With our European sales office in Eindhoven, The
              Netherlands, and advanced manufacturing facilities in India, we proudly serve
              customers across 42+ countries.
            </p>
            <p className="mt-3 text-ink/70 leading-relaxed">
              Our commitment to quality, innovation and precision engineering enables us to
              deliver products that meet the highest international standards while building
              long-term partnerships based on trust and reliability.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {company.stats.slice(0, 4).map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-bold text-navy-800">
                    <AnimatedCounter value={s.value} />
                  </p>
                  <p className="text-sm text-ink/60">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="relative">
            <ImagePlaceholder
              src={img.factoryInterior}
              label="KEAA International manufacturing plant — Ludhiana"
              icon={Building2}
              ratio="aspect-[4/3]"
              className="shadow-xl"   
            />
            <div className="mt-4 grid grid-cols-2 gap-4">
              {whoWeAre.map((w) => (
                <div key={w.title} className="rounded-xl bg-navy-50 p-4 transition-colors hover:bg-navy-100">
                  <w.icon className="h-5 w-5 text-gold-600" />
                  <h4 className="mt-2 text-sm font-semibold text-navy-800">{w.title}</h4>
                  <p className="mt-1 text-xs text-ink/60">{w.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
          </div>

          {/* Why KEAA stands apart + manufacturing strength */}
          <div className="mt-16 border-t border-navy-100 pt-12">
            <Reveal className="max-w-3xl">
              <span className="eyebrow">
                <span className="h-px w-5 bg-current" /> Why KEAA Stands Apart
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold text-navy-800">
                Complete Production Control, In-House
              </h3>
              <p className="mt-3 text-ink/70 leading-relaxed">
                Unlike conventional manufacturers, KEAA controls the complete production process
                in-house — ensuring consistent quality, faster lead times and dependable
                performance across every product line.
              </p>
            </Reveal>
            <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {manufacturingStrength.map((m) => (
                <StaggerItem key={m}>
                  <div className="flex h-full items-center gap-3 rounded-xl border border-navy-100 bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:border-gold-300 hover:shadow-cardHover">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gold-50 text-gold-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium leading-snug text-navy-800">{m}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* JOURNEY TIMELINE */}
      <section className="section-pad bg-navy-50">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Our Journey" title="Growing Stronger, Together" />
          </Reveal>
          <StaggerGroup className="mt-14 grid gap-8 lg:grid-cols-5">
            {company.timeline.map((t, i) => (
              <StaggerItem key={t.year} className="relative">
                <div className="flex items-center gap-3 lg:flex-col lg:gap-2 lg:text-center">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-navy-700 font-display text-xs font-bold text-gold-400">
                    {t.year}
                  </span>
                  <div className="lg:mt-2">
                    <h4 className="font-display text-sm font-semibold text-navy-800">{t.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-ink/60">{t.desc}</p>
                  </div>
                </div>
                {i < company.timeline.length - 1 && (
                  <span className="absolute left-6 top-12 hidden h-px w-full bg-navy-200 lg:left-1/2 lg:top-6 lg:block" />
                )}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* VISION MISSION VALUES */}
      <section className="section-pad">
        <div className="container-page">
          <StaggerGroup className="grid gap-6 lg:grid-cols-3">
            <StaggerItem>
              <div className="h-full rounded-2xl border border-navy-100 p-7 shadow-card transition-shadow hover:shadow-cardHover">
                <Eye className="h-7 w-7 text-gold-500" />
                <h3 className="mt-4 font-display text-lg font-semibold text-navy-800">Our Vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{company.values.vision}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="h-full rounded-2xl border border-navy-100 p-7 shadow-card transition-shadow hover:shadow-cardHover">
                <Target className="h-7 w-7 text-gold-500" />
                <h3 className="mt-4 font-display text-lg font-semibold text-navy-800">Our Mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{company.values.mission}</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="h-full rounded-2xl border border-navy-100 p-7 shadow-card transition-shadow hover:shadow-cardHover">
                <Gem className="h-7 w-7 text-gold-500" />
                <h3 className="mt-4 font-display text-lg font-semibold text-navy-800">Our Core Values</h3>
                <ul className="mt-2 space-y-1.5 text-sm text-ink/65">
                  {company.values.values.map((v) => (
                    <li key={v} className="flex gap-2">
                      <span className="text-gold-500">•</span> {v}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* MESSAGE FROM MANAGING DIRECTORS */}
      <section className="section-pad bg-navy-50 overflow-hidden">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Leadership" title="Message from Managing Directors" />
          </Reveal>
          <div className="mt-14 space-y-14">
            {managingDirectors.map((m, i) => {
              const flip = i % 2 === 1;
              return (
                <Reveal key={m.name} delay={i * 0.1}>
                  <div
                    className={`grid items-center gap-10 ${
                      flip ? 'lg:grid-cols-[1fr_300px]' : 'lg:grid-cols-[300px_1fr]'
                    }`}
                  >
                    <div className={flip ? 'lg:order-2' : ''}>
                      <div className="group rounded-2xl border border-navy-100 bg-white p-2 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover">
                        <div className="overflow-hidden rounded-xl">
                          <img
                            src={m.photo}
                            alt={`${m.name} — ${m.role}`}
                            loading="lazy"
                            className="aspect-[4/3] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    </div>
                    <div className={flip ? 'lg:order-1 lg:text-right' : ''}>
                      <span className={`eyebrow ${flip ? 'lg:justify-end' : ''}`}>
                        <span className="h-px w-5 bg-current" /> {m.name}
                      </span>
                      <p className="mt-4 text-ink/70 leading-relaxed">{m.message}</p>
                      <p className="mt-5 font-display font-semibold text-navy-800">
                        — {m.name}
                        <span className="block text-sm font-normal text-ink/50">{m.role}</span>
                      </p>
                      <div
                        className={`mt-4 flex items-center gap-3 ${flip ? 'lg:justify-end' : ''}`}
                      >
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-colors hover:border-gold-400 hover:text-gold-400"
                          aria-label={`${m.name} LinkedIn`}
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEAM */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Our Leadership Team" title="Experienced Leaders. Strong Foundation." />
          </Reveal>
          <StaggerGroup className="mx-auto mt-14 flex max-w-5xl flex-wrap justify-center gap-7">
            {leadership.filter(l => l.role !== 'Chief Managing Director' && l.role !== 'Managing Director').map((l) => (
              <StaggerItem key={l.name} className="w-full sm:w-[calc(50%-14px)] lg:w-[calc(33.333%-19px)] max-w-sm">
                <div className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-navy-100 bg-white px-7 pb-7 pt-9 text-center shadow-card transition-all duration-300 hover:-translate-y-2 hover:border-gold-300 hover:shadow-cardHover">
                  {/* Accent bar that draws in on hover */}
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 transition-transform duration-300 group-hover:scale-x-100" />
                  {/* Soft gold glow behind the avatar */}
                  <span className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold-400/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Avatar — gold gradient ring around a photo, or a navy monogram fallback */}
                  <div className="relative rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-600 p-[3px] shadow-lg shadow-gold-500/25 transition-transform duration-300 group-hover:scale-105">
                    <div className="h-28 w-28 overflow-hidden rounded-full bg-gradient-to-br from-navy-800 to-navy-950">
                      {l.photo ? (
                        <img
                          src={l.photo}
                          alt={l.name}
                          loading="lazy"
                          className="h-full w-full rounded-full object-cover object-top"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold tracking-wide text-gold-400">
                          {l.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="mt-5 font-display text-lg font-semibold text-navy-800">{l.name}</h4>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-600">{l.role}</p>
                  <span className="mt-3 h-px w-10 bg-navy-100 transition-all duration-300 group-hover:w-16 group-hover:bg-gold-400" />
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{l.bio}</p>

                  <div className="mt-auto flex items-center justify-center gap-3 pt-6">
                    {l.linkedin && (
                      <a
                        href={l.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-400 hover:text-white"
                        aria-label={`${l.name} LinkedIn`}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                    )}
                    {l.whatsapp && (
                      <a
                        href={l.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-all hover:-translate-y-0.5 hover:border-gold-400 hover:bg-gold-400 hover:text-white"
                        aria-label={`${l.name} WhatsApp`}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-navy-900">
        <div className="container-page py-16 text-center">
          <h3 className="mx-auto max-w-3xl font-display text-2xl font-bold text-white sm:text-3xl">
            Building Long-Term Partnerships Worldwide
          </h3>
          <p className="mx-auto mt-3 max-w-2xl leading-relaxed text-white/60">
            From concept to delivery, KEAA International combines engineering expertise, modern
            manufacturing and global export experience to provide reliable solutions trusted by
            customers across the world.
          </p>
          <p className="mt-5 font-display text-lg font-semibold text-gold-400">
            Built for Safety. Built to Last.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/rfq" icon={ArrowRight}>
              Request a Quote
            </Button>
            <Button to="/contact" variant="outline">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
