import { Link } from 'react-router-dom';
import { useReducedMotion } from 'framer-motion';
/* Social marks are the ONE sanctioned exception to the site's icon-free rule: a platform's
   logo is its name, and spelling them out reads worse than the marks. Everything else in
   this footer states itself in type — uppercase labels and hover underlines. */
import { Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import { WhatsApp, XLogo } from '../ui/BrandGlyphs';
import Logo from './Logo';
import { openCookiePreferences } from '../CookieConsent';
import { company, developer } from '../../data/company';
import { footerLinks } from '../../data/navigation';
import { getAllCategories } from '../../data/categories';

/**
 * Footer — deep navy card on a light page, over the supplied blueprint artwork.
 *
 * The ground is the raised navy `#0E2742` (surface-deep-raised), one step up from the
 * near-black `#071426` this used to sit on. That earlier ground read as crushed-black once
 * the equally-dark artwork and the scrim stacked on top; lifting the ground AND tying the
 * scrim to the same raised navy softens the whole panel to a deep blue while keeping every
 * contrast rule below intact. The visible colour is scrim-over-artwork, not the base — so
 * the scrim colour, not the base class, is what actually does the lifting.
 *
 * The artwork is already very dark: measured, its median luminance is 0.006 and its
 * brightest pixel (a wireframe line, right-hand side) is 0.0595. That single fact sets
 * two rules:
 *
 *   1. A ~0.6–0.7 navy scrim sits over it, holding the artwork back to a texture. Push it
 *      much further and the dotted world map disappears entirely.
 *   2. No text goes below 55% white. On the raised ground, white/55 measures ~5.6:1 and
 *      clears AA with room; white/45 — the old copyright colour — failed at 3.34:1 against
 *      the brightest pixel, which is why 55% is the floor. The scrim only widens the margin.
 *
 * Brand colours on this ground: #8CCDF3 links (10.7:1), #3A86C6 icons and labels
 * (4.8:1). Gold is gone entirely; it survives only as #E7B321 on navy for certification
 * badges, and there are none here.
 */

/**
 * The social row. Order runs from the most-used channel down. Any entry whose href is `null`
 * in company.js drops out here, so the row only ever shows icons that go somewhere — see the
 * note there for which are live and which are placeholders awaiting a real URL.
 */
const SOCIALS = [
  { icon: Linkedin, href: company.social.linkedin, label: 'LinkedIn' },
  { icon: Instagram, href: company.social.instagram, label: 'Instagram' },
  { icon: Facebook, href: company.social.facebook, label: 'Facebook' },
  { icon: XLogo, href: company.social.x, label: 'X' },
  { icon: Youtube, href: company.social.youtube, label: 'YouTube' },
  { icon: WhatsApp, href: company.social.whatsapp, label: 'WhatsApp' },
].filter((s) => Boolean(s.href));


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
      <div className="relative isolate overflow-hidden bg-surface-deep-raised text-white/70">
        {/* The supplied artwork, and the scrim that keeps text over it legible. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/footer.jpg')" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background: 'linear-gradient(180deg, rgb(var(--color-surface-deep-raised) / 0.60) 0%, rgb(var(--color-surface-deep-raised) / 0.72) 100%)' }}
        />
        {/* A single cool light source so the navy is not flat. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-32 z-0 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(var(--color-primary) / 0.30), transparent 68%)' }}
        />

        {/* Phone gets two columns (was a single tall stack): the logo block spans both, the
            four link/contact blocks fall into a clean 2x2. `sm` and up are unchanged — the same
            2-up then 5-up desktop grid as before. */}
        <div className="container-page relative z-10 grid grid-cols-2 gap-x-8 gap-y-12 py-14 lg:grid-cols-[1.25fr_1fr_1.15fr_1fr_1.35fr] lg:py-16">
          <div className="col-span-2 lg:col-span-1">
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

          {/* Phone: full width with its links in two columns, so it never sits alone on the
              left with an empty half beside it. `sm` up is the original single column. */}
          <div className="col-span-2 sm:col-span-1">
            <ColumnHeading>Resources</ColumnHeading>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:block sm:space-y-3">
              {footerLinks.resources.map((l) => (
                <NavLinkRow key={l.to} to={l.to}>
                  {l.label}
                </NavLinkRow>
              ))}
            </ul>
          </div>

          {/* Phone: the contact block spans the full width and its rows sit in a 2-col grid,
              so Address|Mobile and Telephone|Email run in parallel instead of one tall stack.
              From `sm` up it is the original vertical list — desktop is untouched. */}
          <div className="col-span-2 sm:col-span-1">
            <ColumnHeading>Contact Us</ColumnHeading>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:block sm:space-y-4">
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

        {/* The credentials strip (42+ Countries, 5 facilities, Quality Assured…) was removed
            from here on request. The same figures already appear as the hero/stat blocks on
            About and Manufacturing, so the footer stops restating them. */}

        {/* Bottom bar. White strip under the dark footer body, so its text flips to dark.
            Every control here carries its own fill (see PILL / the Back-to-Top button) so it
            reads as a button on the white ground — a borderless link would otherwise vanish. */}
        <div className="relative z-10 border-t border-border bg-white">
          {/* The AI chat widget is fixed to the viewport's bottom-right and lands exactly
              on top of "Back to Top" once the footer is in view. The extra right padding
              parks the button clear of it. */}
          <div className="container-page flex flex-col items-center gap-4 py-5 text-xs text-text/70 lg:flex-row lg:justify-between lg:pr-44">
            <p className="order-1 text-center lg:text-left">
              &copy; {year} {company.name} All Rights Reserved.
            </p>

            <p className="order-3 text-center lg:order-2">
              Designed &amp; Developed by{' '}
              <a
                href={developer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-text transition-colors duration-200 hover:text-primary-dark"
              >
                {developer.name}
              </a>
            </p>

            {/* Shared chip background so the legal controls are visible buttons on white.
                The separators are gone — the pills already read as discrete controls. */}
            <div className="order-2 flex flex-wrap items-center justify-center gap-2 lg:order-3">
              <Link
                to="/privacy-policy"
                className="rounded-full bg-navy-50 px-3.5 py-1.5 font-medium text-text transition-colors duration-200 hover:bg-navy-100 hover:text-primary-dark"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="rounded-full bg-navy-50 px-3.5 py-1.5 font-medium text-text transition-colors duration-200 hover:bg-navy-100 hover:text-primary-dark"
              >
                Terms &amp; Conditions
              </Link>
              {/* The Cookie POLICY page (what we store, and why). Distinct from Cookie
                  Preferences below, which opens the settings dialog to change your choice. */}
              <Link
                to="/cookie-policy"
                className="rounded-full bg-navy-50 px-3.5 py-1.5 font-medium text-text transition-colors duration-200 hover:bg-navy-100 hover:text-primary-dark"
              >
                Cookie Policy
              </Link>
              {/* Reopens the consent dialog, so the banner's "manage your preferences at any
                  time" is actually reachable once the banner has been dismissed. */}
              <button
                type="button"
                onClick={openCookiePreferences}
                className="rounded-full bg-navy-50 px-3.5 py-1.5 font-medium text-text transition-colors duration-200 hover:bg-navy-100 hover:text-primary-dark"
              >
                Cookie Preferences
              </button>

              <button
                type="button"
                onClick={backToTop}
                className="group ml-1 inline-flex items-center gap-2 rounded-full bg-navy-700 px-4 py-1.5 font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-primary motion-reduce:hover:translate-y-0"
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
