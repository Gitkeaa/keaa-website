/**
 * The search words each subcategory is actually trying to rank for, and the helpers that build
 * product and subcategory head tags from them.
 *
 * WHY THIS EXISTS
 * ---------------
 * The catalogue's own subcategory names are internal shorthand: "Slab Formwork System-Props",
 * "System Scaffolds-Ringlock", "Scaffold Tube Fitting-European". Nobody types those into
 * Google. Buyers type "steel props", "ringlock scaffolding", "EN 74 couplers". A page titled
 * with the internal name competes for a phrase with no searchers.
 *
 * So each subcategory carries one keyword phrase here, used in its own title, in the title of
 * every product inside it, and in the intro copy. Changing a phrase changes all three at once,
 * which is the point: they must agree or they compete with each other.
 *
 * ON NAMING A STANDARD IN A KEYWORD
 * ---------------------------------
 * Two entries name one: "EN 74 Couplers" and "EN 1065 Steel Props". Both are grounded in the
 * product data rather than chosen because they sound authoritative. EN 74-1 appears on 17 of
 * the 18 European tube fittings. EN 1065 is thinner, on one prop record, so that phrase is the
 * one to re-check before it goes anywhere a buyer could read it as a blanket certification.
 * Every other phrase is a plain description and claims nothing.
 *
 * The keys are the exact `subcategory` strings in products.json. A typo here silently falls
 * back to the raw catalogue name, so `npm run check:seo-keywords` fails the build on a key
 * that matches nothing.
 */

export const SUBCATEGORY_KEYWORDS = {
  /* ---- Livestock Housing Solutions ---- */
  Calves: 'Calf Housing',
  Cattle: 'Cattle Housing',
  'Field Gates': 'Field Gates',
  Horse: 'Horse Stable Equipment',
  Pigs: 'Pig Housing',
  Sheep: 'Sheep Handling Equipment',

  /* ---- Scaffolding & Formworks ---- */
  'Access Scaffold-American Frame': 'American Frame Scaffolding',
  'Access Scaffold-Euro Frame': 'Euro Frame Scaffolding',
  'Accessories Jacks & Nuts': 'Scaffold Jacks and Base Nuts',
  'Formwork-Accessories': 'Formwork Accessories',
  'Load Bearing System-Shoring Tower': 'Shoring Towers',
  'Scaffold Tube Fitting-British & American': 'British Scaffold Couplers',
  'Scaffold Tube Fitting-European': 'EN 74 Couplers',
  'Security Systems-Guard Rails & Railing Posts': 'Scaffold Guard Rails',
  'Slab Formwork System-Fork Heads': 'Formwork Fork Heads',
  'Slab Formwork System-Props': 'Steel Props',
  'System Scaffold-Cuplock': 'Cuplock Scaffolding',
  'System Scaffolds - HK': 'HK Scaffolding',
  'System Scaffolds-Ringlock': 'Ringlock Scaffolding',
  'System Slab Formwork-Tripods': 'Formwork Tripods',
  'Trestles & Barriers': 'Trestles and Barriers',
  'Wall Formwork Systems-Clamps & Panels': 'Wall Formwork Clamps',

  /* ---- Wood Connectors DIY Hardware Products ---- */
  'Adjustable Post Supports': 'Adjustable Post Supports',
  'Indoor Wood Connectors': 'Indoor Wood Connectors',
  'Miscellaneous Products': 'Wood Connector Hardware',
  'Pole Anchors & Ground Plates': 'Ground Anchors and Pole Plates',
  'Post Caps': 'Post Caps',
  'Post Supports': 'Post Supports',
};

/** The phrase for a subcategory, falling back to its catalogue name so nothing renders blank. */
export function subcategoryKeyword(subcategory) {
  return SUBCATEGORY_KEYWORDS[subcategory] || subcategory || 'Scaffolding';
}

/** Google truncates a title around 60 characters; past that the tail is never read. */
const TITLE_MAX = 60;
/** And a description around 160. */
const DESC_MAX = 160;

/**
 * Picks the first spec whose label matches one of `labels`, case-insensitively.
 * Specs are `[{ label, value }]` and 226 of the 355 products carry them, so every caller has
 * to cope with getting nothing back.
 */
function spec(product, labels) {
  const specs = Array.isArray(product?.specs) ? product.specs : [];
  for (const want of labels) {
    const hit = specs.find((s) => s && typeof s.label === 'string' && s.label.toLowerCase().includes(want));
    if (hit && hit.value) return String(hit.value).trim();
  }
  return '';
}

/** EN 74-1, EN 1065, EN 10025-2, BS 1139 and so on, as the data spells them. */
const STANDARD_RE = /\b(?:EN|DIN EN|DIN|BS|IS)\s?\d{2,5}(?:-\d+)?\b/i;

