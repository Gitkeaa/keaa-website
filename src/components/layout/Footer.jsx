import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
/* Social marks are the ONE sanctioned exception to the site's icon-free rule: a platform's
   logo is its name, and spelling them out reads worse than the marks. Everything else in
   this footer states itself in type — uppercase labels and hover underlines. */
import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import Logo from './Logo';
import { openCookiePreferences } from '../CookieConsent';
import { company, developer } from '../../data/company';
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
 * Brand colours on this ground: #8CCDF3 links (10.7:1), #3A86C6 icons and labels
 * (4.8:1). Gold is gone entirely; it survives only as #E7B321 on navy for certification
 * badges, and there are none here.
 */

/**
 * Channels without a live account are `null` in company.js and are filtered out here, so
 * the row only ever shows icons that go somewhere. This replaced an '#' href that rendered
 * a real, hover-animated button which just scrolled the reader to the top.
 */
const SOCIALS = [
  { icon: Linkedin, href: company.social.linkedin, label: 'LinkedIn' },
  { icon: Facebook, href: company.social.facebook, label: 'Facebook' },
  { icon: Instagram, href: company.social.instagram, label: 'Instagram' },
  { icon: Youtube, href: company.social.youtube, label: 'YouTube' },
].filter((s) => Boolean(s.href));

/**
 * Every figure here is taken from src/data/company.js rather than from the design mock,
 * which quoted "200+ skilled professionals" (the company records 150+) and "25,000+
 * sq. m." (the company records 25,000 sq. m.).
 */
const CREDENTIALS = [
  { value: '42+ Countries', label: 'Exporting worldwide' },
  { value: '5', label: 'Manufacturing facilities' },
  { value: '150+', label: 'Skilled professionals' },
  { value: '25,000 sq. m.', label: 'In-house manufacturing area' },
  { value: 'Quality Assured', label: 'Strict control at every stage' },
  { value: 'Built on Trust', label: `Long-term partnerships since ${company.founded}` },
];

function ColumnHeading({ children }) {
  return (
    <h4 className="font-display text-[13px] font-semibold uppercase tracking-[0.12em] text-white">
      {children}
    </h4>
  );
}

/** The chevron is gone; the affordance is a brand-blue underline that draws in on hover. */
function NavLinkRow({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="inline-block border-b border-transparent pb-0.5 text-white/65 transition-colors duration-200 hover:border-primary hover:text-primary-light"
      >
        {children}
      </Link>
    </li>
  );
}

/**
 * A contact block naming itself in type instead of behind a pictogram. The uppercase
 * brand-blue label is unambiguous where a printer/pin glyph was a guess, and it reads the
 * same in every language.
 */
function ContactRow({ label, children }) {
  return (
    <li>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{label}</p>
      <div className="mt-1.5 min-w-0 space-y-1 leading-relaxed text-white/65">{children}</div>
    </li>
  );
}

export default function Footer() {
  const reduce = useReducedMotion();
  const year = new Date().getFullYear();
  const landlineNumbers = Array.isArray(company.landline) ? company.landline : [company.landline];

  const backToTop = () =>
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });

  // Flush, square footer (no rounded "floating card" curve or inset) on every page.
  return (
    <footer className="bg-surface">
      <div className="relative isolate overflow-hidden bg-surface-deep text-white/70">
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
                  target="_blank"
                  rel="noopener noreferrer"
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
            <ul className="mt-8 space-y-3 text-sm">
              {footerLinks.quick.map((l) => (
                <NavLinkRow key={l.to} to={l.to}>
                  {l.label}
                </NavLinkRow>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Products</ColumnHeading>
            <ul className="mt-8 space-y-3 text-sm">
              {getAllCategories().map((c) => (
                <NavLinkRow key={c.slug} to={`/products/${c.slug}`}>
                  {c.name}
                </NavLinkRow>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Resources</ColumnHeading>
            <ul className="mt-8 space-y-3 text-sm">
              {footerLinks.resources.map((l) => (
                <NavLinkRow key={l.to} to={l.to}>
                  {l.label}
                </NavLinkRow>
              ))}
            </ul>
          </div>

          <div>
            <ColumnHeading>Contact Us</ColumnHeading>
            <ul className="mt-8 space-y-4 text-sm">
              <ContactRow label="Address">
                <span className="block">
                  {company.manufacturing.line1}
                  <br />
                  {company.manufacturing.line2}
                </span>
              </ContactRow>

              <ContactRow label="Mobile">
                {company.phones.map((p) => (
                  <span key={p} className="block">
                    {p}
                  </span>
                ))}
              </ContactRow>

              <ContactRow label="Telephone &amp; Fax">
                {landlineNumbers.map((line) => (
                  <span key={line} className="block">
                    Tel: {line}
                  </span>
                ))}
                <span className="block">Fax: {company.fax}</span>
              </ContactRow>

              <ContactRow label="Email">
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
            {CREDENTIALS.map(({ value, label }, i) => (
              <div
                key={value}
                className={`xl:pl-5 ${i > 0 ? 'xl:border-l xl:border-white/[0.08]' : 'xl:pl-0'}`}
              >
                {/* The value is the headline of each cell; wrapping it reads as a bug. */}
                <div className="whitespace-nowrap font-display text-sm font-bold leading-tight text-white">{value}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-white/55">{label}</div>
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
              Designed &amp; Developed by{' '}
              <a
                href={developer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/75 transition-colors duration-200 hover:text-primary-light"
              >
                {developer.name}
              </a>
            </p>

            <div className="order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:order-3">
              <Link to="/privacy-policy" className="transition-colors duration-200 hover:text-primary-light">
                Privacy Policy
              </Link>
              <span aria-hidden className="text-white/20">|</span>
              <Link to="/terms" className="transition-colors duration-200 hover:text-primary-light">
                Terms &amp; Conditions
              </Link>
              <span aria-hidden className="text-white/20">|</span>
              {/* Reopens the consent dialog, so the banner's "manage your preferences at any
                  time" is actually reachable once the banner has been dismissed. */}
              <button
                type="button"
                onClick={openCookiePreferences}
                className="transition-colors duration-200 hover:text-primary-light"
              >
                Cookie Preferences
              </button>

              <button
                type="button"
                onClick={backToTop}
                className="group ml-1 inline-flex items-center gap-2 rounded-card border border-white/[0.14] bg-white/[0.04] px-3.5 py-2 font-medium text-white/75 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-white motion-reduce:hover:translate-y-0"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
