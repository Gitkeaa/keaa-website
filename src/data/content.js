import { img } from './images.js';
import { cldVideoPoster } from './cloudinary.js';

export const testimonials = [
  {
    quote:
      'KEAA scaffolding systems are of premium quality and durable. Their team support is excellent and responsive on every order.',
    name: 'Ahmed Al Mansoori',
    company: 'Al Mansoori Group, UAE',
  },
  {
    quote:
      'We have been using KEAA formwork accessories for years. Consistent quality and on-time delivery, every single shipment.',
    name: 'Rajesh Kumar',
    company: 'BuildTech Constructors, India',
  },
  {
    quote:
      'KEAA products are reliable, safe and meet all international standards. Highly recommended for export-grade scaffolding.',
    name: 'David Williams',
    company: 'ProBuild Industries, UK',
  },
  {
    quote:
      'Strong and long-lasting products. KEAA is truly a trustworthy partner for our infrastructure projects.',
    name: 'Carlos Mendez',
    company: 'Mendez Construcciones, Mexico',
  },
];

export const featuredProjects = [
  {
    title: 'Metro Rail Project',
    location: 'Mumbai, India',
    category: 'Infrastructure',
    desc: 'Supplied scaffolding and formwork solutions for the metro rail construction.',
  },
  {
    title: 'Industrial Plant Project',
    location: 'Riyadh, Saudi Arabia',
    category: 'Industrial',
    desc: 'Complete scaffolding solution for a large-scale industrial plant shutdown project.',
  },
  {
    title: 'High Rise Building',
    location: 'Dubai, UAE',
    category: 'Commercial',
    desc: 'Formwork and access support for a high-rise commercial building.',
  },
  {
    title: 'Bridge Construction',
    location: 'Doha, Qatar',
    category: 'Infrastructure',
    desc: 'Scaffolding and access solutions for a bridge construction project.',
  },
  {
    title: 'Riverside Residences',
    location: 'Ludhiana, India',
    category: 'Residential',
    desc: 'Ringlock scaffolding deployed across a large multi-tower residential development.',
  },
  {
    title: 'Export Distribution Hub',
    location: 'Eindhoven, Netherlands',
    category: 'International',
    desc: 'KEAA supplied livestock housing structures for a regional distribution project.',
  },
  /*
   * Eight, not six. The gallery lays these out four across, so six left two empty cells on
   * the second row. These two also cover ground the first six missed: livestock housing is
   * a full KEAA product line that appeared nowhere, and Germany/Oman are named export
   * markets in `company.countries` that had no project against them.
   *
   * PLACEHOLDER COPY, like the six above — generic titles and one-line descriptions. Swap
   * in real project records (client, scope, dates) when they are available.
   */
  {
    title: 'Dairy Housing Facility',
    location: 'Muscat, Oman',
    category: 'International',
    desc: 'Cattle housing frames, gates and feed barriers supplied for a commercial dairy unit.',
  },
  {
    title: 'Warehouse Expansion',
    location: 'Hamburg, Germany',
    category: 'Industrial',
    desc: 'Cuplock scaffolding and shoring towers for a phased warehouse expansion.',
  },
];

// Premium photography mapped to each featured project, index-matched to
// featuredProjects above. These are representative stock photos standing in
// for official project photography (per brief) -- swap for real site photos
// once available.
/* Index-aligned with `featuredProjects` above — a card takes the image at its own position,
   so the two arrays must stay the same length and the same order. */
export const featuredProjectImages = [
  img.scaffoldCrane,
  img.factoryMachines,
  img.heroScaffoldTower,
  img.scaffoldFrame,
  img.scaffoldOnBuilding,
  img.cargoContainers,
  img.cattleHerdBarn,
  img.metalBuilding,
];

export const galleryCategories = ['All', 'Factory', 'Products', 'Projects', 'Exhibitions'];

