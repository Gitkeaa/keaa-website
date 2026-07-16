import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Layers,
  Warehouse,
  Hammer,
  Settings2,
  PackageCheck,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import CtaBand from '../components/CtaBand';
import FeatureStrip from '../components/FeatureStrip';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import Reveal, { StaggerGroup, StaggerItem } from '../components/ui/Reveal';
import ProductCard from '../components/products/ProductCard';
import { getAllCategories, getProductsByCategory, TOTAL_PRODUCTS } from '../data/productHelpers';
import { img } from '../data/images';
import useSEO from '../hooks/useSEO';
import useSplashDone from '../hooks/useSplash';

const CATEGORY_ICONS = { Layers, Warehouse, Hammer };

const perks = [
  { icon: Settings2, title: 'Custom Solutions', desc: 'We also offer custom manufacturing as per your project requirements.' },
  { icon: PackageCheck, title: 'Bulk Orders', desc: 'Competitive pricing and on-time delivery for all bulk requirements.' },
  { icon: BadgeCheck, title: 'Quality Assurance', desc: 'All products are tested and certified to meet international standards.' },
];

// A spread of real products (with images) across the three categories.
const featured = getAllCategories()
  .flatMap((c) => getProductsByCategory(c.slug).filter((p) => p.hasImage).slice(0, 4))
  .slice(0, 10);

export default function Products() {
  const categories = getAllCategories();
  const splashDone = useSplashDone();

  useSEO({
    title: 'Products',
    description:
      'Explore KEAA’s full product catalogue: scaffolding & formwork systems, livestock housing solutions and wood connectors — with specifications and images.',
  });

  return (
    <>
      <PageHero
        eyebrow="Our Products"
        title="Engineered for Strength."
        accent="Built for Performance."
        desc="Browse our full manufacturing range — modular scaffolding & formwork systems, livestock housing solutions and structural wood connectors, all built to global standards."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Products' }]}
        image={img.scaffoldFrame}
        stats={[
          { value: `${TOTAL_PRODUCTS}+`, label: 'Products in Catalogue' },
          { value: `${categories.length}`, label: 'Product Categories' },
          { value: 'DIN EN 1461', label: 'Hot Dip Galvanizing' },
        ]}
      />

      {/* BROWSE BY CATEGORY */}
      <section className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow="Our Product Range" title="Browse by Category" />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {categories.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.icon] || Layers;
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={splashDone ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={`/products/${cat.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black bg-white shadow-card transition-shadow hover:shadow-cardHover"
                  >
                    <div className="relative h-44 overflow-hidden">
                      {cat.heroImage && (
                        <img
                          src={cat.heroImage}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ filter: 'saturate(0.6) brightness(0.7)' }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-800/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-5">
                        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="font-display text-lg font-bold leading-tight text-white">{cat.name}</h3>
                          <p className="text-xs text-white/75">{cat.count} products · {cat.subcategories.length} categories</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="flex-1 text-sm leading-relaxed text-ink/60">{cat.short}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {cat.subcategories.slice(0, 4).map((s) => (
                          <span key={s.slug} className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] text-navy-700">
                            {s.name}
                          </span>
                        ))}
                        {cat.subcategories.length > 4 && (
                          <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] text-ink/50">
                            +{cat.subcategories.length - 4} more
                          </span>
                        )}
                      </div>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
                        View products
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="section-pad">
          <div className="container-page">
            <Reveal>
              <SectionHeading eyebrow="Featured Products" title="From Our Catalogue" />
            </Reveal>
            <StaggerGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {featured.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
            <div className="mt-10 text-center">
              <Button to={`/products/${categories[0]?.slug || ''}`} variant="outlineNavy" icon={ArrowRight}>
                Explore Full Catalogue
              </Button>
            </div>
          </div>
        </section>
      )}

      <FeatureStrip items={perks} photo={false} className="pb-0" />

      <CtaBand
        title="Need Help Choosing"
        accent="the Right Product?"
        desc="Our experts are here to help you find the best solution for your project."
        cta={{ label: 'Request a Quote', to: '/rfq', icon: ArrowRight }}
      />
    </>
  );
}
