/**
 * Stock photography, delivered THROUGH CLOUDINARY rather than straight from Unsplash.
 *
 * The browser used to request these from images.unsplash.com directly, which disclosed
 * every visitor's IP to Unsplash on every page, with no consent and — because images are
 * plain <img> tags in the page — no practical way to gate it. Cloudinary's `image/fetch`
 * mode proxies the remote file: the visitor only ever talks to res.cloudinary.com, which is
 * already the site's image CDN and is named as a processor in the Privacy Policy.
 *
 * It is also faster: `f_auto` serves WebP/AVIF and `q_auto` picks the smallest quality that
 * still looks right, neither of which Unsplash's own resizer does.
 *
 * THE REMOTE URL MUST BE ENCODED. Appended raw, Cloudinary truncates it at the `?` and
 * fetches the full-size original — measured at 3.0 MB versus 52 KB for the encoded form.
 * That is also why the width lives in the Cloudinary transform (`w_`) rather than in an
 * Unsplash `?w=` query: once encoded, a query param is no longer addressable by the
 * resizing helpers below.
 *
 * These are placeholders. Replacing them with real KEAA photography — uploaded to the same
 * Cloudinary account and referenced with `cldImage()` — removes the third party entirely.
 */
const CLOUDINARY_FETCH = 'https://res.cloudinary.com/keaa-assets/image/fetch';

const u = (id, w = 1920) =>
  `${CLOUDINARY_FETCH}/f_auto,q_auto,w_${w},c_limit/${encodeURIComponent(
    `https://images.unsplash.com/${id}`
  )}`;

const cldImage = (id, w = 1920) =>
  `https://res.cloudinary.com/keaa-assets/image/upload/f_auto,q_auto,w_${w},c_limit/${id}`;

/**
 * The site's own photographs, delivered through the same Cloudinary proxy as the stock ones.
 *
 * WHY: public/images holds 8.9 MB of unprocessed camera JPEGs, and they were served raw at
 * full resolution to every device. One team portrait on the contact page was 2.2 MB and
 * another 1.5 MB, which is why that page measured a Largest Contentful Paint of 11.2 seconds
 * on a phone. The pictures are fine; the delivery was not.
 *
 * Cloudinary's fetch mode takes a public URL, re-encodes it to the best format the browser
 * accepts (`f_auto`, so AVIF or WebP instead of JPEG), picks a quality that still looks
 * right (`q_auto`) and caps the width (`c_limit` never upscales). It is the same mechanism
 * already used for the Unsplash photography, so no new service is involved and nothing in
 * the repository changes.
 *
 * The source must be publicly reachable, which is why this always points at the production
 * domain rather than at whatever host is rendering. A preview deploy and a laptop therefore
 * both show the same picture as production, which is the behaviour you want anyway.
 */
const SITE_ORIGIN = 'https://www.keaainternational.com';

export const localPhoto = (path, w = 1200) =>
  `${CLOUDINARY_FETCH}/f_auto,q_auto,w_${w},c_limit/${encodeURIComponent(`${SITE_ORIGIN}${path}`)}`;

/** Widths for a responsive `srcset`; a phone then never downloads a desktop rendition. */
export const localPhotoSrcSet = (path, widths = [320, 480, 640, 960, 1280, 1600]) =>
  widths.map((w) => `${localPhoto(path, w)} ${w}w`).join(', ');

/* Only the photographs a component actually renders. `img` is exported whole and every
   value is a string literal, so an unreferenced entry is not tree-shaken — it ships in the
   bundle and its Cloudinary URL is dead weight. Curated-but-unused candidates were removed;
   add one back here the moment a component names it. */
export const img = {
  // Hero / scaffolding & construction
  heroScaffoldTower: u('photo-1636362556682-11231883c01c'),
  scaffoldFrame: u('photo-1527335988388-b40ee248d80c'),
  scaffoldHighRise: u('photo-1613377511623-27a162a76327'),
  scaffoldMenWorking: u('photo-1542350880924-09225f70e026'),
  scaffoldCrane: u('photo-1591955506264-3f5a6834570a'),
  scaffoldRacks: u('photo-1519143009590-e3800b9df468'),
  scaffoldOnBuilding: u('photo-1555945071-f36c590968bb'),

  // Steel / welding / manufacturing
  metalBuilding: u('photo-1496247749665-49cf5b1022e9'),
  steelFrame: u('photo-1455165814004-1126a7199f9b'),
  factoryInterior: u('photo-1624027492684-327af1fb7559'),
  metalPour: u('photo-1697281679213-fcab27e10ad4'),
  metalSparks: u('photo-1735494033576-9c882e80504c'),
  grinderMetal: u('photo-1738162837369-a2beec3a1d47'),
  weldersFactory: u('photo-1730584474196-b0e8a29303e8'),
  factoryMachines: u('photo-1720036237334-9263cd28c3d4'),
  manOnMachine: u('photo-1697351450667-28cf64813abe'),

  // Shipping / logistics / export
  containersStacked: u('photo-1678182451047-196f22a4143e'),
  allCategoriesShowcase: cldImage('All_categories_r2ttvy'),
  cargoContainers: u('photo-1606964212858-c215029db704'),

  // Livestock / cattle / barn
  cowsInBarn: u('photo-1666878125618-ed3dddd1ab36'),
  cattleHerdBarn: u('photo-1636998980792-63f27ddea4e3'),

  // Timber / wood frame / garden hardware
  woodenFrameSky: u('photo-1741916540147-9be1d2b20d32'),
};

/**
 * Responsive delivery helpers. The URLs above are Cloudinary fetch URLs, which resize on
 * the `w_` transform — so a component can request a right-sized file instead of shipping
 * the full 1920px original into a slot that only renders a few hundred px wide.
 *
 *   atWidth(url, 1024)   -> the same photo delivered at 1024px wide
 *   imgSrcSet(url)       -> a `srcSet` string across common widths, for <img srcset sizes>
 *
 * The pattern is anchored to `,w_` so it can only ever match the transform segment — the
 * encoded remote URL that follows it contains no bare `w_`.
 */
export const atWidth = (url, w) => url.replace(/,w_\d+/, `,w_${w}`);
export const imgSrcSet = (url, widths = [480, 768, 1024, 1280, 1600]) =>
  widths.map((w) => `${atWidth(url, w)} ${w}w`).join(', ');

/**
 * The srcSet for a full-bleed hero photograph.
 *
 * Hero sources are built at a single width (1600px or 1920px depending on which file
 * declares them) and every device downloaded that one rendition, phones included. These are
 * the same Cloudinary transform with a different `w_`, so the only cost is the attribute.
 *
 * Returns undefined when the URL carries no width transform to rewrite, which leaves images
 * this cannot help exactly as they were rather than emitting a srcSet of identical URLs.
 * Used by ui/PageHero and gallery/GalleryHero; both render at 100vw.
 */
export const heroSrcSet = (url) =>
  url && /,w_\d+/.test(url) ? imgSrcSet(url, [640, 960, 1280, 1600, 1920]) : undefined;
