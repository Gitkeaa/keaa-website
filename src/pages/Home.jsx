import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Globe2,
  Factory,
  PackageCheck,
  ShieldCheck,
  Truck,
  Settings2,
  Headphones,
  ArrowRight,
  Download,
  Quote,
  Award,
  ChevronDown,
  Play,
  ExternalLink,
} from 'lucide-react';
import Button from '../components/ui/Button';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import { staggerParent, staggerChild } from '../lib/motionVariants';
import useSEO from '../hooks/useSEO';
import { company, chairmanMessage } from '../data/company';
import { productCategories, categoryImages } from '../data/products';
import { featuredProjects, droneFilmUrl } from '../data/content';
import { img } from '../data/images';

const heroStats = [
  { value: '20+', label: 'Years of Experience' },
  { value: '42+', label: 'Countries Exported' },
  { value: '5', label: 'Manufacturing Facilities' },
  { value: '100+', label: 'Product Range' },
];

const whyChoose = [
  { icon: ShieldCheck, title: 'Premium Quality', desc: 'International quality standards & strict quality control.' },
  { icon: Globe2, title: 'Global Exports', desc: 'Exporting to 42+ countries across the world.' },
  { icon: Settings2, title: 'Custom Solutions', desc: 'Tailored solutions as per customer requirements.' },
  { icon: PackageCheck, title: 'Competitive Pricing', desc: 'Best quality products at highly competitive prices.' },
  { icon: Truck, title: 'Timely Delivery', desc: 'On-time delivery ensuring smooth project execution.' },
  { icon: Headphones, title: 'Dedicated Support', desc: 'Expert support from inquiry to after-sales service.' },
];

const certificationCards = [
  {
    name: 'ISO 9001:2015',
    body: 'TÜV Rheinland',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-blue-600">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M30,50 L45,65 L70,35" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <text x="50" y="88" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor">ISO 9001</text>
      </svg>
    ),
  },
  {
    name: 'CE Certified',
    body: 'European Union',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-navy-900">
        <path d="M45,25 A25,25 0 1,0 45,75" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        <path d="M80,25 A25,25 0 1,0 80,75" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
        <line x1="53" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    name: 'SLV Mannheim',
    body: 'Germany EN 1090',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-amber-650">
        <polygon points="50,10 85,25 85,65 50,90 15,65 15,25" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M35,45 L50,30 L65,45 M50,30 L50,70" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <text x="50" y="80" fontFamily="sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="currentColor">SLV</text>
      </svg>
    ),
  },
  {
    name: 'Sigma Karlsruhe',
    body: 'Germany EN 74',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-red-600">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M35,30 L65,30 L45,50 L65,70 L35,70" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'AEO Certificate',
    body: 'Govt. of India',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-teal-600">
        <polygon points="50,15 80,30 80,70 50,85 20,70 20,30" fill="none" stroke="currentColor" strokeWidth="8" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="6" />
        <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="6" />
        <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="6" />
      </svg>
    ),
  },
  {
    name: 'Star Export House',
    body: 'Ministry of Commerce',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-yellow-500">
        <path d="M50,10 L62,38 L92,38 L68,56 L78,84 L50,66 L22,84 L32,56 L8,38 L38,38 Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'BSCI Compliant',
    body: 'Social Standards',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-green-600">
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" />
        <path d="M30,60 C40,40 60,40 70,60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <circle cx="50" cy="30" r="10" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: 'ETA Nailing Plates',
    body: 'Denmark',
    logo: (
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-indigo-700">
        <rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="currentColor" strokeWidth="8" />
        <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="6" />
        <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="6" />
      </svg>
    ),
  },
];

const projectImages = [img.heroScaffoldTower, img.factoryMachines, img.scaffoldHighRise, img.scaffoldCrane];

