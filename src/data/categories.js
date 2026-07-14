/**
 * The category tree, and only the category tree.
 *
 * This module exists to keep the 355-product catalogue out of the entry chunk. The site
 * chrome — Header, Footer, MobileDrawer — and the homepage's CoreSolutions all render the
 * category list, and they used to reach it through productHelpers, which statically
 * imports products.json. That single import chain (Layout -> Header -> productHelpers ->
 * products.json) dragged the whole catalogue into the entry bundle, so a visitor landing
 * on Contact downloaded 355 products to draw a three-item nav menu.
 *
 * categories.json is precomputed from products.json by scripts/gen-categories.mjs, which
 * runs on every build (prebuild), so the two cannot drift. It is ~3.7 KB against ~181 KB.
 *
 * Anything that needs actual PRODUCTS still imports productHelpers, and pays for
 * products.json in that page's own chunk — which is exactly where it belongs.
 */
import categoriesRaw from './categories.json';
import { img } from './images.js';

export const slugify = (str) =>
  String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Category URLs are derived from the display name, so renaming a category would normally
 * change its route and orphan its `categoryMeta` entry. This pins the slug instead: the
 * "Wood Connectors / Garden Hardware" line keeps the short, already-published
 * `/products/wood-connectors` URL.
 *
 * Idempotent — passing either the display name or the slug returns the slug.
 */
const CATEGORY_SLUG_OVERRIDES = {
  'wood-connectors-garden-hardware': 'wood-connectors',
};

export const catSlugOf = (nameOrSlug) => {
  const s = slugify(nameOrSlug);
  return CATEGORY_SLUG_OVERRIDES[s] || s;
};

/* ------------------------------------------------------------------ *
 *  Category presentation metadata (hero image, blurb, icon, badges).
 *  Keyed by category slug. Everything else (subcategories, counts) is
 *  derived from the data so it never drifts out of sync.
 * ------------------------------------------------------------------ */
export const categoryMeta = {
  'scaffolding-formworks': {
    icon: 'Layers',
    heroImage: img.scaffoldFrame,
    short:
      'A complete range of modular scaffolding, formwork systems and fittings — engineered for safety, strength and fast installation.',
    standard: 'Hot Dip Galvanized as per DIN EN 1461',
    badges: [
      { icon: 'ShieldCheck', title: 'High Strength', sub: 'Tested & Certified' },
      { icon: 'Wrench', title: 'Easy Assembly', sub: 'Quick & Secure' },
      { icon: 'Droplets', title: 'Corrosion Resistant', sub: 'Hot Dip Galvanized' },
      { icon: 'Globe', title: 'Global Standards', sub: 'EN 12810 | EN 12811' },
    ],
  },
  'livestock-housing-solutions': {
    icon: 'Warehouse',
    heroImage: img.cattleHerdBarn || img.cowsInBarn,
    short:
      'Robust cattle, sheep, pig and horse housing systems, field gates and feeders — built from heavy-gauge galvanized steel for years of service.',
    standard: 'Hot Dip Galvanized — heavy-gauge steel',
    badges: [
      { icon: 'ShieldCheck', title: 'Durable Build', sub: 'Heavy-Gauge Steel' },
      { icon: 'Heart', title: 'Animal Safe', sub: 'Smooth Welded Finish' },
      { icon: 'CloudRain', title: 'Weather Resistant', sub: 'Galvanized Coating' },
      { icon: 'Blocks', title: 'Modular', sub: 'Fast Field Install' },
    ],
  },
  'wood-connectors': {
    icon: 'Hammer',
    heroImage: img.woodenFrameSky,
    short:
      'Structural timber connectors, post supports and ground anchors for decks, pergolas, fencing and joinery — precision-formed and corrosion-protected.',
    standard: 'Hot Dip Galvanized / structural grade steel',
    badges: [
      { icon: 'Gauge', title: 'Load Rated', sub: 'Structural Grade' },
      { icon: 'Droplets', title: 'Corrosion Resistant', sub: 'Hot Dip Galvanized' },
      { icon: 'Ruler', title: 'Precision Fit', sub: 'CNC Formed' },
      { icon: 'Shuffle', title: 'Versatile', sub: 'Indoor & Outdoor' },
    ],
  },
};

/**
 * All categories with their subcategories and live counts, merged with the
 * presentation metadata above. Order follows first appearance in the data.
 */
export function getAllCategories() {
  return categoriesRaw.map((c) => ({ ...c, ...(categoryMeta[c.slug] || {}) }));
}

/** One category (by slug or display name), or undefined. */
export function getCategory(categorySlugOrName) {
  const s = catSlugOf(categorySlugOrName);
  return getAllCategories().find((c) => c.slug === s);
}

export const TOTAL_PRODUCTS = categoriesRaw.reduce((sum, c) => sum + c.count, 0);
