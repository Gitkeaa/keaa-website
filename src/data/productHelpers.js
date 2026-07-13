/**
 * Product data layer — built on the scraped KEAA catalogue (src/data/products.json,
 * 355 products across 3 categories, each with real Cloudinary images, specs and, where
 * the source site had it, a description).
 *
 * This module owns every read of that JSON so the pages stay declarative:
 *   getAllCategories() / getProductsByCategory() / getProductsBySubcategory()
 *   getProductById() / getRelatedProducts()
 * plus filter facets (getFacets/applyFilters) and small derivations (Ø diameter,
 * finish, a rough product "type") pulled out of the specs/description text.
 *
 * Products are enriched ONCE at module load — each gets image/hasImage/hasDetails,
 * catSlug/subSlug and the derived facet fields — so components never re-parse.
 */
import productsRaw from './products.json';
import { img } from './images.js';
import { cldImage, cldSrcSet } from './cloudinary.js';

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

const specText = (p) =>
  `${p.description || ''} ${(p.specs || []).map((s) => `${s.label} ${s.value}`).join(' ')}`;

/** Pull an "Ø48.3 mm" tube diameter out of the description/specs, if present. */
function deriveDiameter(p) {
  const m = specText(p).match(/[Øø]\s?(\d{2,3}(?:\.\d)?)/);
  return m ? `Ø${m[1]} mm` : null;
}

/** Normalise the finish (mostly "Hot Dip Galvanized") from the specs/description. */
function deriveFinish(p) {
  const h = specText(p).toLowerCase();
  if (h.includes('hot dip') || h.includes('hot-dip')) return 'Hot Dip Galvanized';
  if (h.includes('electro')) return 'Electro Galvanized';
  if (h.includes('powder')) return 'Powder Coated';
  if (h.includes('stainless')) return 'Stainless Steel';
  if (h.includes('paint')) return 'Painted';
  if (h.includes('galvani')) return 'Galvanized';
  return null;
}

/** A coarse product "type" derived from the name — best effort, used only for filtering. */
export function classifyType(name = '') {
  const n = name.toLowerCase();
  const rules = [
    [/coupler|clamp/, 'Couplers & Clamps'],
    [/jack|nut|spindle/, 'Jacks & Nuts'],
    [/brace/, 'Braces'],
    [/ledger/, 'Ledgers'],
    [/standard|vertical|riser/, 'Standards & Verticals'],
    [/frame/, 'Frames'],
    [/prop|shore|tower/, 'Props & Towers'],
    [/plank|board|platform|deck|step|stair/, 'Platforms & Boards'],
    [/head|fork|tripod/, 'Heads & Tripods'],
    [/gate|hurdle|barrier|panel/, 'Gates & Panels'],
    [/feeder|trough|drinker|bowl/, 'Feeders & Drinkers'],
    [/post|support|anchor|base|plate/, 'Supports & Anchors'],
    [/cap|cover|connector|bracket|hook/, 'Connectors & Fittings'],
  ];
  for (const [re, label] of rules) if (re.test(n)) return label;
  return 'Other';
}

const firstImage = (p) => (p.cloudinaryImages && p.cloudinaryImages[0]) || null;
const hasDetails = (p) => Boolean((p.specs && p.specs.length) || (p.description || '').trim());

/** Every product, enriched once with derived fields the UI consumes. */
export const products = productsRaw.map((p) => ({
  ...p,
  image: firstImage(p),
  hasImage: Boolean(firstImage(p)),
  hasDetails: hasDetails(p),
  diameter: deriveDiameter(p),
  finish: deriveFinish(p),
  catSlug: catSlugOf(p.category),
  subSlug: slugify(p.subcategory),
}));

/* ------------------------------------------------------------------ *
 *  Cloudinary delivery. products.json stores the full secure_url; we
 *  pull the public_id back out so images ride the site's existing
 *  cldImage/cldSrcSet pipeline (f_auto,q_auto + responsive resize).
 * ------------------------------------------------------------------ */
export function publicIdFromCloudinaryUrl(url) {
  if (!url) return null;
  const m = String(url).match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i);
  return m ? m[1] : null;
}

/** An optimised delivery URL for a product's first image, or null if it has none. */
export function productImage(product, opts = {}) {
  const pid = publicIdFromCloudinaryUrl(product && product.image);
  return pid ? cldImage(pid, opts) : null;
}

