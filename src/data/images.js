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

export const img = {
  // Hero / scaffolding & construction
  heroScaffoldTower: u('photo-1636362556682-11231883c01c'),
  scaffoldWorm: u('photo-1556886283-a3944a060a52'),
  scaffoldFrame: u('photo-1527335988388-b40ee248d80c'),
  scaffoldHighRise: u('photo-1613377511623-27a162a76327'),
  scaffoldMenWorking: u('photo-1542350880924-09225f70e026'),
  scaffoldWorker1: u('photo-1603239564387-c5b5ea6f635e'),
  scaffoldWorker2: u('photo-1649320316177-775fe2d67ca3'),
  scaffoldWorker3: u('photo-1636362006544-22445420703f'),
  scaffoldLadder: u('photo-1626471671222-9d89fe4c2668'),
  scaffoldBuildingSite: u('photo-1508450859948-4e04fabaa4ea'),
  scaffoldCrane: u('photo-1591955506264-3f5a6834570a'),
  scaffoldRacks: u('photo-1519143009590-e3800b9df468'),
  scaffoldOnBuilding: u('photo-1555945071-f36c590968bb'),

  // Steel / welding / manufacturing
  metalBuilding: u('photo-1496247749665-49cf5b1022e9'),
  steelFrame: u('photo-1455165814004-1126a7199f9b'),
  factoryInterior: u('photo-1624027492684-327af1fb7559'),
  metalPour: u('photo-1697281679213-fcab27e10ad4'),
  welderFactory: u('photo-1714504904786-b6732390b206'),
  metalSparks: u('photo-1735494033576-9c882e80504c'),
  grinderMetal: u('photo-1738162837369-a2beec3a1d47'),
  weldersFactory: u('photo-1730584474196-b0e8a29303e8'),
  factoryMachines: u('photo-1720036237334-9263cd28c3d4'),
  manOnMachine: u('photo-1697351450667-28cf64813abe'),
  powerTool: u('photo-1600684249816-38cdfcf95c17'),
  personTool: u('photo-1504917595217-d4dc5ebe6122'),

  // Shipping / logistics / export
  containersStacked: u('photo-1678182451047-196f22a4143e'),
  cargoContainers: u('photo-1606964212858-c215029db704'),
  cargoShip: u('photo-1655164709639-95035bff7ea8'),
  containerYard: u('photo-1493946740644-2d8a1f1a6aff'),
  intermodalContainers: u('photo-1601897690942-bcacbad33e55'),

  // Livestock / cattle / barn
  cowsInBarn: u('photo-1666878125618-ed3dddd1ab36'),
  cattleHerdBarn: u('photo-1636998980792-63f27ddea4e3'),
  cattleGrazing: u('photo-1730067391488-9d39399e2b29'),
  cattleCloseup: u('photo-1547158732-1de2d876e497'),

  // Timber / wood frame / garden hardware
  woodenFrameSky: u('photo-1741916540147-9be1d2b20d32'),
  woodenFrameBrown: u('photo-1563874093519-ca5eda5cd776'),
  woodenStructure: u('photo-1634255970497-78ffb2b08ae8'),
  woodenFenceSky: u('photo-1621673610286-a6b5e788ab82'),
  woodenStructureSky: u('photo-1676802540678-2dceb1820113'),
};

/**
 * Responsive delivery helpers. The URLs above are Cloudinary fetch URLs, which resize on
 * the `w_` transform — so a component can request a right-sized file instead of shipping
 * the full 1920px original into a slot that only renders a few hundred px wide.
 *
 *   imgSized(url, 1024)  -> the same photo delivered at 1024px wide
 *   imgSrcSet(url)       -> a `srcSet` string across common widths, for <img srcset sizes>
 *
 * The pattern is anchored to `,w_` so it can only ever match the transform segment — the
 * encoded remote URL that follows it contains no bare `w_`.
 */
export const atWidth = (url, w) => url.replace(/,w_\d+/, `,w_${w}`);
export const imgSized = (url, w) => atWidth(url, w);
export const imgSrcSet = (url, widths = [480, 768, 1024, 1280, 1600]) =>
  widths.map((w) => `${atWidth(url, w)} ${w}w`).join(', ');
