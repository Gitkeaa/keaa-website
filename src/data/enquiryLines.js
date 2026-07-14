/**
 * Product lines KEAA manufactures and quotes for, but which have no catalogue page yet.
 *
 * The site has two product sources, and they are COMPLEMENTARY, not duplicates — deleting
 * either one loses real information:
 *
 *   products.json  355 browsable products with names, subcategories, Cloudinary images
 *                  and real catalogue pages. Scraped from the old site. Carries no size
 *                  ranges, and contains NO personal protective equipment at all.
 *
 *   products.js    60 curated item codes taken from KEAA's own printed catalogues, WITH
 *                  size ranges (KIRS 50-300, KIP-Ü-BD30, ART 325007, joist-hanger blank
 *                  sizes). Only 16 of the 60 also appear in products.json — the other 44
 *                  exist nowhere else.
 *
 * Safety Products (harnesses, helmets, nets, lanyards) is a line KEAA genuinely sells and
 * advertises — it is named in the top bar of every page — but the scrape never captured
 * it and there is no product photography for it yet. So it has item codes and no page.
 *
 * That is what this module names: a line is "enquiry only" when we sell it but cannot yet
 * link to it. The RFQ form must still offer it (or we stop capturing those leads) and the
 * chatbot must still know about it (or it tells customers we do not sell safety gear).
 *
 * When Safety Products gets photography and lands in products.json, delete its slug from
 * ENQUIRY_ONLY_SLUGS and it becomes an ordinary catalogue category automatically.
 *
 * Pure JS on purpose: server.js imports this at runtime under Node, which cannot import a
 * .json module without an import attribute. Do not add a JSON import here.
 */
import { productCategories } from './products.js';

const ENQUIRY_ONLY_SLUGS = ['safety-products'];

/** Lines we sell that have no catalogue page. Shaped like a category, minus the page. */
export const enquiryOnlyLines = productCategories
  .filter((c) => ENQUIRY_ONLY_SLUGS.includes(c.slug))
  .map((c) => ({ ...c, hasCatalogue: false }));
