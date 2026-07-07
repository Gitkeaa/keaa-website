import { Building2, Target, Eye, Gem, Globe2, ShieldCheck, ArrowRight, Quote, Linkedin, MessageCircle } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import { company, leadership, mdMessage, countries } from '../data/company';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

const whoWeAre = [
  { icon: ShieldCheck, title: 'Quality First', desc: 'We follow strict quality standards in every stage of production.' },
  { icon: Globe2, title: 'Global Reach', desc: 'Serving customers across 42+ countries with consistent reliability.' },
  { icon: Building2, title: '5 Manufacturing Units', desc: '25,000 sq. m of in-house facilities in Ludhiana, Punjab.' },
  { icon: Gem, title: 'Reliable Partner', desc: 'Long-term partnerships built on trust, since 2003.' },
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
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Who We Are
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy-800">
              A Legacy of Quality and Commitment
            </h2>
            <p className="mt-4 text-ink/70 leading-relaxed">{company.description}</p>
            <p className="mt-3 text-ink/70 leading-relaxed">
              With over two decades of experience, we have built a strong reputation for
              engineering excellence, product reliability and customer satisfaction across
              global markets — backed by our European sales office and warehouse,{' '}
              {company.group}, in Eindhoven, The Netherlands.
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

      {/* MD MESSAGE */}
      <section className="section-pad bg-navy-50 overflow-hidden">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[300px_1fr]">
          <Reveal>
            <ImagePlaceholder label="Sumit Moudgil — Managing Director" icon={Quote} ratio="aspect-[4/5]" />
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Message from Managing Director, keaa international Pvt. Ltd.
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy-800">Commitment to Excellence</h2>
            <p className="mt-4 text-ink/70 leading-relaxed">{mdMessage.message}</p>
            <p className="mt-5 font-display font-semibold text-navy-800">
              — {mdMessage.name}
              <span className="block text-sm font-normal text-ink/50">{mdMessage.role}</span>
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href={mdMessage.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-colors hover:border-gold-400 hover:text-gold-400"
                aria-label="Sumit Moudgil LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href={mdMessage.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-navy-100 text-navy-700 transition-colors hover:border-gold-400 hover:text-gold-400"
                aria-label="Sumit Moudgil WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </Reveal>
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

      {/* GLOBAL PRESENCE + CERTIFICATIONS */}
      <section className="section-pad bg-navy-50 overflow-hidden">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <Reveal className="rounded-2xl border border-navy-100 bg-white p-7 shadow-card">
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Global Presence
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Serving Customers Worldwide
            </h3>
            <ImagePlaceholder src={img.cargoShip} label="Export shipments — 42+ countries served" icon={Globe2} ratio="aspect-[16/9]" className="mt-5" />
            <div className="mt-5 flex flex-wrap gap-2">
              {countries.map((c) => (
                <span key={c.name} className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">
                  {c.flag} {c.name}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-navy-100 bg-white p-7 shadow-card">
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Certifications
            </span>
            <h3 className="mt-2 font-display text-xl font-semibold text-navy-800">
              Certified for Quality
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'ZED Silver'].map((c) => (
                <span
                  key={c}
                  className="rounded-lg border border-navy-100 bg-navy-50 px-4 py-2.5 text-xs font-semibold text-navy-700"
                >
                  {c}
                </span>
              ))}
            </div>
            <Button to="/certifications" variant="ghost" size="sm" icon={ArrowRight} className="mt-5 !px-0">
              View All Certificates
            </Button>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-navy-900">
        <div className="container-page flex flex-col items-center justify-between gap-6 py-12 sm:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">Let&rsquo;s Build Something Great Together</h3>
            <p className="mt-1 text-white/60">Get in touch with our team for premium quality products and reliable solutions.</p>
          </div>
          <Button to="/rfq" icon={ArrowRight} className="flex-shrink-0">
            Request a Quote
          </Button>
        </div>
      </section>
    </>
  );
}
