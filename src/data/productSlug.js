/**
 * Readable product URLs, derived rather than stored.
 *
 * WHY DERIVED
 * -----------
 * products.json is the catalogue and is not ours to rewrite, so nothing here mutates it. The
 * slug for a product is computed from the data already on it, which means the catalogue can be
 * re-exported from the admin at any time and the URLs stay the same.
 *
 * THE DUPLICATE PROBLEM
 * ---------------------
 * 355 products carry a `slug`, but only 326 are unique: 22 slugs are shared by 49 products.
 * "Wall Tie" exists in both the Ringlock and the jacks ranges, "Diagonal Brace" in three. A URL
 * has to identify one product, so a duplicated base slug is disambiguated by appending the item
 * code, which is what the catalogue already uses to tell them apart. If two products somehow
 * share both, the id is appended, which is unique by definition. Products whose slug is already
 * unique are untouched, so the common case stays clean.
 *
 * NO PURE-FUNCTION MODULE IMPORTS JSON HERE
 * -----------------------------------------
 * This file is imported by the browser bundle, by the sitemap and prerender generators running
 * under plain Node, and by the redirect generator. Node and Vite disagree about JSON imports,
 * so this module takes the products array as an argument and the callers each load it the way
 * their environment prefers. See data/productPaths.js for the browser side.
 */

/** Same rule as data/categories.js, kept identical so category URLs match the live ones. */
export const slugifyPart = (str) =>
  String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Mirrors CATEGORY_SLUG_OVERRIDES in data/categories.js.
 *
 * Duplicated deliberately rather than imported, because categories.js imports categories.json
 * and the Node generators cannot follow that. If a new override is added there it must be added
 * here too, which is what `npm run check:product-paths` fails the build over.
 */
const CATEGORY_SLUG_OVERRIDES = {
  'wood-connectors-diy-hardware-products': 'wood-connectors',
  'wood-connectors-garden-hardware': 'wood-connectors',
};

export const categorySlugOf = (nameOrSlug) => {
  const s = slugifyPart(nameOrSlug);
  return CATEGORY_SLUG_OVERRIDES[s] || s;
};

/**
 * Builds the id to URL index for a whole catalogue in one pass.
 *
 * Returns:
 *   byId    { [id]: { id, path, slug, categorySlug, subSlug } }
 *   bySlug  { [`${categorySlug}/${subSlug}/${slug}`]: id }  for resolving a URL back
 *   entries the same records as an array, for sitemaps and prerendering
 *   collisions how many products needed the item code to be unique, for the build check
 */
export function buildProductPaths(products) {
  const list = Array.isArray(products) ? products : [];

  // Pass one: how many products want each base slug.
  const baseCount = new Map();
  for (const p of list) {
    const base = slugifyPart(p.slug || p.name || String(p.id));
    baseCount.set(base, (baseCount.get(base) || 0) + 1);
  }

  const byId = {};
  const bySlug = {};
  const entries = [];
  const taken = new Set();
  let collisions = 0;

  for (const p of list) {
    const categorySlug = categorySlugOf(p.category);
    const subSlug = slugifyPart(p.subcategory);
    const base = slugifyPart(p.slug || p.name || String(p.id));

    let slug = base;
    if (baseCount.get(base) > 1) {
      // The item code is how the catalogue itself distinguishes them.
      const code = slugifyPart(p.itemCode || '');
      slug = code ? `${base}-${code}` : `${base}-${p.id}`;
      collisions += 1;
    }

    // Belt and braces: two products sharing a name AND an item code would still collide.
    let key = `${categorySlug}/${subSlug}/${slug}`;
    if (taken.has(key)) {
      slug = `${slug}-${p.id}`;
      key = `${categorySlug}/${subSlug}/${slug}`;
    }
    taken.add(key);

    const record = {
      id: p.id,
      slug,
      categorySlug,
      subSlug,
      path: `/products/${categorySlug}/${subSlug}/${slug}`,
    };
    byId[p.id] = record;
    bySlug[key] = p.id;
    entries.push(record);
  }

  return { byId, bySlug, entries, collisions };
}
