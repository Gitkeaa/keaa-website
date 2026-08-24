import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Exports the site's own content as one JSON file for the Spring Boot chat assistant.
 *
 * The assistant used to read src/data/* directly, because it ran in this same Node
 * process (the old server.js). Now it runs in the Java backend, which cannot import ES
 * modules, so the same data is written out as JSON and shipped in the backend's
 * resources instead.
 *
 * Run this whenever site content changes, then copy the output into the backend and
 * restart it:
 *   npm run export:chat-kb
 *
 * Pass a destination to write straight into the backend:
 *   node scripts/export-chat-kb.mjs ../keaa-backend/src/main/resources/knowledge-base-data.json
 */
const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'src', 'data');
const OUT = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(ROOT, 'knowledge-base-data.json');

// pathToFileURL, not a bare path: on Windows an absolute path like C:\... is read as a
// URL scheme and import() rejects it (ERR_UNSUPPORTED_ESM_URL_SCHEME).
const dataModule = (file) => import(pathToFileURL(path.join(DATA_DIR, file)).href);

const [companyMod, productsMod, contentMod, enquiryMod, faqsMod] = await Promise.all([
  dataModule('company.js'),
  dataModule('products.js'),
  dataModule('content.js'),
  dataModule('enquiryLines.js'),
  dataModule('faqs.js'),
]);

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

writeFileSync(OUT, JSON.stringify(facts, null, 2), 'utf8');
console.log(`Chat knowledge base written to ${OUT} (${catalogue.length} products)`);
