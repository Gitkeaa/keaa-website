/**
 * Every product line KEAA sells — the catalogue categories plus the enquiry-only lines.
 *
 * This is the taxonomy a LEAD-CAPTURE form should offer. It is deliberately not the same
 * list as the nav: the nav can only link to pages that exist, but a quote request can
 * perfectly well be for a line we manufacture and have not yet published (see
 * enquiryLines.js). Offer only the catalogue categories and you silently stop capturing
 * Safety Products enquiries for a line the top bar advertises on every page.
 *
 * Kept in its own module rather than in categories.js because categories.js is imported by
 * the site chrome, which sits in the entry chunk — this one pulls in products.js, and only
 * the RFQ page needs it.
 */
import { getAllCategories } from './categories.js';
import { enquiryOnlyLines } from './enquiryLines.js';

/** Catalogue categories first (they have pages), then the lines that do not. */
export function getAllProductLines() {
  return [
    ...getAllCategories().map((c) => ({ ...c, hasCatalogue: true })),
    ...enquiryOnlyLines,
  ];
}
