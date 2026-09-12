import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { readFileSync, watch } from 'node:fs';
import path from 'node:path';

// The bot is "trained" on the website's own data files (src/data/*.js). Those
// files are loaded dynamically below and re-loaded automatically whenever they
// change, so the assistant always reflects the current site, no manual restart.

dotenv.config();

// This used to run on Gemini's free tier. It broke twice in three days: Google
// permanently denied the project behind the key ("403 Your project has been denied
// access"), first on the original account and then again on a brand-new one. Free-tier
// keys are not a foundation a customer-facing widget can stand on, so the assistant now
// runs on the Claude API, which bills per token instead of handing out revocable free
// quota. verifyApiKey() at the bottom still proves the key at startup so a bad key shows
// up in the boot log rather than as a dead widget an hour later.
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Haiku 4.5 is the cheapest current Claude model ($1 per million input tokens) and is
// more than capable of answering from a knowledge base. The knowledge base is the
// expensive part of every request, so it is sent as a cached prefix (see askClaude).
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';

// How long a single reply may run. The system prompt tells the model to keep answers
// short, so this is a safety ceiling rather than a target.
const MAX_TOKENS = 2048;

const app = express();
// maxRetries covers 429 / 5xx / connection errors with exponential backoff, so we do not
// hand-roll a retry loop. Overloads and rate limits are handled before they reach us.
const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY, maxRetries: 3 });

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are the KEAA AI Assistant, a helpful and professional assistant for KEAA International Pvt. Ltd. — an Indian company that manufactures and exports scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware.

Company Information:
- Name: KEAA International Pvt. Ltd. (short: KEAA)
- Tagline: "Built for Safety. Built to Last."
- Founded: 2003
- Manufacturing plant: Village Bhagwanpura, Dehlon Road, Ludhiana – 141120, Punjab, India (25,000 sq. m in-house facilities)
- European sales office & warehouse: Park Forum 1005, 5657 HJ Eindhoven, The Netherlands
- Main products: Scaffolding systems, formwork accessories, safety products, livestock housing solutions, garden hardware
- Reach: Exports to 42+ countries with 23+ years of experience and 1000+ skilled workforce

Capabilities & Quality:
- In-house hot dip galvanizing (4 m and 1.7 m zinc baths, DIN EN 1461), automatic powder coating, sheet & tube laser cutting, robotic welding, CNC press brake
- Certified welders per EN 1090-2 / EN ISO 3834-2 (SLV Germany); Ü-mark props (EN 1065 Class BD) and couplers (EN 74-1 B/BB) via Sigma Karlsruhe
- Certifications: ISO 9001:2015 (Quality Management), ISO 14001:2015 (Environmental Management) and ISO 45001:2018 (Occupational Health & Safety) — all certified by TÜV Rheinland; plus ZED Silver (MSME Sustainable / Zero Defect Zero Effect, Govt. of India)

Contact Information:
- India (manufacturing): +91 98767 01926, +91 98729 84707 — emails: raveesh@keaa-international.net, bhupesh@keaa-international.net, sumit@keaa-international.net
- Netherlands (sales): +31 655 282 244
- Website: www.keaainternational.com

