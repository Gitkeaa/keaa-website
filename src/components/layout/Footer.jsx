import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Printer,
  Mail,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  ChevronRight,
  ChevronsUp,
  Globe,
  Factory,
  Users,
  Building2,
  ShieldCheck,
  Handshake,
} from 'lucide-react';
import Logo from './Logo';
import { company } from '../../data/company';
import { footerLinks } from '../../data/navigation';
import { getAllCategories } from '../../data/categories';

/**
 * Footer — deep navy card on a light page, over the supplied blueprint artwork.
 *
 * The artwork is already very dark: measured, its median luminance is 0.006 and its
 * brightest pixel (a wireframe line, right-hand side) is 0.0595. That single fact sets
 * two rules:
 *
 *   1. A ~0.6 navy scrim sits over it, holding the artwork back to a texture. Push it
 *      much further and the dotted world map disappears entirely.
 *   2. No text goes below 55% white. Even with no scrim at all, white/45 — the old
 *      copyright colour — measures 3.34:1 against the brightest pixel and fails; at 55%
 *      it clears AA with room, and the scrim only widens that margin.
 *
 * Brand colours on this ground: #8CCDF3 links (10.7:1), #3A86C6 icons and rules
 * (4.8:1). Gold is gone entirely; it survives only as #E7B321 on navy for certification
 * badges, and there are none here.
 */

const SOCIALS = [
  { icon: Linkedin, href: company.social.linkedin, label: 'LinkedIn' },
  { icon: Facebook, href: company.social.facebook, label: 'Facebook' },
  { icon: Instagram, href: company.social.instagram, label: 'Instagram' },
  { icon: Youtube, href: company.social.youtube, label: 'YouTube' },
];

/**
 * Every figure here is taken from src/data/company.js rather than from the design mock,
 * which quoted "200+ skilled professionals" (the company records 150+) and "25,000+
 * sq. m." (the company records 25,000 sq. m.).
 */
const CREDENTIALS = [
  { Icon: Globe, value: '42+ Countries', label: 'Exporting worldwide' },
  { Icon: Factory, value: '5', label: 'Manufacturing facilities' },
  { Icon: Users, value: '150+', label: 'Skilled professionals' },
  { Icon: Building2, value: '25,000 sq. m.', label: 'In-house manufacturing area' },
  { Icon: ShieldCheck, value: 'Quality Assured', label: 'Strict control at every stage' },
  { Icon: Handshake, value: 'Built on Trust', label: `Long-term partnerships since ${company.founded}` },
];

function ColumnHeading({ children }) {
  return (
    <h4 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-white">
      {children}
      <span aria-hidden className="mt-3 block h-px w-10 bg-gradient-to-r from-primary to-primary/0" />
    </h4>
  );
}

function NavLinkRow({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="group inline-flex items-center gap-2 text-white/65 transition-colors duration-200 hover:text-primary-light"
      >
        <ChevronRight
          aria-hidden
          className="h-3.5 w-3.5 flex-shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none"
        />
        {children}
      </Link>
    </li>
  );
}

function ContactRow({ icon: Icon, children }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden
        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/[0.12] ring-1 ring-inset ring-primary/25"
      >
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <div className="min-w-0 space-y-1 leading-relaxed text-white/65">{children}</div>
    </li>
  );
}

