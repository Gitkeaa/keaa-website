import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { watch } from 'node:fs';
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
6. Use the KNOWLEDGE BASE below as your source of truth for products, item codes, projects, certifications, careers and resources. Do not invent product codes, prices or specs that are not listed.
7. FORMATTING: Reply in clean, well-structured Markdown so it is easy to scan. Start with a one-line summary sentence. For any list of 3+ items, use hyphen "-" bullet points (each on its own line), and put a blank line before the list. Use **bold** only for key terms or category names. Keep paragraphs to 1-2 sentences. Never cram a list into a single paragraph.`;

// Turn the structured site data into a compact text knowledge base for the model.
function buildKnowledgeBase(data) {
  const {
    company,
    leadership,
    countries,
    productCategories,
    bestSellers,
    testimonials,
    featuredProjects,
    careers,
    marketplaces,
    downloadResources,
  } = data;

  const products = productCategories
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
      return `- ${cat.name}: ${cat.short}\n    Highlights: ${cat.bullets.join(', ')}\n    Standard: ${cat.standard}\n${families}`;
    })
    .join('\n\n');

  const list = (arr, fn) => arr.map(fn).join('\n');

  return `
=== KEAA KNOWLEDGE BASE (authoritative — answer from this) ===

PRODUCT CATALOGUE:
${products}

BEST SELLERS:
${list(bestSellers, (b) => `- ${b.name} (${b.category})`)}

CERTIFICATIONS:
${list(company.certifications, (c) => `- ${c.name} (${c.body}): ${c.note}`)}

FEATURED PROJECTS:
${list(featuredProjects, (p) => `- ${p.title} — ${p.location} (${p.category}): ${p.desc}`)}

EXPORT COUNTRIES: ${countries.map((c) => c.name).join(', ')}

LEADERSHIP TEAM:
${list(leadership, (l) => `- ${l.name} — ${l.role}`)}

OPEN CAREERS:
${list(careers, (c) => `- ${c.title} — ${c.location} (${c.type})`)}

WHERE TO BUY (online marketplaces):
${list(marketplaces, (m) => `- ${m.name}: ${m.desc}`)}

DOWNLOADABLE RESOURCES:
${list(downloadResources, (d) => `- ${d.title} (${d.type}, ${d.size})`)}

CUSTOMER TESTIMONIALS:
${list(testimonials, (t) => `- "${t.quote}" — ${t.name}, ${t.company}`)}
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
    const [companyMod, productsMod, contentMod] = await Promise.all([
      import('./src/data/company.js' + bust),
      import('./src/data/products.js' + bust),
      import('./src/data/content.js' + bust),
    ]);

    const knowledge = buildKnowledgeBase({
      company: companyMod.company,
      leadership: companyMod.leadership,
      countries: companyMod.countries,
      productCategories: productsMod.productCategories,
      bestSellers: productsMod.bestSellers,
      testimonials: contentMod.testimonials,
      featuredProjects: contentMod.featuredProjects,
      careers: contentMod.careers,
      marketplaces: contentMod.marketplaces,
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
      if (!filename || !filename.endsWith('.js')) return;
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
