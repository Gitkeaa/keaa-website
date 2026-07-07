import { useState } from 'react';
import {
  Search,
  Layers,
  Wrench,
  HardHat,
  Warehouse,
  TreePine,
  Download,
  FileText,
  Settings2,
  PackageCheck,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeading from '../components/ui/SectionHeading';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import { productCategories, bestSellers, categoryImages, bestSellerImages } from '../data/products';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';

const categoryIcons = {
  'scaffolding-systems': Layers,
  'formwork-accessories': Wrench,
  'safety-products': HardHat,
  'livestock-housing-solutions': Warehouse,
  'garden-hardware': TreePine,
};

const perks = [
  { icon: Settings2, title: 'Custom Solutions', desc: 'We also offer custom manufacturing as per your project requirements.' },
  { icon: PackageCheck, title: 'Bulk Orders', desc: 'Competitive pricing and on-time delivery for all bulk requirements.' },
  { icon: BadgeCheck, title: 'Quality Assurance', desc: 'All products are tested and certified to meet international standards.' },
];

export default function Products() {
  useSEO({
    title: 'Products',
    description:
      'Explore KEAA\'s full product range: scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware.',
  });

  const [query, setQuery] = useState('');

  const filtered = productCategories.filter((c) =>
    `${c.name} ${c.short} ${c.bullets.join(' ')}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <PageHero
        eyebrow="Our Products"
        title="Engineered for Strength."
        accent="Built for Performance."
        desc="At KEAA International, we manufacture a wide range of high-quality scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware designed to meet global standards."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
        image={img.scaffoldFrame}
        stats={[
          { value: 'DIN EN 1461', label: 'Hot Dip Galvanizing Standard' },
          { value: '5', label: 'Product Categories' },
          { value: '100+', label: 'Product Range' },
        ]}
      />

      {/* SEARCH */}
      <section className="border-b border-navy-100 bg-white py-6">
        <div className="container-page flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search product categories…"
              className="w-full rounded-md border border-navy-100 bg-navy-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-gold-400"
            />
          </div>
          <Button to="/rfq" size="sm" icon={FileText}>
            Request a Quote
          </Button>
        </div>
      </section>

      {/* CATEGORY OVERVIEW CARDS */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Our Product Range" title="Wide Range of Quality Products" />
          </Reveal>
          <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {productCategories.map((cat) => {
              const Icon = categoryIcons[cat.slug];
              return (
                <StaggerItem key={cat.slug}>
                  <a href={`#${cat.slug}`} className="block h-full">
                    <Card className="flex h-full flex-col p-5">
                      <ImagePlaceholder src={categoryImages[cat.slug]} label={cat.name} icon={Icon} ratio="aspect-square" />
                      <span className="mt-4 flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-3 font-display text-sm font-semibold text-navy-800">{cat.name}</h3>
                      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-ink/60">{cat.short}</p>
                      <ul className="mt-3 space-y-1 text-xs text-ink/55">
                        {cat.bullets.slice(0, 3).map((b) => (
                          <li key={b}>• {b}</li>
                        ))}
                      </ul>
                    </Card>
                  </a>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* DETAILED CATEGORY SECTIONS */}
      {filtered.map((cat, idx) => {
        const Icon = categoryIcons[cat.slug];
        return (
          <section
            id={cat.slug}
            key={cat.slug}
            className={`section-pad scroll-mt-32 ${idx % 2 ? 'bg-navy-50' : ''}`}
          >
            <div className="container-page">
              <Reveal className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-navy-700 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-navy-800">{cat.name}</h2>
                    <p className="text-sm text-ink/60">{cat.short}</p>
                  </div>
                </div>
                <span className="rounded-full border border-navy-100 bg-white px-4 py-1.5 font-mono text-xs text-navy-700">
                  {cat.standard}
                </span>
              </Reveal>

              <div className="mt-10 space-y-8">
                {cat.families.map((fam, fi) => (
                  <Reveal key={fam.title} delay={fi * 0.06} className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card transition-shadow hover:shadow-cardHover">
                    <h3 className="font-display text-base font-semibold text-navy-800">{fam.title}</h3>
                    <p className="mt-1.5 font-mono text-xs text-ink/50">{fam.spec}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {fam.items.map((it) => (
                        <div
                          key={it.code + it.label}
                          className="flex items-start justify-between gap-3 rounded-lg bg-navy-50/70 px-4 py-3 transition-colors hover:bg-navy-50"
                        >
                          <div>
                            <p className="text-sm font-medium text-navy-800">{it.label}</p>
                            {it.size && <p className="mt-0.5 text-xs text-ink/55">{it.size}</p>}
                          </div>
                          <span className="flex-shrink-0 rounded-md bg-navy-700 px-2 py-1 font-mono text-[11px] text-gold-300">
                            {it.code}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                {cat.brochureUrl ? (
                  <Button
                    href={cat.brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlineNavy"
                    size="sm"
                    icon={Download}
                  >
                    Download Brochure
                  </Button>
                ) : (
                  <Button to="/downloads" variant="outlineNavy" size="sm" icon={Download}>
                    Download Brochure
                  </Button>
                )}
                <Button to="/rfq" size="sm" icon={FileText}>
                  Request a Quote
                </Button>
              </div>
            </div>
          </section>
        );
      })}

      {/* BESTSELLERS */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Featured Products" title="Our Bestsellers" />
          </Reveal>
          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((b, i) => (
              <StaggerItem key={b.name}>
                <Card className="overflow-hidden">
                  <ImagePlaceholder src={bestSellerImages[i]} label={b.name} ratio="aspect-[4/3]" />
                  <div className="p-4">
                    <h4 className="font-display text-sm font-semibold text-navy-800">{b.name}</h4>
                    <p className="text-xs text-ink/50">{b.category}</p>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <div className="mt-8 text-center">
            <Button to="/downloads" variant="outlineNavy" icon={ArrowRight}>
              View Full Catalogue
            </Button>
          </div>
        </div>
      </section>

      {/* PERKS STRIP */}
      <section className="bg-navy-900">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="flex items-start gap-4">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-gold-400">
                <p.icon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-display text-sm font-semibold text-white">{p.title}</h4>
                <p className="mt-1 text-sm text-white/55">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-navy-50">
        <div className="container-page flex flex-col items-center justify-between gap-6 py-12 sm:flex-row">
          <div>
            <h3 className="font-display text-2xl font-bold text-navy-800">Need Help Choosing the Right Product?</h3>
            <p className="mt-1 text-ink/60">Our experts are here to help you find the best solution for your project.</p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <Button to="/rfq" icon={ArrowRight}>
              Request a Quote
            </Button>
            <Button to="/contact" variant="outlineNavy">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