export default function Home() {
  useSEO({
    title: 'KEAA International | Scaffolding, Formwork & Industrial Manufacturer',
    description:
      'ISO 9001:2015 certified manufacturer and exporter of scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware. Exporting to 42+ countries since 2003.',
  });
  const { scrollY } = useScroll();
  const heroParallaxY = useTransform(scrollY, [0, 800], [0, 160]);

  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[640px] items-center overflow-hidden bg-navy-950 text-white sm:min-h-[720px] lg:min-h-[820px] xl:min-h-[880px]">
        <motion.div
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ y: heroParallaxY }}
          className="absolute inset-0"
        >
          <img
            src={img.heroScaffoldTower}
            alt="Scaffolding and formwork at a construction site"
            className="h-[120%] w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/30" />
        <div className="absolute inset-0 bg-spec-grid bg-[size:42px_42px] opacity-[0.08]" />
        <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="container-page relative w-full py-20 sm:py-24">
          <motion.div initial="hidden" animate="show" variants={staggerParent} className="max-w-xl">
            <motion.span variants={staggerChild} className="eyebrow text-gold-400">
              <span className="h-px w-5 bg-current" /> ISO 9001:2015 Certified Manufacturer &amp; Exporter
            </motion.span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl xl:text-7xl">
              <motion.span variants={staggerChild} className="block">
                Engineering Reliable
              </motion.span>
              <motion.span variants={staggerChild} className="block text-gold-400">
                Scaffolding &amp; Formwork
              </motion.span>
              <motion.span variants={staggerChild} className="block">
                Solutions
              </motion.span>
            </h1>
            <motion.p variants={staggerChild} className="mt-6 max-w-lg text-base text-white/75 sm:text-lg">
              {company.name} is a leading manufacturer and exporter delivering world-class
              scaffolding systems, formwork accessories, safety products, livestock housing
              solutions and garden hardware to over 42 countries.
            </motion.p>
            <motion.div variants={staggerChild} className="mt-9 flex flex-wrap items-center gap-4">
              {/* Watch film — sits in a glass chip so it pairs cleanly with the button beside it */}
              <a
                href={droneFilmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-5 text-left backdrop-blur-sm transition-colors hover:border-gold-400/50 hover:bg-white/10"
                aria-label="Watch the KEAA drone film (opens in a new tab)"
              >
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                  {/* soft pulse */}
                  <span
                    className="absolute inset-0 rounded-full bg-gold-500/25 animate-ping motion-reduce:animate-none"
                    style={{ animationDuration: '2.8s' }}
                  />
                  {/* gold play disc */}
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-md shadow-gold-500/30 transition-transform duration-200 group-hover:scale-105">
                    <Play className="h-[18px] w-[18px] translate-x-[1px] fill-current" />
                  </span>
                </span>
                <span className="leading-tight">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white transition-colors group-hover:text-gold-300">
                    Watch the drone film
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </span>
                  <span className="mt-0.5 block text-xs text-white/55">A bird&rsquo;s-eye view of KEAA</span>
                </span>
              </a>
              <Button to="/downloads" variant="outline" size="lg" icon={Download}>
                Download Catalog
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 text-white/40 sm:block"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>

        <div className="relative mt-auto border-t border-white/10 bg-navy-950/70 backdrop-blur-sm">
          <div className="container-page grid grid-cols-2 gap-6 py-7 sm:grid-cols-4">
            {heroStats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                  <AnimatedCounter value={s.value} />
                </div>
                <div className="text-xs text-white/55">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATION MARQUEE */}
      <div className="overflow-hidden border-y border-navy-100 bg-navy-50/40 py-6">
        <div className="flex w-max animate-marquee gap-6">
          {[...certificationCards, ...certificationCards].map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white px-5 py-3 shadow-[0_2px_8px_rgba(10,35,66,0.03)] transition-all hover:border-gold-400/40 hover:shadow-[0_4px_12px_rgba(10,35,66,0.06)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-navy-50/50">
                {c.logo}
              </div>
              <div className="text-left">
                <p className="font-display text-sm font-bold text-navy-900 leading-tight whitespace-nowrap">{c.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5 whitespace-nowrap">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WHO WE ARE / OVERVIEW */}
      <section className="section-pad bg-navy-50">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Who We Are"
              title={
                <>
                  Engineering Excellence.{' '}
                  <span className="text-gold-500">Building Global Trust.</span>
                </>
              }
              desc="KEAA International is a leading manufacturer and exporter of scaffolding systems, formwork accessories, safety products and industrial solutions, delivering engineering excellence to more than 42 countries with precision, quality and reliability."
            />
          </Reveal>
        </div>
      </section>

      {/* PRODUCT CATEGORIES */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Our Product Categories"
              title="Wide Range of Quality Products"
              desc="Five specialised product lines, engineered and certified for global construction, agriculture and outdoor markets."
            />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {productCategories.map((cat, i) => (
              <StaggerItem key={cat.slug}>
                <Card className="flex h-full flex-col p-5">
                  <ImagePlaceholder
                    src={categoryImages[cat.slug]}
                    label={cat.name}
                    ratio="aspect-square"
                    tone={i % 2 ? 'light' : 'navy'}
                  />
                  <h3 className="mt-4 font-display text-base font-semibold text-navy-800">{cat.name}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-ink/60">{cat.short}</p>
                  <Button to={`/products#${cat.slug}`} variant="ghost" size="sm" icon={ArrowRight} className="mt-4 !px-0">
                    View Products
                  </Button>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* WHY CHOOSE KEAA */}
      <section className="section-pad bg-navy-50">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              eyebrow="Why Choose KEAA"
              title="Built on Quality. Driven by Trust."
              desc="Two decades of in-house manufacturing, certification and export discipline behind every shipment."
            />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChoose.map((w) => (
              <StaggerItem key={w.title}>
                <div className="flex h-full gap-4 rounded-xl bg-white p-6 shadow-card transition-shadow hover:shadow-cardHover">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-navy-700 text-white">
                    <w.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-navy-800">{w.title}</h3>
                    <p className="mt-1 text-sm text-ink/60">{w.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
      {/* CHAIRMAN MESSAGE */}
      <section className="section-pad overflow-hidden">
        <div className="container-page grid items-center gap-10 lg:grid-cols-[340px_1fr]">
          <Reveal x={-20} y={0}>
            <div className="group rounded-2xl border border-navy-100 bg-white p-2 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={chairmanMessage.photo}
                  alt={`${chairmanMessage.name || 'Chairman'} — KEAA International`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Message from Chairman, keaa international Pvt. Ltd.
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy-800">A Legacy of Trust &amp; Quality</h2>
            <p className="mt-4 text-ink/70 leading-relaxed">{chairmanMessage.message}</p>
            <p className="mt-5 font-display font-semibold text-navy-800">
              {chairmanMessage.name ? (
                <>
                  — {chairmanMessage.name}
                  <span className="block text-sm font-normal text-ink/50">{chairmanMessage.role}</span>
                </>
              ) : (
                <>— {chairmanMessage.role}</>
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {/* MANUFACTURING EXCELLENCE */}
      <section className="section-pad bg-navy-50 overflow-hidden">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <ImagePlaceholder
              src={img.factoryMachines}
              label="In-house manufacturing facility, Ludhiana"
              icon={Factory}
              ratio="aspect-[4/3]"
              className="shadow-xl"
            />
          </Reveal>
          <Reveal delay={0.1} className="lg:order-1">
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Manufacturing Excellence
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold text-navy-800">
              Advanced Manufacturing, Strong Production Capability
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-ink/70">
              {[
                'State-of-the-art manufacturing facilities across 25,000 sq. m.',
                'Advanced machinery & technically qualified workforce',
                'Strict in-house quality control at every stage',
                'Large production capacity to meet global demand',
              ].map((li) => (
                <li key={li} className="flex gap-2.5">
                  <ShieldCheck className="h-5 w-5 flex-shrink-0 text-gold-500" />
                  {li}
                </li>
              ))}
            </ul>
            <Button to="/manufacturing" variant="navy" size="sm" icon={ArrowRight} className="mt-6">
              View Manufacturing
            </Button>
          </Reveal>
        </div>
      </section>

      {/* GLOBAL PRESENCE */}
      <section className="section-pad overflow-hidden">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Global Presence" title="Proudly Exporting Worldwide" />
          </Reveal>
          <Reveal delay={0.1} className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_280px]">
            <ImagePlaceholder
              src={img.containersStacked}
              label="Export-ready shipments — 42+ countries served"
              icon={Globe2}
              ratio="aspect-[16/7]"
              overlay
            />
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-1">
              <div>
                <p className="font-display text-3xl font-bold text-navy-800">
                  <AnimatedCounter value="42+" />
                </p>
                <p className="text-sm text-ink/60">Countries Exported</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-navy-800">
                  <AnimatedCounter value="1000+" />
                </p>
                <p className="text-sm text-ink/60">Happy Clients</p>
              </div>
              <Button to="/contact" variant="outlineNavy" size="sm" icon={ArrowRight}>
                Get in Touch
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="section-pad bg-navy-50">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Featured Projects" title="Trusted by Clients Worldwide" />
          </Reveal>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProjects.slice(0, 4).map((p, i) => (
              <StaggerItem key={p.title}>
                <Card className="overflow-hidden">
                  <ImagePlaceholder src={projectImages[i]} label={p.title} ratio="aspect-[4/3]" />
                  <div className="p-4">
                    <Badge tone="gold">{p.category}</Badge>
                    <h3 className="mt-2 font-display text-sm font-semibold text-navy-800">{p.title}</h3>
                    <p className="text-xs text-ink/50">{p.location}</p>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <div className="mt-8 text-center">
            <Button to="/projects-gallery" variant="outlineNavy" icon={ArrowRight}>
              View All Projects
            </Button>
          </div>
        </div>
      </section>

      {/* GLOBAL PRESENCE + CERTIFICATIONS */}
      <section className="section-pad">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          {/* Global presence */}
          <Reveal className="group flex flex-col rounded-2xl border border-navy-100 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Global Presence
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-navy-800">Serving Customers Worldwide</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Trusted exports to 42+ countries across the Middle East, Europe, Africa and Asia.
            </p>
            <div className="my-6 flex flex-1 items-center overflow-hidden rounded-xl bg-navy-50/30 p-4">
              <img
                src="/images/global-presence-map.png"
                alt="KEAA global presence — export markets across 42+ countries"
                loading="lazy"
                className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-navy-800">
                <Globe2 className="h-4 w-4 text-gold-600" /> 42+ Countries Served
              </span>
              <Button to="/about" variant="ghost" size="sm" icon={ArrowRight} className="!px-0">
                View Our Global Presence
              </Button>
            </div>
          </Reveal>

          {/* Certifications */}
          <Reveal delay={0.1} className="flex flex-col rounded-2xl border border-navy-100 bg-white p-8 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
            <span className="eyebrow">
              <span className="h-px w-5 bg-current" /> Certifications
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-navy-800">
              Certified for Quality. <span className="text-gold-500">Committed to Excellence.</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              Independently audited and certified by TÜV Rheinland and the Government of India.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {company.certifications.map((c) => (
                <a
                  key={c.name}
                  href={c.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 rounded-xl border border-navy-100 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-card"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-50 text-gold-500 transition-colors group-hover:bg-gold-50">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-navy-800">{c.name}</span>
                    <span className="block truncate text-[10px] text-ink/50">{c.body}</span>
                  </span>
                </a>
              ))}
            </div>
            <Button to="/certifications" variant="ghost" size="sm" icon={ArrowRight} className="mt-auto pt-6 !px-0">
              View All Certificates
            </Button>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-navy-900">
        <div className="absolute inset-0 opacity-20">
          <img src={img.scaffoldCrane} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/95 to-navy-900/80" />
        <div className="container-page relative flex flex-col items-center justify-between gap-6 py-14 sm:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">
              Looking for Reliable Scaffolding &amp; Formwork Solutions?
            </h3>
            <p className="mt-1 text-white/60">Get in touch with our team for the best solutions for your project.</p>
          </div>
          <Button to="/rfq" icon={ArrowRight} className="flex-shrink-0">
            Request a Quote
          </Button>
        </div>
      </section>
    </>
  );
}