export const galleryItems = [
  { id: 1, category: 'Factory', label: 'CNC pipe cutting line' },
  { id: 2, category: 'Factory', label: 'Forging press shop floor' },
  { id: 3, category: 'Factory', label: 'Robotic welding station' },
  { id: 4, category: 'Factory', label: 'Hot dip galvanizing bath' },
  { id: 5, category: 'Products', label: 'Ringlock scaffolding stack' },
  { id: 6, category: 'Products', label: 'Formwork prop range' },
  { id: 7, category: 'Products', label: 'Cattle shed structure' },
  { id: 8, category: 'Products', label: 'Garden hardware connectors' },
  { id: 9, category: 'Projects', label: 'Metro rail scaffolding deployment' },
  { id: 10, category: 'Projects', label: 'High rise formwork installation' },
  { id: 11, category: 'Exhibitions', label: 'bauma trade fair booth' },
  { id: 12, category: 'Exhibitions', label: 'Excon India exhibition stand' },
];

// Premium curated photography mapped to each gallery tile (see src/data/images.js).
// Swap any entry for an official KEAA photo later -- the keys (tile ids) won't change.
export const galleryImages = {
  1: img.metalSparks,
  2: img.factoryMachines,
  3: img.weldersFactory,
  4: img.metalPour,
  5: img.heroScaffoldTower,
  6: img.steelFrame,
  7: img.cattleHerdBarn,
  8: img.woodenFrameBrown,
  9: img.scaffoldCrane,
  10: img.scaffoldHighRise,
  11: img.scaffoldWorker2,
  12: img.scaffoldLadder,
};

/**
 * The hero background films, delivered from Cloudinary — nothing is stored in the repo.
 *
 * Why not the SharePoint links (`droneFilmUrl` below)? Each is a *share page*, not a file:
 * it answers `text/html`, an anonymous visitor is bounced to login.microsoftonline.com,
 * and it sends `X-Frame-Options: SAMEORIGIN`. So it can be neither played by <video> nor
 * framed. Cloudinary's delivery URL, by contrast, returns real `video/mp4` bytes with
 * `Access-Control-Allow-Origin: *` and range support — exactly what <video> needs.
 *
 * Fields:
 *   src    — Cloudinary delivery URL. A film that 404s (deleted / renamed) drops out and
 *            the hero falls back to the photograph, so a stale id degrades quietly.
 *   poster — a still pulled from the film by Cloudinary (`so_N` seconds in, past any logo),
 *            so nothing — not even the poster — is stored in the repo.
 *   clip   — [start, end] in seconds, trimmed at playback so a logo card at either end
 *            never flashes in the loop; null loops the whole file.
 *
 * `src` points at the *original* upload because the account blocks *video* transcodes
 * ("Strict transformations"), so `.mp4` resize/optimise URLs 404. Image output from a
 * video is allowed, though, which is why the posters can come from the CDN. To also shrink
 * the video: Cloudinary → Settings → Security → turn OFF "Strict transformations", then
 * use e.g. `.../upload/so_5,eo_67,w_960,q_auto,f_auto/hero1_a0hnen.mp4`.
 */
const VID = 'https://res.cloudinary.com/keaa-assets/video/upload';

export const heroFilms = [
  {
    id: 'film',
    src: `${VID}/hero1_a0hnen.mp4`,
    poster: cldVideoPoster('hero1_a0hnen', { so: 6 }), // past the 0–4s logo card
    clip: [5, 67], // white logo card 0–4s; footage runs to the end
    label: 'the aerial film',
    alt: 'Aerial view of the KEAA International manufacturing plant in Ludhiana',
  },
  {
    id: 'rass',
    src: `${VID}/Rass_wixfl0.mp4`,
    poster: cldVideoPoster('Rass_wixfl0', { so: 8 }),
    clip: null, // no logo bookends; loops end to end
    label: 'the Raass Industries film',
    alt: 'Aerial film of the Raass Industries site',
  },
  {
    id: 'highlight',
    src: `${VID}/My_Video-highlight_sk4vj4.mp4`,
    poster: cldVideoPoster('My_Video-highlight_sk4vj4', { so: 3 }),
    clip: null, // 15s highlight, no bookends
    label: 'the highlights film',
    alt: 'Highlights film of KEAA International’s manufacturing and projects',
  },
];

