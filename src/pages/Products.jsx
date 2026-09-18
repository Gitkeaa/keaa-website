import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GalleryHero from '../components/gallery/GalleryHero';
import CtaBand from '../components/CtaBand';
import FeatureStrip from '../components/FeatureStrip';
import SectionHeading from '../components/ui/SectionHeading';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import CardRail from '../components/ui/CardRail';
import { PANEL_CARD } from '../components/ui/panelCard';
import ProductCard from '../components/products/ProductCard';
import { getAllCategories, getProductsByCategory, TOTAL_PRODUCTS } from '../data/productHelpers';
import { heroSlides } from '../data/heroSlides';
import useSEO from '../hooks/useSEO';
import { useLT, useProductL10n } from '../i18n/LocaleContext';
import { EASE } from '../lib/motion';

/**
 * Products landing page: the public catalogue overview at /products. Renders the gallery
 * hero, a browse-by-category grid, one featured rail per category, a perks strip and a CTA.
 *
 * Lazy-loaded in App.jsx as the `/products` route; product data comes from data/productHelpers.
 */
const perks = [
  { title: 'Custom Solutions', desc: 'We also offer custom manufacturing as per your project requirements.' },
  { title: 'Bulk Orders', desc: 'Competitive pricing and on-time delivery for all bulk requirements.' },
  { title: 'Quality Assurance', desc: 'All products are tested and certified to meet international standards.' },
];

/*
  Featured products, ONE RAIL PER CATEGORY. Each category keeps its own swipeable row with its
  own prev / next control, stacked down the page, rather than being mixed into a single grid —
  so every category is featured in its own right. Up to twelve image-carrying products each is
  plenty for a rail; a category with no images drops out entirely.
*/
const featuredByCategory = getAllCategories()
  .map((c) => ({
    category: c,
    items: getProductsByCategory(c.slug)
      .filter((p) => p.hasImage)
      .slice(0, 12),
  }))
  .filter((group) => group.items.length > 0);

export default function Products() {
  const lt = useLT('catalog');
  const { lp } = useProductL10n();
  const categories = getAllCategories();

  useSEO({
    title: lt('seo.title', 'Products'),
    description: lt(
      'seo.desc',
      'Explore KEAA’s full product catalogue: scaffolding & formwork systems, livestock housing solutions and wood connectors, with specifications and images.'
    ),
  });

  return (
    <>
      {/* Framed hero carousel (see components/gallery/GalleryHero) — real KEAA product
          photography with the copy changing per slide. */}
      <GalleryHero
        eyebrow={lt('hero.eyebrow', 'Our Products')}
        crumbs={[{ label: lt('crumbs.home', 'Home'), to: '/' }, { label: lt('crumbs.products', 'Products') }]}
        slides={heroSlides.products.map((s, i) => ({
          ...s,
          title: lt(`hero.slides.${i}.title`, s.title),
          accent: lt(`hero.slides.${i}.accent`, s.accent),
          desc: lt(`hero.slides.${i}.desc`, s.desc),
        }))}
        stats={[
          { value: `${TOTAL_PRODUCTS}+`, label: lt('stats.catalogue', 'Products in Catalogue') },
          { value: `${categories.length}`, label: lt('stats.categories', 'Product Categories') },
          { value: 'DIN EN 1461', label: lt('stats.galvanizing', 'Hot Dip Galvanizing') },
        ]}
        scrollTo="browse"
      />

      {/* BROWSE BY CATEGORY */}
      <section id="browse" className="section-pad">
        <div className="container-page">
          <Reveal>
            <SectionHeading eyebrow={lt('browse.eyebrow', 'Our Product Range')} title={lt('browse.title', 'Browse by Category')} />
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              >
                <Link
                  to={`/products/${cat.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-navy-100 bg-white shadow-card transition-shadow hover:shadow-cardHover"
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
                      <div>
                        <h3 className="font-display text-lg font-bold leading-tight text-white">{lt(`cat.${cat.slug}.name`, cat.name)}</h3>
                        <p className="text-xs text-white/75">{lt('browse.cardMeta', '{count} products · {subs} categories', { count: cat.count, subs: cat.subcategories.length })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex-1 text-body-compact leading-relaxed text-ink">{lt(`cat.${cat.slug}.short`, cat.short)}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {cat.subcategories.slice(0, 4).map((s) => (
                        <span key={s.slug} className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] text-navy-700">
                          {lt(`sub.${s.slug}.name`, s.name)}
                        </span>
                      ))}
                      {cat.subcategories.length > 4 && (
                        <span className="rounded-full bg-navy-50 px-2.5 py-1 text-[11px] text-muted">
                          {lt('browse.moreSubs', '+{n} more', { n: cat.subcategories.length - 4 })}
                        </span>
                      )}
                    </div>
                    <span className="mt-5 inline-flex self-start border-b border-transparent pb-0.5 text-sm font-semibold text-primary-dark transition-colors group-hover:border-primary group-hover:text-primary-darker">
                      {lt('browse.viewProducts', 'View products')}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS — one rail per category, stacked. Each category has its name, then a
          swipeable row of its products with its own prev / next control, then the next category
          below it, and so on. */}
      {featuredByCategory.length > 0 && (
        <section className="section-pad">
          <div className="container-page">
            <Reveal>
              <SectionHeading eyebrow={lt('featured.eyebrow', 'Featured Products')} title={lt('featured.title', 'From Our Catalogue')} />
            </Reveal>

            {/* Each of the three category groups sits in its own PANEL_CARD, matching the
                carded bands on Home and About. `space-y` gives the cards their gap. */}
            <div className="mt-8 space-y-8">
              {featuredByCategory.map(({ category, items }) => (
                <Reveal key={category.slug}>
                  <div className={PANEL_CARD}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-xl font-semibold text-text">{lt(`cat.${category.slug}.name`, category.name)}</h3>
                      <Link
                        to={`/products/${category.slug}`}
                        className="flex-shrink-0 border-b border-transparent pb-0.5 text-sm font-semibold text-primary-dark transition-colors hover:border-primary hover:text-primary-darker"
                      >
                        {lt('featured.viewAll', 'View all')}
                      </Link>
                    </div>
                    <CardRail
                      label={lt('featured.railLabel', '{name} products', { name: lt(`cat.${category.slug}.name`, category.name) })}
                      labels={items.map((p) => lt('featured.showProduct', 'Show {name}', { name: lp(p).name }))}
                    >
                      {items.map((p) => (
                        <div
                          key={p.id}
                          className="w-[46%] flex-none snap-start sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-6rem)/5)]"
                        >
                          <ProductCard product={p} />
                        </div>
                      ))}
                    </CardRail>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button to={`/products/${categories[0]?.slug || ''}`} variant="outlineNavy">
                {lt('featured.exploreCta', 'Explore Full Catalogue')}
              </Button>
            </div>
          </div>
        </section>
      )}

      <FeatureStrip
        items={perks.map((p, i) => ({
          ...p,
          title: lt(`perks.${i}.title`, p.title),
          desc: lt(`perks.${i}.desc`, p.desc),
        }))}
        photo={false}
        className="pb-0"
      />

      <CtaBand
        title={lt('cta.title', 'Need Help Choosing')}
        accent={lt('cta.accent', 'the Right Product?')}
        desc={lt('cta.desc', 'Our experts are here to help you find the best solution for your project.')}
        cta={{ label: lt('cta.label', 'Request a Quote'), to: '/contact?tab=rfq' }}
      />
    </>
  );
}