/** A responsive srcSet for a product's first image, or undefined if it has none. */
export function productSrcSet(product, widths) {
  const pid = publicIdFromCloudinaryUrl(product && product.image);
  return pid ? cldSrcSet(pid, widths) : undefined;
}

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
  const map = new Map();
  for (const p of products) {
    if (!map.has(p.catSlug)) {
      map.set(p.catSlug, { name: p.category, slug: p.catSlug, count: 0, subs: new Map() });
    }
    const c = map.get(p.catSlug);
    c.count++;
    if (!c.subs.has(p.subSlug)) {
      c.subs.set(p.subSlug, { name: p.subcategory, slug: p.subSlug, count: 0 });
    }
    c.subs.get(p.subSlug).count++;
  }
  return [...map.values()].map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c.count,
    subcategories: [...c.subs.values()],
    ...(categoryMeta[c.slug] || {}),
  }));
}

/** One category (by slug or display name), or undefined. */
export function getCategory(categorySlugOrName) {
  const s = catSlugOf(categorySlugOrName);
  return getAllCategories().find((c) => c.slug === s);
}

/** Products in a category (accepts slug or display name). */
export function getProductsByCategory(category) {
  const s = catSlugOf(category);
  return products.filter((p) => p.catSlug === s);
}

/** Products in a subcategory (both args accept slug or display name). */
export function getProductsBySubcategory(category, subcategory) {
  const cs = catSlugOf(category);
  const ss = slugify(subcategory);
  return products.filter((p) => p.catSlug === cs && p.subSlug === ss);
}

/** One product by its numeric id (ids are unique across the catalogue). */
export function getProductById(id) {
  return products.find((p) => String(p.id) === String(id)) || null;
}

/** Up to `limit` other products from the same subcategory. */
export function getRelatedProducts(product, limit = 6) {
  if (!product) return [];
  return products
    .filter((p) => p.subSlug === product.subSlug && p.id !== product.id)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ *
 *  Filtering. Facet groups are computed from the CURRENT product list
 *  and a group is only surfaced when it has ≥2 distinct real values —
 *  so Livestock never shows an empty "Tube Size" filter, etc.
 * ------------------------------------------------------------------ */
export const FILTER_GROUPS = [
  { key: 'type', label: 'Product Type', get: (p) => classifyType(p.name) },
  { key: 'finish', label: 'Finish', get: (p) => p.finish },
  { key: 'diameter', label: 'Tube Size', get: (p) => p.diameter },
];

/** Available filter groups + option counts for a given product list. */
export function getFacets(list) {
  const groups = [];
  for (const g of FILTER_GROUPS) {
    const counts = new Map();
    for (const p of list) {
      const v = g.get(p);
      if (!v) continue;
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    if (counts.size >= 2) {
      groups.push({
        key: g.key,
        label: g.label,
        options: [...counts.entries()]
          .map(([value, count]) => ({ value, count }))
          // keep the catch-all "Other" bucket pinned to the bottom, otherwise by count
          .sort((a, b) => {
            const ao = a.value === 'Other', bo = b.value === 'Other';
            if (ao !== bo) return ao ? 1 : -1;
            return b.count - a.count || String(a.value).localeCompare(String(b.value));
          }),
      });
    }
  }
  return groups;
}

/**
 * Apply an active-filter map `{ groupKey: Set<value> }` to a product list.
 * An empty/absent set for a group means "no constraint".
 */
export function applyFilters(list, active) {
  const groupsByKey = Object.fromEntries(FILTER_GROUPS.map((g) => [g.key, g]));
  return list.filter((p) =>
    Object.entries(active || {}).every(([key, set]) => {
      if (!set || set.size === 0) return true;
      const g = groupsByKey[key];
      return g ? set.has(g.get(p)) : true;
    })
  );
}

/** Sort helpers used by the catalog toolbar. */
export const SORTS = {
  'name-asc': { label: 'Product Name (A–Z)', fn: (a, b) => a.name.localeCompare(b.name) },
  'name-desc': { label: 'Product Name (Z–A)', fn: (a, b) => b.name.localeCompare(a.name) },
  'code-asc': { label: 'Item Code (A–Z)', fn: (a, b) => (a.itemCode || '').localeCompare(b.itemCode || '') },
};

export const TOTAL_PRODUCTS = products.length;