Guidelines:
1. Answer questions about KEAA's products, services, manufacturing capabilities and company information.
2. Be professional, concise and courteous. Keep answers short unless the user asks for detail.
3. For quotations, bulk/OEM orders or export inquiries, guide users to the "Request a Quote" (RFQ) page or the contact details above.
4. If you don't know something specific, say so honestly and suggest contacting the company directly.
5. Only discuss KEAA and its offerings; politely decline unrelated requests.
6. The KNOWLEDGE BASE below is your ONLY source of truth for products, categories, item codes, sizes, specs, projects, certifications, careers and resources. Every product name, category, item code, dimension, finish, spec and link you give MUST appear in it verbatim — never invent, guess, approximate or round a value. We have exactly 3 product categories and 355 catalogued products; do not claim any others. When you name a product, link its exact product-page path from the knowledge base (e.g. [Cuplock Standard](/product/13)); when you name a category or subcategory, link its "page:" path. If a detail (a price, a spec, a product) is not in the knowledge base, say you don't have it and point the customer to the RFQ form or the contact details — do not fabricate it.
7. Use the KEY PAGES list to guide visitors: when a whole page answers them, link it by its exact path, e.g. [Manufacturing](/manufacturing), [Certifications](/certifications), [Downloads Center](/downloads) or [Contact Us](/contact). Send every pricing, minimum-order, lead-time, sample or OEM/custom question to the Request a Quote page ([RFQ](/rfq)), and never state or estimate a figure that is not in the knowledge base. The FAQ, COMPANY PROFILE and OFFICES & CONTACT sections are authoritative for ordering, manufacturing, export, compliance and contact questions.
8. FORMATTING: Reply in clean, well-structured Markdown so it is easy to scan. Never use an em dash (—) anywhere in your reply; use a comma, colon or a shorter sentence instead. Start with a one-line summary sentence. For any list of 3+ items, use hyphen "-" bullet points (each on its own line), and put a blank line before the list. Use **bold** only for key terms or category names. Keep paragraphs to 1-2 sentences. Never cram a list into a single paragraph.`;

/**
 * KEAA has TWO product sources and they are complementary, not duplicates. The bot needs
 * both, and it needs to know which is which:
 *
 *   products.json  355 browsable products, each with a real catalogue page the bot can
 *                  send a customer to. No size ranges. Contains NO safety/PPE at all.
 *
 *   products.js    60 curated item codes from KEAA's printed catalogues, WITH size ranges.
 *                  Only 16 of those 60 also appear in products.json — the other 44 exist
 *                  nowhere else. This is also the only place Safety Products lives.
 *
 * Feeding the bot only products.js (which is what it used to do) meant it answered from a
 * 5-category marketing taxonomy that does not match the website, could not name any of the
 * 355 real products, and pointed people at /products/safety-products, which 404s.
 *
 * Feeding it only products.json would be worse: it would start telling customers KEAA does
 * not sell safety harnesses — a line the top bar advertises on every page.
 */
function renderCatalogue(catalogue, categoryTree) {
  // Slug lookups from the generated category tree, so every URL the bot emits is a real
  // route the site serves (this also carries the wood-connectors slug override). Product
  // pages are keyed by numeric id (/product/:id); category/subcategory pages by slug.
  const catSlug = new Map((categoryTree || []).map((c) => [c.name, c.slug]));
  const subSlug = new Map();
  for (const c of categoryTree || []) {
    for (const s of c.subcategories || []) subSlug.set(`${c.name}|||${s.name}`, s.slug);
  }

  // One authoritative line per product: CODE — Name (page) | description | specs. Everything
  // the bot is allowed to say about a product — its code, link, sizes, finish — is right here.
  const productLine = (p) => {
    const code = p.itemCode ? `${p.itemCode} — ` : '';
    const link = ` (/product/${p.id})`;
    const desc = p.description && p.description.trim() ? ` | ${p.description.trim()}` : '';
    const specStr = (p.specs || [])
      .filter((s) => s && s.value)
      // Drop a spec that just repeats the item code we already print at the start of the line.
      .filter(
        (s) =>
          !(
            String(s.label).replace(/:/g, '').trim().toLowerCase() === 'item no' &&
            String(s.value).trim() === p.itemCode
          )
      )
      .map((s) => `${String(s.label).replace(/:$/, '').trim()}: ${s.value}`)
      .join('; ');
    const specs = specStr ? ` | ${specStr}` : '';
    return `      - ${code}${p.name}${link}${desc}${specs}`;
  };

  const byCat = new Map();
  for (const p of catalogue) {
    if (!byCat.has(p.category)) byCat.set(p.category, new Map());
    const subs = byCat.get(p.category);
    if (!subs.has(p.subcategory)) subs.set(p.subcategory, []);
    subs.get(p.subcategory).push(p);
  }
  return [...byCat.entries()]
    .map(([cat, subs]) => {
      const cs = catSlug.get(cat) || '';
      const total = [...subs.values()].reduce((n, i) => n + i.length, 0);
      const body = [...subs.entries()]
        .map(([sub, items]) => {
          const ss = subSlug.get(`${cat}|||${sub}`) || '';
          const lines = items.map(productLine).join('\n');
          return `    • ${sub} (${items.length}) — page: /products/${cs}/${ss}\n${lines}`;
        })
        .join('\n');
      return `- ${cat} (${total} products — page: /products/${cs})\n${body}`;
    })
    .join('\n\n');
}

/** The curated item codes + size ranges from KEAA's own printed catalogues. */
function renderItemCodes(productCategories, enquiryOnlySlugs) {
  return productCategories
    .map((cat) => {
      const families = (cat.families || [])
        .map((f) => {
          const items = (f.items || [])
            .map(
              (it) =>
                `      - ${it.code}${it.label ? ` — ${it.label}` : ''}${it.size ? ` (${it.size})` : ''}`
            )
            .join('\n');
          return `    • ${f.title}${f.spec ? `\n      Spec: ${f.spec}` : ''}${items ? `\n${items}` : ''}`;
        })
        .join('\n');
      const flag = enquiryOnlySlugs.includes(cat.slug)
        ? ' [NO CATALOGUE PAGE YET — we manufacture and quote for this; send the customer to the RFQ form, never to a product URL]'
        : '';
      return `- ${cat.name}${flag}: ${cat.short}\n    Highlights: ${cat.bullets.join(', ')}\n    Standard: ${cat.standard}\n${families}`;
    })
    .join('\n\n');
}

// The site's main pages, so the assistant can point a visitor at the right one. Kept as a
// small static list here rather than imported from src/data/navigation.js, which pulls in
// lucide-react (a browser UI dependency the server has no reason to load).
const KEY_PAGES = [
  ['/', 'Home'],
  ['/about', 'About Us: company story, journey, leadership and team'],
  ['/products', 'All Products: every line we manufacture'],
  ['/manufacturing', 'Manufacturing: facilities, the 7-step process, machinery and output at scale'],
  ['/projects-gallery', 'Projects & Gallery: completed projects, factory photography and films'],
  ['/certifications', 'Certifications: ISO, EN 1090, SLV welding, Ü-mark and test reports'],
  ['/downloads', 'Downloads Center: the full product catalogues (PDF)'],
  ['/faq', 'FAQ & Testimonials: ordering, finishes, lead times, export and customer reviews'],
  ['/careers', 'Careers: current openings'],
  ['/rfq', 'Request a Quote (RFQ): the place for prices, minimum order, lead times, OEM and custom orders'],
  ['/contact', 'Contact Us: offices, phone and email'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/terms', 'Terms of Use'],
  ['/cookie-policy', 'Cookie Policy'],
];

/** Full company profile: identity, scale, values, manufacturing capability, process, history. */
function renderCompanyProfile(c) {
  const stat = (c.stats || []).map((s) => `${s.value} ${s.label}`).join(' · ');
  const values = (c.values?.values || []).map((v) => `  - ${v}`).join('\n');
  const machinery = (c.machinery || []).map((m) => `  - ${m.name}: ${m.desc}`).join('\n');
  const steps = (c.processSteps || []).map((s) => `  ${s.step}. ${s.title}: ${s.desc}`).join('\n');
  const milestones = (c.timeline || []).map((t) => `  - ${t.year}: ${t.title}. ${t.desc}`).join('\n');
  const f = c.facilities || {};
  return `
