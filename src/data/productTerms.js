/**
 * The short catalogue vocabulary that productHelpers DERIVES from product data rather than
 * reads from it: the finish names it recognises in specification text, and the product-type
 * labels the catalogue filter groups products under.
 *
 * Kept in this dependency-free module so that two places can share one list without either
 * importing the 181 KB catalogue: productHelpers.js (which applies the rules) and
 * scripts/check-product-i18n.mjs (which checks every language has a translation for each
 * label). The labels here are the English keys in a language's `terms` dictionary, see
 * src/i18n/localizeProduct.js. Change a label here and the checker reports it untranslated
 * until every dictionary carries the new key.
 */

/** Finish rules: the first needle found in a product's spec text wins. */
export const FINISH_RULES = [
  ['hot dip', 'Hot Dip Galvanized'],
  ['hot-dip', 'Hot Dip Galvanized'],
  ['electro', 'Electro Galvanized'],
  ['powder', 'Powder Coated'],
  ['stainless', 'Stainless Steel'],
  ['paint', 'Painted'],
  ['galvani', 'Galvanized'],
];

/** The distinct finish labels the rules above can produce. */
export const FINISH_LABELS = [...new Set(FINISH_RULES.map(([, label]) => label))];

/** Product-type rules: the first pattern that matches a product NAME wins. */
export const TYPE_RULES = [
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

/** The catch-all type bucket, pinned to the bottom of the filter list. */
export const TYPE_OTHER = 'Other';

/** Every derived label a dictionary's `terms` map must cover. */
export const ALL_TERMS = [...FINISH_LABELS, ...TYPE_RULES.map(([, label]) => label), TYPE_OTHER];
