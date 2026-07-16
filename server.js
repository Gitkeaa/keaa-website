import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { readFileSync, watch } from 'node:fs';
import path from 'node:path';

// The bot is "trained" on the website's own data files (src/data/*.js). Those
// files are loaded dynamically below and re-loaded automatically whenever they
// change, so the assistant always reflects the current site — no manual restart.

dotenv.config();

const app = express();
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are the KEAA AI Assistant, a helpful and professional assistant for KEAA International Pvt. Ltd. — an Indo-Dutch company (part of the Runi Industries B.V. group) that manufactures and exports scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware.

Company Information:
- Name: KEAA International Pvt. Ltd. (short: KEAA)
- Tagline: "Built for Safety. Built to Last."
- Founded: 2003
- Group: Runi Industries B.V.
- Manufacturing plant: Village Bhagwanpura, Dehlon Road, Ludhiana – 141120, Punjab, India (25,000 sq. m in-house facilities)
- European sales office & warehouse (Runi Industries B.V.): Park Forum 1005, 5657 HJ Eindhoven, The Netherlands
- Main products: Scaffolding systems, formwork accessories, safety products, livestock housing solutions, garden hardware
- Reach: Exports to 42+ countries with 20+ years of experience and 150+ skilled employees

Capabilities & Quality:
- In-house hot dip galvanizing (4 m and 1.7 m zinc baths, DIN EN 1461), automatic powder coating, sheet & tube laser cutting, robotic welding, CNC press brake
- Certified welders per EN 1090-2 / EN ISO 3834-2 (SLV Germany); Ü-mark props (EN 1065 Class BD) and couplers (EN 74-1 B/BB) via Sigma Karlsruhe
- Certifications: ISO 9001:2015 (Quality Management), ISO 14001:2015 (Environmental Management) and ISO 45001:2018 (Occupational Health & Safety) — all certified by TÜV Rheinland; plus ZED Silver (MSME Sustainable / Zero Defect Zero Effect, Govt. of India)

Contact Information:
- India (manufacturing): +91 98767 01926, +91 98729 84707 — emails: raveesh@keaa-international.net, bhupesh@keaa-international.net, sumit@keaa-international.net
- Netherlands (sales): +31 655 282 244 — info@runiindustries.eu
- Website: www.keaainternational.com

Guidelines:
1. Answer questions about KEAA's products, services, manufacturing capabilities and company information.
2. Be professional, concise and courteous. Keep answers short unless the user asks for detail.
3. For quotations, bulk/OEM orders or export inquiries, guide users to the "Request a Quote" (RFQ) page or the contact details above.
4. If you don't know something specific, say so honestly and suggest contacting the company directly.
5. Only discuss KEAA and its offerings; politely decline unrelated requests.
6. The KNOWLEDGE BASE below is your ONLY source of truth for products, categories, item codes, sizes, specs, projects, certifications, careers and resources. Every product name, category, item code, dimension, finish, spec and link you give MUST appear in it verbatim — never invent, guess, approximate or round a value. We have exactly 3 product categories and 355 catalogued products; do not claim any others. When you name a product, link its exact product-page path from the knowledge base (e.g. [Cuplock Standard](/product/13)); when you name a category or subcategory, link its "page:" path. If a detail (a price, a spec, a product) is not in the knowledge base, say you don't have it and point the customer to the RFQ form or the contact details — do not fabricate it.
7. FORMATTING: Reply in clean, well-structured Markdown so it is easy to scan. Start with a one-line summary sentence. For any list of 3+ items, use hyphen "-" bullet points (each on its own line), and put a blank line before the list. Use **bold** only for key terms or category names. Keep paragraphs to 1-2 sentences. Never cram a list into a single paragraph.`;

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
    downloadResources,
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

DOWNLOADABLE RESOURCES:
${list(downloadResources, (d) => `- ${d.title} (${d.type}, ${d.size})`)}

CUSTOMER TESTIMONIALS:
${list(testimonials, (t) => `- "${t.quote}" — ${t.name}, ${t.company}`)}
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

async function loadKnowledge(reason = 'startup') {
  try {
    // Cache-bust the import so Node re-reads the file from disk instead of using
    // its module cache — that is what lets edits show up without a restart.
    const bust = `?v=${Date.now()}`;
    const [companyMod, productsMod, contentMod, enquiryMod] = await Promise.all([
      import('./src/data/company.js' + bust),
      import('./src/data/products.js' + bust),
      import('./src/data/content.js' + bust),
      import('./src/data/enquiryLines.js' + bust),
    ]);

    // Read the catalogue + category tree with fs rather than `import`: Node refuses a JSON
    // module without an import attribute, and readFileSync gives us cache-busting for free.
    // categories.json (generated from products.json) provides the real category/subcategory
    // slugs, so every product/category link the bot emits matches an actual site route.
    const catalogue = JSON.parse(readFileSync(path.join(DATA_DIR, 'products.json'), 'utf8'));
    const categoryTree = JSON.parse(readFileSync(path.join(DATA_DIR, 'categories.json'), 'utf8'));

    const knowledge = buildKnowledgeBase({
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
      downloadResources: contentMod.downloadResources,
    });

    FULL_INSTRUCTION = `${SYSTEM_PROMPT}\n${knowledge}`;
    console.log(`[chat] knowledge base loaded (${reason}) — ${FULL_INSTRUCTION.length} chars`);
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

// Models tried in order. The primary is fast/cheap; if Google reports it
// overloaded (503) or rate-limited (429), we fall back to the next one.
const MODEL_CHAIN = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Transient Google errors that are worth retrying rather than failing on.
const isTransient = (status) => status === 503 || status === 429 || status === 500;

// Ask Gemini with automatic retry + model fallback so temporary Google
// outages (503 "high demand") don't surface as a broken chat.
async function generateReply({ history, message }) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = client.getGenerativeModel({
          model: modelName,
          systemInstruction: FULL_INSTRUCTION,
        });
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(message);
        return { text: result.response.text(), modelName };
      } catch (error) {
        lastError = error;
        if (!isTransient(error?.status)) throw error; // e.g. bad key / bad request — don't retry
        console.warn(
          `[chat] ${modelName} attempt ${attempt + 1} failed (${error.status}); retrying...`
        );
        await sleep(500 * (attempt + 1)); // 0.5s, 1s, 1.5s backoff
      }
    }
  }
  throw lastError;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }

    // Drop the just-sent user message (last item) from history, and drop any
    // leading assistant greeting since Gemini history must start with a user turn.
    const priorHistory = (conversationHistory?.slice(0, -1) || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    while (priorHistory.length && priorHistory[0].role !== 'user') {
      priorHistory.shift();
    }

    const { text } = await generateReply({ history: priorHistory, message });

    res.json({ message: text });
  } catch (error) {
    const status = error?.status;
    console.error('Gemini API Error:', error?.message || error);

    if (status === 503) {
      return res.status(503).json({
        error: 'The assistant is busy right now. Please try again in a few seconds.',
        details: error.message,
      });
    }
    if (status === 429) {
      return res.status(429).json({
        error: 'The assistant has hit its usage limit for now. Please try again shortly.',
        details: error.message,
      });
    }
    res.status(500).json({
      error: 'Failed to process your request',
      details: error?.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 3001;

await loadKnowledge('startup');
watchDataFiles();

app.listen(PORT, () => {
  console.log(`AI Chat server running on http://localhost:${PORT}`);
});
