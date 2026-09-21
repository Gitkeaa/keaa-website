import products from './products.json';
import { buildProductPaths } from './productSlug';

/**
 * The browser side of the product URL index.
 *
 * Built once at module load from the same pure function the sitemap, the prerenderer and the
 * redirect generator use, so a URL is identical wherever it is produced. See data/productSlug.js
 * for why the logic lives in a separate module from this one.
 */
const index = buildProductPaths(products);

/** `/products/<category>/<subcategory>/<slug>` for a product id, or null if unknown. */
export function productPath(id) {
  return index.byId[id]?.path || null;
}

/** The record behind a product id: { id, slug, categorySlug, subSlug, path }. */
export function productPathRecord(id) {
  return index.byId[id] || null;
}

/**
 * Resolves a slug URL back to a product id.
 *
 * Takes the three URL segments rather than a joined path so the caller can pass useParams()
 * straight through without rebuilding a string.
 */
export function productIdFromSlug(categorySlug, subSlug, slug) {
  if (!categorySlug || !subSlug || !slug) return null;
  const id = index.bySlug[`${categorySlug}/${subSlug}/${slug}`];
  return id === undefined ? null : id;
}

/** Every product URL, for the sitemap and the prerenderer. */
export const productPathEntries = index.entries;
