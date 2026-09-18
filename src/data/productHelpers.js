/**
 * Product data layer — built on the scraped KEAA catalogue (src/data/products.json,
 * 355 products across 3 categories, each with real Cloudinary images, specs and, where
 * the source site had it, a description).
 *
 * This module owns every read of that JSON so the pages stay declarative:
 *   getProductsByCategory() / getProductsBySubcategory()
 *   getProductById() / getRelatedProducts()
 * plus filter facets (getFacets/applyFilters) and small derivations (Ø diameter,
 * finish, a rough product "type") pulled out of the specs/description text.
 *
 * Products are enriched ONCE at module load — each gets image/hasImage,
 * catSlug/subSlug and the derived facet fields — so components never re-parse.
 *
 * IMPORTANT: importing this module pulls in the whole 181 KB catalogue. The category
 * tree lives in ./categories.js precisely so the site chrome can render the nav without
 * paying for it — do not "simplify" the chrome back onto this module. The category
 * helpers below are re-exported only so existing product-page imports keep working.
 */
import productsRaw from './products.json';
import { cldImage, cldSrcSet } from './cloudinary.js';
import { slugify, catSlugOf } from './categories.js';
import { FINISH_RULES, TYPE_RULES, TYPE_OTHER } from './productTerms.js';

export {
  slugify,
  catSlugOf,
  categoryMeta,
  getAllCategories,
  getCategory,
  TOTAL_PRODUCTS,
} from './categories.js';

/**
 * Product text in the active language. Pages that already import this module reach the
 * overlay from here; components call it through useProductL10n() in the locale context.
 */
export { localizeProduct, translateTerm } from '../i18n/localizeProduct.js';

const specText = (p) =>
  `${p.description || ''} ${(p.specs || []).map((s) => `${s.label} ${s.value}`).join(' ')}`;

/** Pull an "Ø48.3 mm" tube diameter out of the description/specs, if present. */
function deriveDiameter(p) {
  const m = specText(p).match(/[Øø]\s?(\d{2,3}(?:\.\d)?)/);
  return m ? `Ø${m[1]} mm` : null;
}

/**
 * Normalise the finish (mostly "Hot Dip Galvanized") from the specs/description. The rules
 * and their labels live in productTerms.js, shared with the translation coverage check.
 */
function deriveFinish(p) {
  const h = specText(p).toLowerCase();
  const hit = FINISH_RULES.find(([needle]) => h.includes(needle));
  return hit ? hit[1] : null;
}

/** A coarse product "type" derived from the name — best effort, used only for filtering. */
export function classifyType(name = '') {
  const n = name.toLowerCase();
  for (const [re, label] of TYPE_RULES) if (re.test(n)) return label;
  return TYPE_OTHER;
}

const firstImage = (p) => (p.cloudinaryImages && p.cloudinaryImages[0]) || null;

/** Every product, enriched once with derived fields the UI consumes. */
export const products = productsRaw.map((p) => ({
  ...p,
  image: firstImage(p),
  hasImage: Boolean(firstImage(p)),
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

/**
 * Free-text product search over a list. Every whitespace-separated term must match (AND),
 * so "48 coupler" narrows to real catalogue items rather than fuzzy-guessing. Each term is
 * tested against the product's name, item code, subcategory and the derived
 * type/finish/diameter, plus the description + spec text — so the results are always actual
 * products from the catalogue. An empty query returns the list untouched.
 *
 * `localize` (the `lp` of useProductL10n) is optional: a visitor reading the site in German
 * types the German name, so the localized copy of each product joins the haystack and both
 * languages match. On the English site it returns the same object and costs nothing.
 */
export function searchProducts(list, query, localize) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return list;
  const terms = q.split(/\s+/);
  return list.filter((p) => {
    const local = localize ? localize(p) : p;
    const haystack = [
      p.name,
      local.name,
      p.itemCode,
      p.subcategory,
      p.finish,
      p.diameter,
      classifyType(p.name),
      specText(p),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

/** Sort helpers used by the catalog toolbar. */
export const SORTS = {
  'name-asc': { label: 'Product Name (A–Z)', fn: (a, b) => a.name.localeCompare(b.name) },
  'name-desc': { label: 'Product Name (Z–A)', fn: (a, b) => b.name.localeCompare(a.name) },
  'code-asc': { label: 'Item Code (A–Z)', fn: (a, b) => (a.itemCode || '').localeCompare(b.itemCode || '') },
};
