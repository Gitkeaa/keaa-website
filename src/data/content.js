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
    desc: 'Runi Industries supplied livestock housing structures for a regional distribution project.',
  },
];

// Premium photography mapped to each featured project, index-matched to
// featuredProjects above. These are representative stock photos standing in
// for official project photography (per brief) -- swap for real site photos
// once available.
export const featuredProjectImages = [
  img.scaffoldCrane,
  img.factoryMachines,
  img.heroScaffoldTower,
  img.scaffoldFrame,
  img.scaffoldOnBuilding,
  img.cargoContainers,
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
const VID = 'https://res.cloudinary.com/tt2nmm62/video/upload';

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
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDm1CX67h50RL_3WVI0XCz_ARLdLPLGNnMQDX8Qkuqnezk?e=U2f3k3&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';

// Product / brand films shown in Projects & Gallery, below the featured factory
// film. Each opens the SharePoint video in a new tab. Update links here.
export const naymoFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCbf_O95O_0S64CVQFKmFfkATD2IZ_SNyYZTfN9gtONkpg?e=Ww1JNS&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';
export const raasFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCZZvmPtHSfSaEXtfyRk8DdAfOtL-WxCApdaOWCI_eUQxQ?e=zA7o3g&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';


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
    title: 'KEAA India — Company Presentation (Updated)',
    type: 'PPTX',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQAIL-4QLo7cQ4_Zi9Vp46cJAcBzAl8BLrUb5lGjbjtWvvo?e=2bzLyl',
  },
  {
    title: 'KEAA India — Company Presentation',
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