COMPANY PROFILE:
- Legal name: ${c.name} (${c.shortName}); part of the ${c.group} group, founded ${c.founded}. Tagline: "${c.tagline}".
- By the numbers: ${stat}.
- Vision: ${c.values?.vision || ''}
- Mission: ${c.values?.mission || ''}
- Core values:
${values}

MANUFACTURING CAPABILITY (all in-house at the Ludhiana, India plant):
- Facilities: ${f.area} across ${f.units} units; annual capacity ${f.capacity}; ${f.moldRooms}.
- Galvanizing: ${f.galvanizingBaths}, to DIN EN 1461.
- Coating: ${f.powderCoating}.
- Welding: ${f.welders}.
- Certified quality: ${f.quality}.
- In-house testing: ${f.testing}.
- Machinery:
${machinery}

MANUFACTURING PROCESS (raw material to dispatch):
${steps}

COMPANY MILESTONES:
${milestones}`;
}

/** Offices, full contact details, and which office serves which region. */
function renderContact(c) {
  const s = c.social || {};
  return `
OFFICES & CONTACT:
- Head Office & Manufacturing (global export desk): ${c.manufacturing.line1}, ${c.manufacturing.line2}. Phones: ${c.phones.join(', ')}; landline ${c.landline.join(', ')}; fax ${c.fax}.
- Europe Sales Office & Warehouse: ${c.salesOffice.line1}, ${c.salesOffice.line2}. Phone: ${c.salesOffice.phone}.
- Emails: ${c.emails.join(', ')}. Website: ${c.website}.
- Which office serves you: Europe and the UK are served from the Eindhoven office; the Middle East, Africa, Asia-Pacific, the Americas and India are served from the Ludhiana head office.
- Official channels: LinkedIn ${s.linkedin} · YouTube ${s.youtube} · WhatsApp ${s.whatsapp}.`;
}

/** The grouped FAQ, verbatim: ordering, finishes, export and compliance answers live here. */
function renderFaqs(faqs) {
  return (faqs || [])
    .map((g) => {
      const items = (g.items || []).map((it) => `  - Q: ${it.q}\n    A: ${it.a}`).join('\n');
      return `${g.group}:\n${items}`;
    })
    .join('\n');
}

/** The site's main pages, each with its exact path, so the bot can link the right one. */
function renderKeyPages() {
  return KEY_PAGES.map(([path, desc]) => `- ${desc}: ${path}`).join('\n');
}

// Turn the structured site data into a compact text knowledge base for the model.
function buildKnowledgeBase(data) {
  const {
    company,
    leadership,
    chairman,
    managingDirectors,
    developer,
    countries,
    catalogue,
    categoryTree,
    productCategories,
    enquiryOnlySlugs,
    bestSellers,
    testimonials,
    featuredProjects,
    careers,
    catalogueDownloads,
    faqs,
  } = data;

  const list = (arr, fn) => arr.map(fn).join('\n');

  return `
