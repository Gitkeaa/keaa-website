/**
 * THE R2 OBJECT KEY RULE. One definition, used everywhere.
 *
 * Every Cloudinary asset that moves to R2, and every new upload, gets its object key from
 * this function. There is a Java twin in the backend repo at
 * src/main/java/com/keaa/adminapi/media/MediaKey.java. The two MUST agree character for
 * character: if you change one, change the other and re-run the manifest. Do not write a
 * second slugifier anywhere in either codebase.
 *
 * Owner's rule (2026-09-23, amended 2026-09-24). Given a Cloudinary public ID and the file
 * extension, in this order:
 *
 *   1. NFKD-normalise and strip combining marks, so accented letters become their plain
 *      ASCII base letter. "Böhler" -> "bohler", NOT "b-hler".
 *   2. Lowercase.
 *   3. Replace spaces and every character outside [a-z0-9/._-] with a hyphen.
 *   4. Collapse runs of hyphens into one.
 *   5. Trim leading and trailing hyphens, then re-collapse.
 *   6. Append the extension, lowercased.
 *
 * Worked example, the one the owner signed off:
 *   mediaKey('1.Keaa Assets/Keaa products/Ringlock Tower 281-1', 'jpg')
 *     === '1.keaa-assets/keaa-products/ringlock-tower-281-1.jpg'
 *
 * WHY each step is there:
 *   - R2 keys are case sensitive and a space in a key has to be percent-encoded in every URL
 *     that references it, so mixed case and spaces cause bugs that only show up in the
 *     browser. Hence 2 and 3.
 *   - '/', '.', '_' and '-' are KEPT. '/' preserves the folder shape, and the other three
 *     already appear in Cloudinary's own generated IDs (DJI_0082_p2qmld).
 *   - Step 1 runs BEFORE step 3 on purpose. Without it the filter would turn every accented
 *     letter into a hyphen and "Böhler" would read "b-hler".
 *
 * NOTE on step 5: the trim is applied PER PATH SEGMENT, not just to the whole string. A
 * trailing hyphen can hide in the middle of a key, immediately before a slash, and a
 * whole-string trim would leave it there:
 *   'Keaa products /sub'  ->  'keaa-products-/sub'   whole-string trim, hyphen survives
 *                         ->  'keaa-products/sub'    per-segment trim, correct
 * A segment that is nothing but punctuation would trim away to nothing and produce an empty
 * path segment, so it falls back to 'x' rather than emitting '//'.
 */

/** Strip the diacritics off a string without touching the base letters. */
const deaccent = (s) => s.normalize('NFKD').replace(/\p{M}+/gu, '');

/**
 * The R2 object key for a Cloudinary public ID.
 *
 * @param {string} publicId  Cloudinary public ID, folders and all, e.g.
 *                           '1.Keaa Assets/Keaa products/Ringlock Tower 281-1'.
 * @param {string} [extension] File extension, with or without the leading dot. Omit it for
 *                           a key with no extension.
 * @returns {string} The object key, e.g. '1.keaa-assets/keaa-products/ringlock-tower-281-1.jpg'.
 */
