/**
 * Product-data translation overlay.
 *
 * products.json is English only and stays the source of truth for every product page. A
 * language's product dictionary (src/i18n/products/<code>.json) is a set of string-keyed maps,
 * English text to translated text, for the kinds of product text a page renders:
 *
 *   names         product names
 *   descriptions  product descriptions
 *   specLabels    the label column of the specification table
 *   specValues    the value column, only for values that contain words (numbers pass through)
 *   terms         derived labels shared across products: finish names, product-type filter
 *                 labels and other short catalogue vocabulary (see src/data/productTerms.js)
 *
 * Keyed by the English string rather than by product id on purpose: the same name or label
 * appears on many products (29 products share a name, "Material" labels 56 rows), so one
 * translation covers every occurrence, and an untranslated string falls back to the English
 * text, exactly as lt() does for interface copy. Coverage is measured by
 * scripts/check-product-i18n.mjs.
 *
 * Pure functions, no catalogue import: LocaleContext uses this from the site chrome, which
 * must never pull the 181 KB catalogue into the entry chunk (see src/data/categories.js).
 */
export const EMPTY_PRODUCT_DICT = Object.freeze({
  names: {},
  descriptions: {},
  specLabels: {},
  specValues: {},
  terms: {},
});

/** Collapse runs of whitespace so scraped values with stray newlines still match their key. */
export const normKey = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

const pick = (map, value) => {
  if (value == null || value === '' || !map) return value;
  const hit = map[normKey(value)];
  return hit == null ? value : hit;
};

/** One term (a finish name, a filter label) in the active language, or itself when unknown. */
export function translateTerm(dict, term) {
  return pick(dict && dict.terms, term);
}

/**
 * A copy of `product` with its name, description, finish and specification rows in the
 * active language. Returns the SAME object when nothing in it is translated, so English
 * pages and untranslated products pay nothing. `enName` keeps the English name on a
 * translated product: search still matches what the catalogue calls it, and forms keep
 * sending the English name the KEAA sales team knows.
 */
export function localizeProduct(product, dict) {
  if (!product || !dict || dict === EMPTY_PRODUCT_DICT) return product;
  const name = pick(dict.names, product.name);
  const description = pick(dict.descriptions, product.description);
  const finish = pick(dict.terms, product.finish);
  let specsChanged = false;
  const specs = Array.isArray(product.specs)
    ? product.specs.map((s) => {
        if (!s) return s;
        const label = pick(dict.specLabels, s.label);
        const value = pick(dict.specValues, s.value);
        if (label === s.label && value === s.value) return s;
        specsChanged = true;
        return { ...s, label, value };
      })
    : product.specs;
  if (
    name === product.name &&
    description === product.description &&
    finish === product.finish &&
    !specsChanged
  ) {
    return product;
  }
  return { ...product, name, description, finish, specs, enName: product.enName || product.name };
}