// KEAA aerial / drone film (SharePoint). Single source of truth for the share
// link — used by the Home hero and the Projects & Gallery page. SharePoint can't
// be embedded inline, so the play buttons open it in a new browser tab. The link
// must be shared as "Anyone with the link — view".
export const droneFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCQ7svJva9fSY0zDyJRkUK6AdswuPrVXTGZfV_wV2Idkzg?e=GYIsMu&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';

// Product / brand films shown in Projects & Gallery, below the featured factory
// film. Each opens the SharePoint video in a new tab. Update links here.
export const naymoFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCbf_O95O_0S64CVQFKmFfkATD2IZ_SNyYZTfN9gtONkpg?e=Ww1JNS&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';
export const raasFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCZZvmPtHSfSaEXtfyRk8DdAfOtL-WxCApdaOWCI_eUQxQ?e=zA7o3g&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';

// More gallery films (SharePoint / OneDrive links) shown in Projects & Gallery.
// Same rule as droneFilmUrl: each link MUST be shared as "Anyone with the link — view",
// otherwise a visitor is bounced to a Microsoft login. `title` is a placeholder — rename
// each to the real film name. Thumbnails are assigned in ProjectsGallery.jsx (stock
// stand-ins until a real frame from each video is captured).
export const galleryFilms = [
  { title: 'KEAA Film 1', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDUvijhFQmYRYTqtpfMwmYgAR7gMFrR56_jEP0gK9OQO8s?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=3CCJeR' },
  { title: 'KEAA Film 2', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDpMA2oFHeISp4NnJ8aiSD2AXnOajm00P_SySXHcJqfS4A?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Gz6NF3' },
  { title: 'KEAA Film 3', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBPVOAZIIqlSrHx3pw5OPOmAcaObPrFg8FJGb-pQHaUTmo?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=fxoXmB' },
  { title: 'KEAA Film 4', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCzF23qVsfRQ7nEjGbpzA51AQIIm6ZcP8SUMMqUaDBwJDA?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=8n1iif' },
  { title: 'KEAA Film 5', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCmz74TI-p6QIYC-rDsgIM3AS7chkyhGbROA2DQ6amtKx4?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=f7Ct4N' },
  { title: 'KEAA Film 6', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQB8I3pZpEOIQa4MjWjyOR0NAQRfqHJNANVMgDJN6h4UQLA?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=LQQmaT' },
  { title: 'KEAA Film 7', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBtDKBwppqTTqdqeJPOrpQlAYem3YYLlx-a9ltofiCVwqc?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Kvn0v2' },
  { title: 'KEAA Film 8', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQALUlQ0F9trQ7fLyqiUhFh-ASeba6tf2A0pYnyiOGm4CjA?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=GjHflX' },
  { title: 'KEAA Film 9', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQAxfJWH0NmTR53KM8Qh5t7sAS2-md8DjT_lXOjiVsSOXDI?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=0hhJP4' },
  { title: 'KEAA Film 10', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCcIJEM19fDSZTMEQRYpD1OAWQxXD2fs4yFP4rZ58QS3-8?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=qvKxFU' },
  { title: 'KEAA Film 11', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQD5o_ZH-944TIM2dQEoLNv-Acrz4L1Sm-5m8jVkaBQjHrY?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=m0nIgc' },
  { title: 'KEAA Film 12', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDCeJ16F_C2R7dXl06LHx3MAbD8NroX7s7CEc92AsOY3ok?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Gugnk1' },
  { title: 'KEAA Film 13', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDpC1pWuxoeQpTINMSg5IIPATc57s2DPZ82vMoqJtxYt5s?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Jyb0Mt' },
  { title: 'KEAA Film 14', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBlRYpPKOp0T54xc4dGDaLiAVP57dpQ07O4nVviXMpx6xE?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=WSvNak' },
  { title: 'KEAA Film 15', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQA7FjCAkPPPTbQnAyjMI2t3AXDGcckzJgfEylVc8T4xQuI?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=H8Jo7u' },
  { title: 'KEAA Film 16', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDtuHDEVIvKTobS-4JyeNwbAb7So2bZzfsfetV7itnjv3k?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=YzEWYV' },
  { title: 'KEAA Film 17', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCoKMUv3W9ZR46RUI8lDQZkAUPcxcqnz-StKjtmip0JkRE?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=SPM0z6' },
  { title: 'KEAA Film 18', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQAlrIZ1O9rIQrQrmHVofRH8AXIjgWItFexlx44UiL5TLIA?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=EtgiXY' },
  { title: 'KEAA Film 19', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCJRqwuzfOPTIRGkXHPGMwgAQJIeV25Fr_YaC-GR35ATIg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=NKjq6s' },
  { title: 'KEAA Film 20', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBnDfY5uJhUSpdr577HKz2GATTcPzV8y9NStK_15Q847KI?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=mp5z7C' },
  { title: 'KEAA Film 21', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBnfS_zORSQR4js3iJZNTHPAfH3hC1CYRLlUdH8itZrcxY?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=aMP9Na' },
  { title: 'KEAA Film 22', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDSy7v1gvW9Rq3ZZw2oQnY-AaGUz0h6WIW4exhnCcBlNQg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=rdmye9' },
  { title: 'KEAA Film 23', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDZoPWoSL7GTZxBOxkZJiZCAX52w4xtTnkU6BmPIOfIohE?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=2XIvnE' },
  { title: 'KEAA Film 24', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQB-3dNyAK4qTpd3jVlJThlfASxVB5oqTe1fdutG523aprk?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Hnd85C' },
  { title: 'KEAA Film 25', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQA822OBHs_mTpreT7XzvVYjAcriWcVXkG9o4kEZF7XiEc8?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=dhSNaM' },
  { title: 'KEAA Film 26', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCKAMQSFNTNTbjAlQV76_73AVBWQNlDQ3FEcoWAYyyyVBw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=9flQU8' },
  { title: 'KEAA Film 27', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBzkf-QttJqTbGM8IB41fejAc-og3V9j2UkdLW6TnkxmLg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=xftVb5' },
  { title: 'KEAA Film 28', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQClAo1uyR8dQLkFdUxO3EOrAZi_87M7eK0UVOSvpcCoIRw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=HN1CTx' },
  { title: 'KEAA Film 29', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDunyaYbM7OR7Mclz_ljf96AaKUkjentCMLr3ebyaSZe8s?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=9Shz7a' },
  { title: 'KEAA Film 30', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQAWL-pdUIZgQ7dS0IhZ8YkrAbsn8bT239M5x3JMaHD36Wk?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=quzJzX' },
  { title: 'KEAA Film 31', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDy4YYGsT5gRZe3WdWU17WgAat_4-PUzVWoBwDbPsCoyJY?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=UVrERH' },
  { title: 'KEAA Film 32', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDxb-vaEAYsRokr_ByrdoexAcLgT0niCo2rPLsXcrwiRMM?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=eTTAnb' },
  { title: 'KEAA Film 33', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQD228OPJLhvTaa8LtWSbfTRARInLqQHntEKTJkFyabSvLo?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=DRuFcD' },
  { title: 'KEAA Film 34', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDtCuzIrwHnRaJ0jiiQyQbWAazWxoFK6Fke4GAykR9VW6E?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=n045fk' },
  { title: 'KEAA Film 35', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBmD7XSDSGqT6A7m-KljZUHAYbuSccfWEkztiASuZMN3N0?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=BUugnq' },
  { title: 'KEAA Film 36', url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBeolJjUBBdSIapYa4p3lnxATR9I9zpTKC0PoUNUZReong?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=dCbQEh' },
];


// Career openings. To open or close a role, just switch its `status`:
//   'open'   → "Apply Now" opens the application form
//   'closed' → button shows "Applications Closed" (not clickable)
// Add, remove or edit positions freely — the Careers page updates automatically.
export const careers = [
  {
    title: 'Sales Executive – International Business',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'open',
    description:
      "Drive global business growth by identifying new markets, managing international client relationships, preparing quotations, and coordinating export sales. The role requires excellent communication skills, customer-focused thinking, and a passion for expanding KEAA's worldwide presence.",
  },
  {
    title: 'Production Engineer',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'open',
    description:
      'Oversee daily manufacturing operations, optimize production efficiency, ensure quality standards, and coordinate with cross-functional teams to deliver products safely, efficiently, and on schedule. Experience in engineering manufacturing environments is preferred.',
  },
  {
    title: 'Quality Control Inspector',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'closed',
    description:
      "Inspect raw materials, monitor production processes, and perform quality checks to ensure every product meets KEAA's international quality standards, technical specifications, and customer expectations before dispatch.",
  },
  {
    title: 'Digital Marketing Executive',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'closed',
    description:
      "Develop and execute digital marketing campaigns, manage website content, improve SEO performance, create engaging social media strategies, and strengthen KEAA's global online presence through data-driven marketing initiatives.",
  },
];

// Downloadable resources (SharePoint PowerPoint files). `url` opens the file in
// a new tab where visitors can view and download it. NOTE: each link must be
// shared as "Anyone with the link — view" so public visitors can open it.
export const downloadResources = [
  {
    // Brand logos, self-hosted from /public/downloads. A grouped entry: the Downloads page
    // shows one "Logos" row that expands to the files below. Each is a self-contained SVG
    // (generated from the site's own logo artwork, Satoshi wordmark embedded) served
    // same-origin with the `download` attribute, so a click saves the file directly.
    // If official master logo files arrive, drop them into /public/downloads and update
    // `url`/`filename` here.
    title: 'KEAA Brand Logos',
    type: 'Logos',
    files: [
      { label: 'KEAA Logo (Primary)', url: '/downloads/keaa-logo-primary.svg', filename: 'keaa-logo-primary.svg' },
      { label: 'KEAA Logo (White)', url: '/downloads/keaa-logo-white.svg', filename: 'keaa-logo-white.svg' },
      { label: 'KEAA Logo (Icon)', url: '/downloads/keaa-logo-icon.svg', filename: 'keaa-logo-icon.svg' },
    ],
  },
  {
    title: 'Scaffolding & Formworks Catalogue',
    type: 'PDF',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/web_support_keaa-international_net/IQDrlCW9_78jTbaxSmZFAXVFAUp5tsZGw32rbgfqVylfnaA?e=iznXeZ',
  },
  {
    title: 'Livestock Housing Solutions Catalogue',
    type: 'PDF',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/web_support_keaa-international_net/IQAE1nDX1LiORZ7UEr7sRjleARl-qf2YieMmzVUTsdis4qI?e=s1QADa',
  },
  {
    title: 'Wood Connectors / Garden Hardware Catalogue',
    type: 'PDF',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/web_support_keaa-international_net/IQDZg2UkpJN-RaIAwbR0rsxeATkSWko0PsjqrFR1SWLZMWc?e=DPhLYa',
  },
  {
    title: 'KEAA India: Company Presentation (Updated)',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQAIL-4QLo7cQ4_Zi9Vp46cJAcBzAl8BLrUb5lGjbjtWvvo?e=2bzLyl',
  },
  {
    title: 'KEAA India: Company Presentation',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQDE-onHfdcgQrsvQ8CrqWjbATZUjIc-dhP31racQeN6Eg8?e=GcPDin',
  },
  {
    title: 'Formwork & Props',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQDIHriNJfelTr27f-FJ-fNdAThwVaDF_58EI64tByuOxWQ?e=yNP2Fh',
  },
  {
    title: 'Aluminium Range (Ref. 24391)',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQABidWLeTDuQ4y3JEJq7oYdAc3rv5FxPwsPmlQ5AsZ86oo?e=yxEgG4',
  },
  {
    title: 'Aluminium Products',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQBJPEmZWyIKS6hXH4-oJbg_AdfQJRxbQbr3BTejuSrzcWU?e=4yPKTu',
  },
  {
    title: 'Threading Machine',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQDRbWwpOAsZT6FIsdhjMRaNAe8K7mr8BiCaJy4NIfOvuUc?e=nWb62I',
  },
  {
    title: 'Sample Products',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQCfRsZaLLVRQbMDBC5fSDpdAeg17vN53maxhYt27ZRn6Q4?e=rdq3jF',
  },
  {
    title: 'Tobler Range (Art. 45079652256030)',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQD2_tC2P9tqSoDLZdIz8A5cARy5fKPgzEX_MVp7o9jxiBw?e=Auh98E',
  },
];