/** The first standard cited anywhere on the product, normalised to "EN 1461" spacing. */
function standardOf(product) {
  const haystack = [
    spec(product, ['finish', 'material', 'standard']),
    product?.description || '',
    JSON.stringify(product?.specs || []),
  ].join(' ');
  const m = haystack.match(STANDARD_RE);
  if (!m) return '';
  return m[0].replace(/\s+/g, ' ').replace(/^DIN EN/i, 'EN').replace(/^(EN|BS|DIN|IS)(\d)/i, '$1 $2').trim();
}

/**
 * "Ringlock Ledger | Ringlock Scaffolding Manufacturer | KEAA"
 *
 * Composed longest-first and stepped down until it fits, rather than chopped mid-word: a title
 * cut at 60 characters reads as broken in a search result, and the brand at the end is the part
 * worth protecting. The last resort trims the product name itself, which is the only piece that
 * can be arbitrarily long.
 */
export function productTitle(product) {
  const name = (product?.name || 'Product').trim();
  const keyword = subcategoryKeyword(product?.subcategory);

  const candidates = [
    `${name} | ${keyword} Manufacturer | KEAA`,
    `${name} | ${keyword} | KEAA`,
    `${name} | KEAA`,
  ];
  for (const c of candidates) if (c.length <= TITLE_MAX) return c;

  const room = TITLE_MAX - ' | KEAA'.length;
  return `${name.slice(0, room).trim()} | KEAA`;
}

/**
 * "Ringlock Ledger (KIRLG) by KEAA International: Hot Dip Galvanized as per EN 1461,
 *  2070mm. Exported to 42+ countries. Request a quote."
 *
 * Every clause is optional because the data is uneven: 226 of 355 products have specs at all,
 * 164 name a finish and 165 name a standard. Clauses are dropped from the least important end
 * until the whole thing fits, so a sparse product still gets a readable sentence rather than a
 * truncated one.
 *
 * What it replaced was the raw `description` field, which on many products was a bare spec
 * string such as "Powder Coated / Hot Dip Galvanized as per DIN EN 1461": accurate, and
 * meaningless as the one line a buyer reads in a search result.
 */
export function productDescription(product) {
  const name = (product?.name || 'Product').trim();
  const code = (product?.itemCode || '').trim();
  const keyword = subcategoryKeyword(product?.subcategory);

  const head = code ? `${name} (${code}) by KEAA International` : `${name} by KEAA International`;
  const tail = 'Exported to 42+ countries. Request a quote.';

  const finish = spec(product, ['finish', 'coating']);
  const size = spec(product, ['length', 'size', 'dia', 'od', 'tube', 'height', 'width', 'thickness']);
  const std = standardOf(product);

  // A finish value very often already ends in "as per EN 1461", so naming the standard again
  // would read as a stutter. Only added when it is not already in the finish text.
  const clauses = [];
  if (finish) clauses.push(finish);
  if (size) clauses.push(size.includes(',') ? `sizes ${size}` : size);
  if (std && !(finish && finish.includes(std))) clauses.push(`made to ${std}`);

  const build = (parts) => (parts.length ? `${head}: ${parts.join(', ')}. ${tail}` : `${head}, part of the ${keyword} range. ${tail}`);

  for (let i = clauses.length; i >= 0; i -= 1) {
    const out = build(clauses.slice(0, i));
    if (out.length <= DESC_MAX) return out;
  }
  return `${head}. ${tail}`.slice(0, DESC_MAX);
}

/** "Ringlock Scaffolding Manufacturer & Exporter | KEAA International", trimmed to fit. */
export function subcategoryTitle(subcategory) {
  const keyword = subcategoryKeyword(subcategory);
  const candidates = [
    `${keyword} Manufacturer & Exporter | KEAA International`,
    `${keyword} Manufacturer & Exporter | KEAA`,
    `${keyword} Manufacturer | KEAA`,
  ];
  for (const c of candidates) if (c.length <= TITLE_MAX) return c;
  return candidates[candidates.length - 1].slice(0, TITLE_MAX);
}

/**
 * The one line under a subcategory in a search result.
 *
 * `count` is the real number of products in the range, taken from the catalogue at render time
 * rather than written down here, so it cannot drift out of date when a product is added.
 */
export function subcategoryDescription(subcategory, count) {
  const keyword = subcategoryKeyword(subcategory);
  // Deliberately no finish claim. Hot dip galvanizing to EN 1461 covers most of the
  // scaffolding ranges but not all of them: the indoor wood connectors are zinc coated sheet
  // to EN 10346 instead. One sentence cannot be true of all 28 ranges, so it says nothing
  // about finish and the range page itself carries the detail.
  const n = Number(count) > 0 ? `${count} products in the KEAA International range. ` : '';
  const out = `${keyword} manufactured in Ludhiana, India and exported to 42+ countries. ${n}Request a quote.`;
  return out.length <= DESC_MAX
    ? out
    : `${keyword} manufactured in Ludhiana, India by KEAA International, exported to 42+ countries. Request a quote.`;
}