export function mediaKey(publicId, extension) {
  const slug = deaccent(String(publicId))
    .toLowerCase()
    .replace(/[^a-z0-9/._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .split('/')
    .map((segment) => {
      const trimmed = segment.replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
      return trimmed === '' ? 'x' : trimmed;
    })
    .join('/');

  if (extension == null || extension === '') return slug;
  const ext = deaccent(String(extension)).toLowerCase().replace(/^\.+/, '').replace(/[^a-z0-9]/g, '');
  return ext ? `${slug}.${ext}` : slug;
}

/**
 * The 6 character collision suffix for a key that is already taken.
 *
 * Owner's decision (2026-09-24): when the computed key already exists, append the last 6
 * characters of the SHA-1 of the ORIGINAL public ID (not of the slug), before the extension.
 * Both the winner and the loser get logged in the migration report.
 *
 * This lives here so the backend twin and the migration script agree on the suffix, but it
 * is async in the browser because SubtleCrypto is. The migration script uses Node's crypto
 * and the backend uses MessageDigest; all three must produce the same 6 characters.
 */
export async function collisionSuffix(originalPublicId) {
  const bytes = new TextEncoder().encode(String(originalPublicId));
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(-6);
}

/** Insert a collision suffix into a key that already has an extension. */
export function withSuffix(key, suffix) {
  const dot = key.lastIndexOf('.');
  const slash = key.lastIndexOf('/');
  if (dot > slash) return `${key.slice(0, dot)}-${suffix}${key.slice(dot)}`;
  return `${key}-${suffix}`;
}

/**
 * The file extension implied by a file's first bytes, or null if nothing matches.
 *
 * Owner's decision (2026-09-24): an upload that arrives with no extension must have its type
 * sniffed from its content rather than guessed from its name, and EVERY such case must be
 * logged. Cloudinary stores "raw" assets with no format recorded, which is how
 * "1.Keaa Assets/Keaa Resumes/file_klapaj" ended up being a PDF that nothing said was a PDF.
 *
 * Never trust a browser-supplied filename or Content-Type for this. Both are attacker
 * controlled on a public upload form; the bytes are the only honest evidence.
 *
 * Pass at least the first 64 bytes. There is a Java twin, MediaKey.extensionFromMagicBytes.
 *
 * @param {Uint8Array} bytes first bytes of the file
 * @returns {string|null} a lowercase extension with no dot, or null if unrecognised
 */
export function extensionFromMagicBytes(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const at = (i) => (i < b.length ? b[i] : -1);
  const ascii = (offset, text) => {
    for (let i = 0; i < text.length; i++) if (at(offset + i) !== text.charCodeAt(i)) return false;
    return true;
  };

  if (ascii(0, '%PDF-')) return 'pdf';
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return 'jpg';
  if (at(0) === 0x89 && ascii(1, 'PNG') && at(4) === 0x0d && at(5) === 0x0a) return 'png';
  if (ascii(0, 'GIF87a') || ascii(0, 'GIF89a')) return 'gif';
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return 'webp';
  if (at(0) === 0x1a && at(1) === 0x45 && at(2) === 0xdf && at(3) === 0xa3) return 'webm';
  if (ascii(0, 'BM')) return 'bmp';
  if (ascii(0, 'II') && at(2) === 0x2a && at(3) === 0x00) return 'tiff';
  if (ascii(0, 'MM') && at(2) === 0x00 && at(3) === 0x2a) return 'tiff';
  // Old Office binary formats (.doc, .xls, .ppt) all share the OLE2 compound file header.
  if (at(0) === 0xd0 && at(1) === 0xcf && at(2) === 0x11 && at(3) === 0xe0) return 'doc';

  // ISO base media: the brand at offset 8 says which flavour.
  if (ascii(4, 'ftyp')) {
    if (ascii(8, 'qt  ')) return 'mov';
    if (ascii(8, 'avif') || ascii(8, 'avis')) return 'avif';
    if (ascii(8, 'heic') || ascii(8, 'heix') || ascii(8, 'hevc') || ascii(8, 'mif1')) return 'heic';
    return 'mp4';
  }

  // Zip container: the first entry's name says whether it is an Office document.
  if (ascii(0, 'PK') && at(2) === 0x03 && at(3) === 0x04) {
    if (ascii(30, 'word/')) return 'docx';
    if (ascii(30, 'xl/')) return 'xlsx';
    if (ascii(30, 'ppt/')) return 'pptx';
    return 'zip';
  }

  // SVG is text, so skip a byte order mark and any leading whitespace before looking.
  let i = at(0) === 0xef && at(1) === 0xbb && at(2) === 0xbf ? 3 : 0;
  while (i < b.length && (at(i) === 0x20 || at(i) === 0x09 || at(i) === 0x0a || at(i) === 0x0d)) i++;
  if (ascii(i, '<?xml') || ascii(i, '<svg')) return 'svg';

  return null;
}
