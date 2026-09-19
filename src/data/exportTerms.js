/**
 * The Export Terms PDF: one place to put its address.
 *
 * WHAT TO DO WHEN THE FILE EXISTS
 * -------------------------------
 * Upload the PDF to Cloudinary, then paste either the full delivery URL or just the public id
 * into EXPORT_TERMS_PDF below. That is the only edit required. Nothing else in the codebase
 * refers to the file, so there is no second place to keep in step.
 *
 *   full URL:  'https://res.cloudinary.com/keaa-assets/image/upload/v123/keaa-export-terms.pdf'
 *   public id: 'keaa-export-terms'   (resolved against the KEAA Cloudinary account below)
 *
 * WHILE IT IS EMPTY
 * -----------------
 * The download button does not render at all. A button that leads to a missing file is worse
 * than no button: it reads as a broken site to a buyer who is deciding whether to trust one.
 *
 * WHAT THE PDF SHOULD CONTAIN
 * ---------------------------
 * Only what the Export page already states. That page is deliberately free of Incoterms, lead
 * times and port of loading, because none of those are published anywhere and inventing a
 * commercial term is a commitment the company never made. If the PDF is to carry them, add
 * them to `company.export` first so the page and the document say the same thing. A PDF that
 * promises terms the page does not is the same problem in a harder-to-correct place.
 */

/** Paste the Cloudinary URL or public id here. Empty means no button is shown. */
export const EXPORT_TERMS_PDF = '';

/** Matches the account used for every other asset on the site. */
const CLOUDINARY_RAW_BASE = 'https://res.cloudinary.com/keaa-assets/image/upload';

/**
 * The address to link to, or null when nothing is configured.
 *
 * Accepts a full URL or a bare public id so whoever uploads the file can paste whichever
 * Cloudinary hands them, rather than having to know which form this expects.
 */
export function exportTermsPdfUrl() {
  const value = EXPORT_TERMS_PDF.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const id = value.replace(/\.pdf$/i, '');
  return `${CLOUDINARY_RAW_BASE}/${encodeURIComponent(id)}.pdf`;
}

/** The filename a browser saves it as, rather than a Cloudinary id. */
export const EXPORT_TERMS_PDF_FILENAME = 'keaa-international-export-terms.pdf';
