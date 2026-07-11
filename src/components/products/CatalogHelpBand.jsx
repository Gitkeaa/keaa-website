import { Link } from 'react-router-dom';
import { Headphones, FileDown, PackageCheck } from 'lucide-react';

const CATALOGUE_URL =
  'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/web_support_keaa-international_net/IQDrlCW9_78jTbaxSmZFAXVFAUp5tsZGw32rbgfqVylfnaA?e=iznXeZ';

/**
 * The dark help band that closes the catalog and detail pages — three actions:
 * talk to an expert, download the full catalogue, or request a bulk quote.
 */
export default function CatalogHelpBand() {
  const items = [
    {
      icon: Headphones,
      title: 'Need Help Selecting Products?',
      desc: 'Our experts are here to help you.',
      label: 'Talk to Expert',
      to: '/contact',
    },
    {
      icon: FileDown,
      title: 'Download Full Catalogue',
      desc: 'Complete product range with specifications.',
      label: 'Download PDF',
      href: CATALOGUE_URL,
    },
    {
      icon: PackageCheck,
      title: 'Bulk Order / Custom Requirement?',
      desc: 'Get a customized solution for your project.',
      label: 'Request a Quote',
      to: '/rfq',
    },
  ];

  return (
    <section className="bg-surface-deep">
      <div className="container-page py-10">
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {items.map((it) => {
            const Icon = it.icon;
            const btn =
              'inline-flex flex-shrink-0 items-center justify-center rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/20';
            return (
              <div
                key={it.title}
                className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary-light">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-white">{it.title}</p>
                    <p className="text-xs text-white/60">{it.desc}</p>
                  </div>
                </div>
                {it.to ? (
                  <Link to={it.to} className={btn}>
                    {it.label}
                  </Link>
                ) : (
                  <a href={it.href} target="_blank" rel="noopener noreferrer" className={btn}>
                    {it.label}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
