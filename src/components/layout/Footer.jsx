import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Linkedin, Facebook, Instagram, Youtube } from 'lucide-react';
import Logo from './Logo';
import { company } from '../../data/company';
import { footerLinks } from '../../data/navigation';
import { productCategories } from '../../data/products';

export default function Footer() {
  const year = new Date().getFullYear();
  const landlineNumbers = Array.isArray(company.landline) ? company.landline : [company.landline];

  return (
    <footer className="bg-navy-900 text-white/70">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-white/55">{company.description}</p>
          <div className="mt-5 flex gap-3">
            {[
              { icon: Linkedin, href: company.social.linkedin },
              { icon: Facebook, href: company.social.facebook },
              { icon: Instagram, href: company.social.instagram },
              { icon: Youtube, href: company.social.youtube }
            ].map((social, i) => (
              <a
                key={i}
                href={social.href}
                target={social.href !== '#' ? '_blank' : undefined}
                rel={social.href !== '#' ? 'noopener noreferrer' : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold-400 hover:text-gold-400"
                aria-label="Social link"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
            Quick Links
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerLinks.quick.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
            Products
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {productCategories.map((c) => (
              <li key={c.slug}>
                <Link to={`/products#${c.slug}`} className="hover:text-gold-400">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
            Resources
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {footerLinks.resources.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-white">
            Contact Us
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gold-400" />
              <span>
                {company.manufacturing.line1}
                <br />
                {company.manufacturing.line2}
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="h-4 w-4 flex-shrink-0 text-gold-400" />
              <div className="space-y-1">
                <span className="block">{company.phones.join(' / ')}</span>
                {landlineNumbers.map((line) => (
                  <span key={line} className="block">Tel: {line}</span>
                ))}
                <span className="block">Fax: {company.fax}</span>
              </div>
            </li>
            <li className="flex gap-2.5">
              <Mail className="h-4 w-4 flex-shrink-0 text-gold-400" />
              <div className="space-y-1">
                {company.emails.map((email) => (
                  <a key={email} href={`mailto:${email}`} className="block hover:text-gold-400">
                    {email}
                  </a>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/50 sm:flex-row">
          <p className="transition-colors hover:text-gold-400">
            © {year} {company.name} All Rights Reserved.
          </p>
          <p className="order-last transition-colors hover:text-gold-400 sm:order-none">
            Designed &amp; Developed by{' '}
            <span className="font-semibold">Kishlay Raj</span>
          </p>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="transition-colors hover:text-gold-400">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition-colors hover:text-gold-400">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