=== KEAA KNOWLEDGE BASE (authoritative — answer from this) ===

HOW TO USE THE TWO PRODUCT SECTIONS BELOW:
- BROWSABLE CATALOGUE is every product with its own page on the website. When a customer
  asks what we make, or about a specific product, answer from here. Its names, item codes,
  descriptions and specs are authoritative — quote them exactly, never paraphrase a number.
- Each product line ends with its page in parentheses, e.g. (/product/16). Link a product
  as a Markdown link: [Ringlock Standard](/product/13). Link a whole category or a
  subcategory using its "page:" path. Use these paths verbatim; never invent or alter one.
- ITEM CODE & SIZE REFERENCE comes from KEAA's printed catalogues. Use it when a customer
  asks for an item code or a size range. Some of these have no page on the website.
- Safety Products is real and we sell it, but it has no catalogue page yet. Never claim we
  do not make it, and never link to a product page for it — route the customer to the RFQ.

BROWSABLE CATALOGUE (${catalogue.length} products across ${
    categoryTree?.length ?? 0
  } categories — every one has its own page on the website).
Line format: ITEM CODE — Name (product page path) | description | specs. Category and
subcategory headers carry their own "page:" path. Link products/categories using these
exact paths; state only item codes, sizes, finishes and specs that appear here.
${renderCatalogue(catalogue, categoryTree)}