export default function Footer() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();
  const landlineNumbers = Array.isArray(company.landline) ? company.landline : [company.landline];

  const backToTop = () =>
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

  return (
    <footer className="bg-surface px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="relative isolate overflow-hidden rounded-2xl bg-surface-deep text-white/70 sm:rounded-3xl">
        {/* The supplied artwork, and the scrim that keeps text over it legible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/footer.jpg')" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: 'linear-gradient(180deg, rgb(var(--color-surface-deep) / 0.58) 0%, rgb(var(--color-surface-deep) / 0.70) 100%)' }}
        />
        {/* A single cool light source so the navy is not flat. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-32 z-0 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(var(--color-primary) / 0.30), transparent 68%)' }}
        />

        <div className="container-page relative z-10 grid gap-x-8 gap-y-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1.15fr_1fr_1.35fr] lg:py-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">{company.description}</p>

            <div className="mt-7 flex gap-2.5">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href !== '#' ? '_blank' : undefined}
                  rel={social.href !== '#' ? 'noopener noreferrer' : undefined}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.04] text-white/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_10px_22px_-10px_rgb(var(--color-primary)_/_0.85)] motion-reduce:hover:translate-y-0"
                  aria-label={social.label}
                >
                  <social.icon className="h-[17px] w-[17px]" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <ColumnHeading>Quick Links</ColumnHeading>
            <ul className="mt-5 space-y-3 text-sm">
              {footerLinks.quick.map((l) => (
                <NavLinkRow key={l.to} to={l.to}>
                  {l.label}
                </NavLinkRow>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Products</ColumnHeading>
            <ul className="mt-5 space-y-3 text-sm">
              {getAllCategories().map((c) => (
                <NavLinkRow key={c.slug} to={`/products/${c.slug}`}>
                  {c.name}
                </NavLinkRow>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Resources</ColumnHeading>
            <ul className="mt-5 space-y-3 text-sm">
              {footerLinks.resources.map((l) => (
                <NavLinkRow key={l.to} to={l.to}>
                  {l.label}
                </NavLinkRow>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Contact Us</ColumnHeading>
            <ul className="mt-5 space-y-4 text-sm">
              <ContactRow icon={MapPin}>
                <span className="block">
                  {company.manufacturing.line1}
                  <br />
                  {company.manufacturing.line2}
                </span>
              </ContactRow>

              <ContactRow icon={Phone}>
                {company.phones.map((p) => (
                  <span key={p} className="block">
                    {p}
                  </span>
                ))}
              </ContactRow>

              <ContactRow icon={Printer}>
                {landlineNumbers.map((line) => (
                  <span key={line} className="block">
                    Tel: {line}
                  </span>
                ))}
                <span className="block">Fax: {company.fax}</span>
              </ContactRow>

              <ContactRow icon={Mail}>
                {company.emails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    /* break-words, not break-all: break-all splits mid-syllable and turns
                       "…international.net" into "…international.ne / t". */
                    className="block break-words text-[13px] transition-colors duration-200 hover:text-primary-light"
                  >
                    {email}
                  </a>
                ))}
              </ContactRow>
            </ul>
          </div>
        </div>

        {/* Credentials strip. */}
        <div className="relative z-10 border-t border-white/[0.08]">
          <div className="container-page grid grid-cols-1 gap-x-6 gap-y-7 py-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {CREDENTIALS.map(({ Icon, value, label }, i) => (
              <div
                key={value}
                className={`flex items-center gap-3 xl:pl-5 ${i > 0 ? 'xl:border-l xl:border-white/[0.08]' : 'xl:pl-0'}`}
              >
                <Icon aria-hidden className="h-7 w-7 flex-shrink-0 text-primary" strokeWidth={1.4} />
                <div className="min-w-0">
                  {/* The value is the headline of each cell; wrapping it reads as a bug. */}
                  <div className="whitespace-nowrap font-display text-sm font-bold leading-tight text-white">{value}</div>
                  <div className="mt-0.5 text-[12px] leading-snug text-white/55">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar. */}
        <div className="relative z-10 border-t border-white/[0.08] bg-black/20">
          {/* The AI chat widget is fixed to the viewport's bottom-right and lands exactly
              on top of "Back to Top" once the footer is in view. The extra right padding
              parks the button clear of it. */}
          <div className="container-page flex flex-col items-center gap-4 py-5 text-xs text-white/55 lg:flex-row lg:justify-between lg:pr-44">
            <p className="order-1 text-center lg:text-left">
              &copy; {year} {company.name} All Rights Reserved.
            </p>

            <p className="order-3 text-center lg:order-2">
              Designed &amp; Developed by <span className="font-semibold text-white/75">Kishlay Raj</span>
            </p>

            <div className="order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:order-3">
              <Link to="/privacy-policy" className="transition-colors duration-200 hover:text-primary-light">
                Privacy Policy
              </Link>
              <span aria-hidden className="text-white/20">|</span>
              <Link to="/terms" className="transition-colors duration-200 hover:text-primary-light">
                Terms &amp; Conditions
              </Link>

              <button
                type="button"
                onClick={backToTop}
                className="group ml-1 inline-flex items-center gap-2 rounded-lg border border-white/[0.14] bg-white/[0.04] px-3.5 py-2 font-medium text-white/75 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white motion-reduce:hover:translate-y-0"
              >
                Back to Top
                <ChevronsUp
                  aria-hidden
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