ITEM CODE & SIZE REFERENCE (from KEAA's printed catalogues):
${renderItemCodes(productCategories, enquiryOnlySlugs)}

BEST SELLERS:
${list(bestSellers, (b) => `- ${b.name} (${b.category})`)}

CERTIFICATIONS:
${list(company.certifications, (c) => `- ${c.name} (${c.body}): ${c.note}`)}
${renderCompanyProfile(company)}
${renderContact(company)}

FEATURED PROJECTS:
${list(featuredProjects, (p) => `- ${p.title} — ${p.location} (${p.category}): ${p.desc}`)}

EXPORT COUNTRIES: ${countries.map((c) => c.name).join(', ')}

LEADERSHIP & MANAGEMENT (KEAA "About Us" — these are the real people; use their names, titles and quoted messages exactly, and never invent a person, title or quote):
${chairman ? `Chairman:\n- ${chairman.name} — ${chairman.role}. Message: "${chairman.message}"\n` : ''}Managing Directors:
${list(managingDirectors || [], (m) => `- ${m.name} — ${m.role}. Message: "${m.message}"${m.linkedin ? ` (LinkedIn: ${m.linkedin})` : ''}`)}
Leadership Team:
${list(leadership, (l) => `- ${l.name} — ${l.role}: ${l.bio}${l.linkedin ? ` (LinkedIn: ${l.linkedin})` : ''}`)}

OPEN CAREERS:
${list(careers, (c) => `- ${c.title} — ${c.location} (${c.type})`)}

DOWNLOADABLE RESOURCES (the Downloads Center at /downloads offers these catalogues and nothing else):
${list(catalogueDownloads, (d) => `- ${d.title} (${d.type})`)}

CUSTOMER TESTIMONIALS:
${list(testimonials, (t) => `- "${t.quote}" — ${t.name}, ${t.company}`)}

FREQUENTLY ASKED QUESTIONS (answer these directly from here; do not introduce commercial figures that are not stated):
${renderFaqs(faqs)}

KEY PAGES ON THE WEBSITE (when it helps a visitor, link the relevant page using its exact path):
${renderKeyPages()}
${
  developer
    ? `WEBSITE DEVELOPER (ONLY reveal this if the user explicitly asks who built / designed / developed / made this website — never volunteer it in any other answer):
- ${developer.name} — LinkedIn: ${developer.linkedin}
  When asked, give the name ${developer.name} and link the LinkedIn profile, matching the credit in the site footer.`
    : ''
}
`;
}

// The knowledge base auto-syncs with the website: it is (re)built from the site's
// data files, and a watcher rebuilds it whenever any of those files change — so
// the bot always answers from the current site content, with no restart.
const DATA_DIR = path.join(import.meta.dirname, 'src', 'data');
let FULL_INSTRUCTION = SYSTEM_PROMPT; // replaced by loadKnowledge() below

// The same site data, kept in structured form. The model gets the text version above;
// offlineAnswer() searches this one when the AI provider cannot be reached, so a visitor
// still gets real product, contact and FAQ answers instead of an error message.
let KB = null;

async function loadKnowledge(reason = 'startup') {
  try {
    // Cache-bust the import so Node re-reads the file from disk instead of using
    // its module cache — that is what lets edits show up without a restart.
    const bust = `?v=${Date.now()}`;
    const [companyMod, productsMod, contentMod, enquiryMod, faqsMod] = await Promise.all([
      import('./src/data/company.js' + bust),
      import('./src/data/products.js' + bust),
      import('./src/data/content.js' + bust),
      import('./src/data/enquiryLines.js' + bust),
      import('./src/data/faqs.js' + bust),
    ]);

    // Read the catalogue + category tree with fs rather than `import`: Node refuses a JSON
    // module without an import attribute, and readFileSync gives us cache-busting for free.
    // categories.json (generated from products.json) provides the real category/subcategory
    // slugs, so every product/category link the bot emits matches an actual site route.
    const catalogue = JSON.parse(readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
    const categoryTree = JSON.parse(readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));

    const facts = {
      company: companyMod.company,
      leadership: companyMod.leadership,
      chairman: companyMod.chairmanMessage,
      managingDirectors: companyMod.managingDirectors,
      developer: companyMod.developer,
      countries: companyMod.countries,
      catalogue,
      categoryTree,
      productCategories: productsMod.productCategories,
      enquiryOnlySlugs: enquiryMod.enquiryOnlyLines.map((l) => l.slug),
      bestSellers: productsMod.bestSellers,
      testimonials: contentMod.testimonials,
      featuredProjects: contentMod.featuredProjects,
      careers: contentMod.careers,
      catalogueDownloads: contentMod.catalogueDownloads,
      faqs: faqsMod.faqs,
    };

    FULL_INSTRUCTION = `${SYSTEM_PROMPT}\n${buildKnowledgeBase(facts)}`;
    KB = facts;
    console.log(`[chat] knowledge base loaded (${reason}): ${FULL_INSTRUCTION.length} chars`);
  } catch (error) {
    // Never crash the bot on a bad edit — keep serving the last good knowledge.
    console.error('[chat] could not (re)load knowledge base:', error.message);
  }
}

// Watch the data folder and rebuild on any change (debounced so a burst of saves
// triggers a single rebuild).
function watchDataFiles() {
  let timer = null;
  try {
    watch(DATA_DIR, (event, filename) => {
      // products.json is part of the knowledge base too, so watch it as well.
      if (!filename || !(filename.endsWith('.js') || filename.endsWith('.json'))) return;
      clearTimeout(timer);
      timer = setTimeout(() => loadKnowledge(`data change: ${filename}`), 250);
    });
    console.log('[chat] watching src/data — bot auto-syncs when site data changes');
  } catch (error) {
    console.warn('[chat] live data-watch unavailable:', error.message);
  }
}

// Ask Claude. The knowledge base runs to tens of thousands of tokens and is byte-identical
// on every request, so it is sent as a cached prefix: the first call of a conversation
// writes the cache, every follow-up reads it back at about a tenth of the input price.
// Caching is a prefix match, so nothing volatile (no timestamps, no visitor ids) may go
// into the system block, or the cache is missed on every single request.
async function generateReply({ history, message, language }) {
  /**
   * The language instruction is a SECOND system block, after the cached one, never inside
   * it: caching is a prefix match, so the cached knowledge block stays byte-identical and
   * keeps hitting while this small uncached tail varies per visitor. English adds nothing —
   * the base prompt already answers in English.
   */
  const system = [{ type: 'text', text: FULL_INSTRUCTION, cache_control: { type: 'ephemeral' } }];
  if (language && language !== 'en') {
    system.push({
      type: 'text',
      text:
        `The visitor is reading the site in the language with ISO code "${language}". ` +
        `Reply in that language. If they write to you in some other language, follow the ` +
        `language they actually write in. Keep product names, item codes and certification ` +
        `names in their original form.`,
    });
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: [...history, { role: 'user', content: message }],
  });

  // Claude 4+ can decline a request outright. There is no content to read when it does.
  if (response.stop_reason === 'refusal') {
    const error = new Error('The model declined to answer this request.');
    error.refusal = true;
    throw error;
  }

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  if (!text) throw new Error('The model returned an empty response.');

  // cache_read_input_tokens staying at 0 across requests means something volatile crept
  // into the system block and the cache is being paid for but never used.
  const { input_tokens: fresh, cache_read_input_tokens: cached } = response.usage;
  console.log(`[chat] replied via ${response.model} (${fresh} new + ${cached ?? 0} cached input tokens)`);

  return { text, modelName: response.model };
}

/* ---------------------------------------------------------------------------
 * Offline fallback
 *
 * If the AI provider is unreachable (bad key, outage, rate limit, no network),
 * the visitor used to get "the assistant is temporarily unavailable" and nothing
 * else. Everything the bot answers from is already loaded in this process, so we
 * answer from it directly instead: a plain keyword search over the catalogue,
 * FAQ, contact details, certifications, downloads and careers. It is not a
 * conversation, but it is real information rather than a dead end.
 * ------------------------------------------------------------------------- */

// Words too common to tell one question apart from another.
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'you', 'your', 'are', 'can', 'with', 'what', 'who', 'how', 'why',
  'does', 'did', 'has', 'have', 'this', 'that', 'they', 'them', 'from', 'about', 'any',
  'all', 'get', 'got', 'let', 'know', 'tell', 'give', 'need', 'want', 'please', 'their',
  'there', 'been', 'was', 'were', 'will', 'would', 'could', 'should', 'keaa', 'international',
]);

const OFFLINE_NOTE =
  '_The AI assistant is offline right now, so this is a direct search of our site data._';

const RFQ_LINE =
  'For prices, minimum order quantity, lead times, samples, OEM or custom work, please use the [Request a Quote](/rfq) form. We do not publish figures, our team quotes each enquiry.';

function offlineTokens(question) {
  return [...new Set(
    String(question)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
  )];
}

/** How many of the query's words appear in a block of text. */
function scoreText(text, tokens) {
  const haystack = String(text || '').toLowerCase();
  return tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0);
}

function offlineContact(company) {
  return [
    `**Head office and manufacturing (global export desk)**`,
    `${company.manufacturing.line1}, ${company.manufacturing.line2}`,
    `Phone: ${company.phones.join(', ')}`,
    '',
    `**Europe sales office and warehouse**`,
    `${company.salesOffice.line1}, ${company.salesOffice.line2}`,
    `Phone: ${company.salesOffice.phone}`,
    '',
    `Email: ${company.emails.join(', ')}`,
    '',
    'Full details are on the [Contact Us](/contact) page.',
  ].join('\n');
}

function offlineProducts(question, tokens) {
  const { catalogue, categoryTree } = KB;
  const catSlug = new Map((categoryTree || []).map((c) => [c.name, c.slug]));

  const scored = catalogue
    .map((product) => {
      // A name or item-code hit is a far stronger signal than a stray word in a spec.
      const score =
        scoreText(product.name, tokens) * 3 +
        scoreText(product.itemCode, tokens) * 3 +
        scoreText(product.subcategory, tokens) * 2 +
        scoreText(product.category, tokens) +
        scoreText(product.description, tokens);
      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  if (!scored.length) return null;

  const lines = scored.map(({ product }) => {
    const code = product.itemCode ? `${product.itemCode}, ` : '';
    return `- [${product.name}](/product/${product.id}) (${code}${product.category})`;
  });

  const categories = [...new Set(scored.map((e) => e.product.category))]
    .map((name) => `[${name}](/products/${catSlug.get(name) || ''})`)
    .join(', ');

  return [
    `Here is what matches in our catalogue:`,
    '',
    ...lines,
    '',
    `Browse the full range under ${categories}, or see [all products](/products).`,
    '',
    RFQ_LINE,
  ].join('\n');
}

function offlineFaq(tokens) {
  const items = (KB.faqs || []).flatMap((group) => group.items || []);
  const best = items
    .map((item) => ({ item, score: scoreText(item.q, tokens) * 2 + scoreText(item.a, tokens) }))
    .filter((entry) => entry.score > 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (!best.length) return null;

  return [
    ...best.map(({ item }) => `**${item.q}**\n\n${item.a}`),
    'More questions are answered on the [FAQ](/faq) page.',
  ].join('\n\n');
}

/**
 * Best-effort answer built from the site's own data. Returns null only when the
 * knowledge base failed to load, in which case the caller sends a plain apology.
 */
function offlineAnswer(question) {
  if (!KB) return null;

  const q = String(question).toLowerCase();
  const tokens = offlineTokens(question);
  const { company } = KB;

  const say = (body) => `${OFFLINE_NOTE}\n\n${body}`;

  // Each pattern anchors on a word start but deliberately has no closing \b, so a stem
  // matches its whole family: "certif" catches certificate and certifications, "sample"
  // catches samples, "vacanc" catches vacancy and vacancies.
  if (/\b(contact|phone|call|email|e-mail|mail|address|office|located|location|whatsapp|reach us|get in touch)/.test(q)) {
    return say(offlineContact(company));
  }

  if (/\b(price|pricing|cost|quote|quotation|moq|minimum order|lead time|delivery time|sample|oem|custom|discount|payment term)/.test(q)) {
    return say(`${RFQ_LINE}\n\nYou can also reach the team directly, see [Contact Us](/contact).`);
  }

  if (/(\bcertif|\biso\b|9001|14001|45001|\ben ?1090\b|3834|1461|\bgalvani|\bcomplian|\baccredit|test report|[üu].?mark)/.test(q)) {
    const list = (company.certifications || [])
      .map((c) => `- **${c.name}** (${c.body}): ${c.note}`)
      .join('\n');
    return say(`Our certifications:\n\n${list}\n\nFull details, including test reports, are on the [Certifications](/certifications) page.`);
  }

  if (/\b(catalogue|catalog|brochure|pdf|download|datasheet|data sheet|spec sheet)/.test(q)) {
    const list = (KB.catalogueDownloads || []).map((d) => `- ${d.title} (${d.type})`).join('\n');
    return say(`These catalogues are available:\n\n${list}\n\nDownload them from the [Downloads Center](/downloads).`);
  }

  // Checked before the leadership branch so "who developed this website" is not answered
  // with a list of directors. As in the system prompt, the developer credit is given only
  // when it is explicitly asked for, never volunteered.
  if (/\bwho\s+(built|made|designed|developed|created)\b|\b(website|web|site)\s+(developer|designer)/.test(q)) {
    const dev = KB.developer;
    return say(
      dev
        ? `This website was built by ${dev.name}. LinkedIn: ${dev.linkedin}`
        : 'I do not have that on file. Please ask us through the [Contact Us](/contact) page.'
    );
  }

  if (/\b(chairman|managing director|founder|leadership|management team|board|\bceo\b|who runs|who leads|who owns)/.test(q)) {
    const people = [];
    if (KB.chairman) people.push(`- **${KB.chairman.name}**, ${KB.chairman.role}`);
    for (const m of KB.managingDirectors || []) people.push(`- **${m.name}**, ${m.role}`);
    for (const l of KB.leadership || []) people.push(`- **${l.name}**, ${l.role}`);
    return say(
      `Our leadership:\n\n${people.join('\n')}\n\nTheir full profiles and messages are on the [About Us](/about) page.`
    );
  }

  if (/\b(career|job|vacanc|hiring|recruit|internship|employment)/.test(q)) {
    const roles = KB.careers || [];
    const list = roles.length
      ? roles.map((c) => `- ${c.title}, ${c.location} (${c.type})`).join('\n')
      : 'There are no roles listed at the moment.';
    return say(`Current openings:\n\n${list}\n\nApply through the [Careers](/careers) page.`);
  }

  return say(
    offlineProducts(question, tokens) ||
      offlineFaq(tokens) ||
      [
        `I could not match that to anything specific while offline. These pages cover most questions:`,
        '',
        '- [All Products](/products): scaffolding, formwork accessories, livestock housing and garden hardware',
        '- [Manufacturing](/manufacturing): our facilities, machinery and process',
        '- [Certifications](/certifications): ISO, EN 1090 and welding approvals',
        '- [FAQ](/faq): ordering, finishes, lead times and export',
        '- [Request a Quote](/rfq): prices, minimum order and custom work',
        '- [Contact Us](/contact): offices, phone and email',
      ].join('\n')
  );
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory, language: rawLanguage } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    // Whitelisted, not trusted: the body is visitor input. Anything but a plain
    // two-letter code is treated as absent.
    const language = typeof rawLanguage === 'string' && /^[a-z]{2}$/.test(rawLanguage) ? rawLanguage : null;

    // Drop the just-sent user message (last item) from history, and drop any leading
    // assistant greeting, since the conversation has to start with a user turn.
    const priorHistory = (conversationHistory?.slice(0, -1) || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: String(msg.content ?? ''),
    }));
    while (priorHistory.length && priorHistory[0].role !== 'user') {
      priorHistory.shift();
    }

    const { text } = await generateReply({ history: priorHistory, message, language });

    res.json({ message: text });
  } catch (error) {
    const status = error?.status;
    console.error('[chat] Claude API error:', error?.message || error);

    // Say why in the log, precisely, so a broken deploy is diagnosable at a glance.
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
      console.error(
        '[chat] Claude rejected the API key (%s). Check ANTHROPIC_API_KEY in .env and that the ' +
          'account has credit. Manage keys at https://console.anthropic.com/settings/keys',
        status
      );
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error('[chat] rate limited by the Claude API even after retries.');
    } else if (error instanceof Anthropic.APIConnectionError) {
      console.error('[chat] could not reach the Claude API (network or DNS).');
    }

    // The visitor should not pay for our outage. Answer from the site's own data instead.
    const offline = offlineAnswer(req.body?.message);
    if (offline) return res.json({ message: offline, offline: true });

    res.status(503).json({
      error: 'The assistant is temporarily unavailable. Please try again later.',
      details: error?.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3001;

// Prove the key works before the first visitor ever tries, so a dead key shows up in the
// boot log instead of as a broken widget later. Deliberately a bare ping with no system
// prompt: sending the knowledge base here would bill tens of thousands of tokens on every
// restart, and this only needs to answer "is this key accepted".
async function verifyApiKey() {
  if (!ANTHROPIC_API_KEY || !ANTHROPIC_API_KEY.trim() || ANTHROPIC_API_KEY === 'your-api-key-here') {
    console.error(
      '\n[chat] ⚠  ANTHROPIC_API_KEY is not set. Add a key to .env and restart.\n' +
        '        Create one at https://console.anthropic.com/settings/keys\n' +
        '        Until then the widget answers offline, from the site data only.\n'
    );
    return;
  }
  try {
    await client.messages.create({
      model: MODEL,
      max_tokens: 4,
      messages: [{ role: 'user', content: 'ping' }],
    });
    console.log(`[chat] ✓ Claude API key verified (${MODEL}), assistant is ready.`);
  } catch (error) {
    const status = error?.status ?? '?';
    const hint =
      status === 401
        ? '        The key is invalid or revoked. Check ANTHROPIC_API_KEY in .env.\n'
        : status === 400 || status === 404
          ? `        The model "${MODEL}" was rejected. Check ANTHROPIC_MODEL in .env.\n`
          : status === 429
            ? '        Rate limited, or the account is out of credit. Check your plan and usage.\n'
            : '';
    console.error(
      `\n[chat] ⚠  Claude REJECTED the request at startup (HTTP ${status}). The chat will fall back to offline answers.\n` +
        `        ${error?.message || error}\n` +
        hint +
        '        Manage keys and credit at https://console.anthropic.com\n'
    );
  }
}

await loadKnowledge('startup');
await verifyApiKey();
watchDataFiles();

app.listen(PORT, () => {
  console.log(`AI Chat server running on http://localhost:${PORT}`);
});
