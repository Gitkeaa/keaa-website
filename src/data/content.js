import { img } from './images.js';
import { cldVideo, cldVideoPoster } from './cloudinary.js';

/**
 * Customer testimonials, shown on the FAQ page ("What Our Customers Say").
 *
 * `rating` is out of 5 and drives the star row. It is a field rather than a hard-coded five
 * so a future testimonial can carry an honest score without touching the component.
 */
export const testimonials = [
  // {
  //   quote:
  //     'KEAA scaffolding systems are of premium quality and durable. Their team support is excellent and responsive on every order.',
  //   name: 'Ahmed Al Mansoori',
  //   company: 'Al Mansoori Group, UAE',
  //   rating: 5,
  // },
  {
    quote:
      'We have been using KEAA formwork accessories for years. Consistent quality and on-time delivery, every single shipment.',
    name: 'Rajesh Kumar',
    company: 'BuildTech Constructors, India',
    rating: 5,
  },
  {
    quote:
      'KEAA products are reliable, safe and meet all international standards. Highly recommended for export-grade scaffolding.',
    name: 'David Williams',
    company: 'ProBuild Industries, UK',
    rating: 5,
  },
  {
    quote:
      'Strong and long-lasting products. KEAA is truly a trustworthy partner for our infrastructure projects.',
    name: 'Carlos Mendez',
    company: 'Mendez Construcciones, Mexico',
    rating: 5,
  },
];

/**
 * Application areas: the kinds of work KEAA equipment is built for.
 *
 * WHAT THIS REPLACED, AND WHY
 * ---------------------------
 * This list used to hold eight named "featured projects" with cities, clients and scope
 * ("Riverside Residences, Ludhiana", "Export Distribution Hub, Eindhoven"). None of them
 * were real. They were placeholder copy waiting on genuine project records that never
 * arrived, and a named project with a location reads to a buyer as a reference they could
 * check. Invented references are the kind of claim that costs trust when someone does check,
 * and search engines increasingly treat them as a quality signal too.
 *
 * So the entries are now sectors rather than projects. Every one is a true statement about
 * what the products are for, and none names a client, a city or a job.
 *
 * GOING BACK TO REAL PROJECTS
 * ---------------------------
 * The shape is unchanged on purpose, so this is a data edit and nothing else. Add `location`
 * back to an entry and the card renders it again; ProjectCard shows the line only when it is
 * present. Then change the two section headings back from "Applications" to "Featured
 * Projects" in pages/Home.jsx and pages/ProjectsGallery.jsx.
 *
 * Keep this array the same length as `featuredProjectImages` below: a card takes the image
 * at its own index.
 */
export const featuredProjects = [
  {
    title: 'High-Rise Buildings',
    category: 'Access scaffolding',
    desc: 'Facade access and edge protection at height, where a system scaffold has to repeat the same geometry floor after floor.',
  },
  {
    title: 'Commercial Construction',
    category: 'Formwork and access',
    desc: 'Slab and wall casting on concrete frames, with props, fork heads and tripods carrying the soffit until the pour can carry itself.',
  },
  {
    title: 'Industrial Facilities',
    category: 'Maintenance and shutdowns',
    desc: 'Plant maintenance and shutdown work, where the structure is irregular and the bracing has to run where the job needs it.',
  },
  {
    title: 'Infrastructure Projects',
    category: 'Shoring and access',
    desc: 'Bridges, tunnels and civil works, carried on load bearing shoring towers rather than on props alone.',
  },
  {
    title: 'Large-Scale Construction',
    category: 'System scaffolding',
    desc: 'Long programmes where components are struck, stored and reused across phases, so interchangeability matters more than the first purchase price.',
  },
  {
    title: 'Livestock Housing',
    category: 'Agricultural buildings',
    desc: 'Cattle, sheep, pig and horse housing, where galvanized steel has to survive slurry and ammonia without developing an edge an animal can catch.',
  },
  {
    title: 'Timber Structures',
    category: 'Garden and fencing',
    desc: 'Decking, pergolas, carports and fencing, where the connector and the ground anchor decide how long the timber lasts.',
  },
  {
    title: 'Export and Distribution',
    category: 'Supply',
    desc: 'Dealers, builders merchants and rental fleets restocking a consistent range in container volumes.',
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

/* The gallery's own categories, photos and alt text live in src/data/gallery.js, keyed to the
   real Cloudinary uploads. An earlier placeholder set (12 invented tiles mapped to stock
   photography) used to sit here; it was never read once the real gallery landed. */

/**
 * The single homepage hero background film — Lely-style: one ambient loop behind the copy,
 * no slideshow. Delivered from Cloudinary; nothing is stored in the repo.
 *
 * TO ADD THE FILM: upload the clip to Cloudinary, then set HERO_VIDEO_ID to its public_id.
 * Leave it null and the hero simply shows the photograph (no film, no dots), so the site is
 * never broken while the video is still being made in Canva.
 *
 * Why Cloudinary and not the SharePoint links (`droneFilmUrl` below)? Each SharePoint link is
 * a *share page*, not a file: it answers `text/html`, bounces an anonymous visitor to
 * login.microsoftonline.com, and sends `X-Frame-Options: SAMEORIGIN`, so it can be neither
 * played by <video> nor framed. Cloudinary returns real `video/mp4` bytes with
 * `Access-Control-Allow-Origin: *` and range support — exactly what <video> needs.
 *
 * DELIVERY is progressive + web-optimised via cldVideo(): `q_auto,f_auto` shrinks and
 * re-encodes the clip and Cloudinary serves it faststart, so even a 45s film starts instantly
 * and a phone streams only the bytes it plays. Desktop gets w_1920; phones get a genuinely
 * smaller w_720 of the same clip (see `srcMobile`, chosen in HomeHeroBrandTest).
 *
 * REQUIRES "Strict transformations" OFF in Cloudinary (Settings → Security). Until it is off,
 * video transform URLs 404 — set HERO_VIDEO_RAW = true to serve the untouched upload, but then
 * the clip MUST be exported small (720p, ~8 MB, faststart) since Cloudinary won't shrink it.
 * Once Strict is off, set this back to false to unlock the mobile rendition.
 */
const HERO_VIDEO_ID = 'hero-keaa-cinematic_takmbk'; // Cloudinary public_id (Strict transformations is OFF)
const HERO_VIDEO_RAW = false; // true ONLY while "Strict transformations" is still ON

export const heroFilms = HERO_VIDEO_ID
  ? [
      {
        id: 'hero',
        src: cldVideo(HERO_VIDEO_ID, { w: 1920, raw: HERO_VIDEO_RAW }),
        srcMobile: cldVideo(HERO_VIDEO_ID, { w: 720, raw: HERO_VIDEO_RAW }),
        poster: cldVideoPoster(HERO_VIDEO_ID, { so: 1, w: 1280 }),
        /**
         * The poster at three widths. It is the hero's Largest Contentful Paint element now
         * that the film no longer is, so a phone pulling the 1280px still was paying for
         * pixels it cannot show. See the note in HomeHeroBrandTest.
         */
        posterSrcSet: [640, 960, 1280, 1920]
          .map((w) => `${cldVideoPoster(HERO_VIDEO_ID, { so: 1, w })} ${w}w`)
          .join(', '),
        clip: null, // a single loop-ready clip; no logo bookends to trim
        label: 'the KEAA film',
        alt: 'KEAA International manufacturing and projects film',
      },
    ]
  : [];

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
/**
 * Open roles.
 *
 * ALL POSITIONS ARE CURRENTLY CLOSED, deliberately and temporarily. The entries are kept so
 * a role can be reopened by changing two fields rather than retyping it:
 *
 *   status: 'closed' -> 'open'
 *   postedDate: ''   -> the real date the role opened, as 'YYYY-MM-DD'
 *
 * Both matter. `status` drives the badge, the Apply button and whether the role is
 * published as structured data at all; only open roles are. `postedDate` fills datePosted
 * in that markup, which Google asks for and which must never be guessed: a wrong date claims
 * a vacancy has been open longer or shorter than it has.
 */
export const careers = [
  {
    title: 'Sales Executive – International Business',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'closed',
    /* ISO date, e.g. '2026-10-01'. Fill this in when the role reopens: the JobPosting
       markup uses it, and Google wants it. Left empty rather than invented. */
    postedDate: '',
    description:
      "Drive global business growth by identifying new markets, managing international client relationships, preparing quotations, and coordinating export sales. The role requires excellent communication skills, customer-focused thinking, and a passion for expanding KEAA's worldwide presence.",
  },
  {
    title: 'Production Engineer',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'closed',
    /* ISO date, e.g. '2026-10-01'. Fill this in when the role reopens: the JobPosting
       markup uses it, and Google wants it. Left empty rather than invented. */
    postedDate: '',
    description:
      'Oversee daily manufacturing operations, optimize production efficiency, ensure quality standards, and coordinate with cross-functional teams to deliver products safely, efficiently, and on schedule. Experience in engineering manufacturing environments is preferred.',
  },
  {
    title: 'Quality Control Inspector',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'closed',
    /* ISO date, e.g. '2026-10-01'. Fill this in when the role reopens: the JobPosting
       markup uses it, and Google wants it. Left empty rather than invented. */
    postedDate: '',
    description:
      "Inspect raw materials, monitor production processes, and perform quality checks to ensure every product meets KEAA's international quality standards, technical specifications, and customer expectations before dispatch.",
  },
  {
    title: 'Digital Marketing Executive',
    location: 'Ludhiana, India',
    type: 'Full Time',
    status: 'closed',
    /* ISO date, e.g. '2026-10-01'. Fill this in when the role reopens: the JobPosting
       markup uses it, and Google wants it. Left empty rather than invented. */
    postedDate: '',
    description:
      "Develop and execute digital marketing campaigns, manage website content, improve SEO performance, create engaging social media strategies, and strengthen KEAA's global online presence through data-driven marketing initiatives.",
  },
];

/* ------------------------------------------------------------------ *
 * Downloadable resources
 *
 * Two audiences, one shape. `catalogueDownloads` is everything the PUBLIC site offers —
 * product catalogues only. Everything else (brand artwork, company and product decks) is
 * internal and reachable solely from the portal's Resource Library, which serves
 * `portalDownloads` (catalogues + internal) to every signed-in role.
 *
 * Entry shape: `url` opens the file in a new tab, where it can be viewed and downloaded.
 * A `files` array instead makes it a GROUPED entry — one labelled row that expands to the
 * individual files, each saved directly via the `download` attribute.
 *
 * NOTE: every SharePoint link below must be shared as "Anyone with the link — view", or the
 * public catalogues 403 for visitors.
 * ------------------------------------------------------------------ */

/** Public: the product catalogues shown on the Downloads Center and in the mega-menu. */
export const catalogueDownloads = [
  {
    title: 'Scaffolding & Formworks Catalogue',
    type: 'PDF',
    group: 'Catalogues',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/web_support_keaa-international_net/IQC8Oazgx8WvSripzThu7VdEAWAPPyoaKGWJ9Em2dFVw_jc?e=TL69zt',
  },
  {
    title: 'Livestock Housing Solutions Catalogue',
    type: 'PDF',
    group: 'Catalogues',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/web_support_keaa-international_net/IQAE1nDX1LiORZ7UEr7sRjleARl-qf2YieMmzVUTsdis4qI?e=s1QADa',
  },
  {
    title: 'Wood Connectors DIY Hardware Products Catalogue',
    type: 'PDF',
    group: 'Catalogues',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/web_support_keaa-international_net/IQDZg2UkpJN-RaIAwbR0rsxeATkSWko0PsjqrFR1SWLZMWc?e=DPhLYa',
  },
];

/** Portal only: company / product presentations. Not linked anywhere on the public site. */
export const presentationDownloads = [
  {
    title: 'KEAA India: Company Presentation (Updated)',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQAIL-4QLo7cQ4_Zi9Vp46cJAcBzAl8BLrUb5lGjbjtWvvo?e=2bzLyl',
  },
  {
    title: 'KEAA India: Company Presentation',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQDE-onHfdcgQrsvQ8CrqWjbATZUjIc-dhP31racQeN6Eg8?e=GcPDin',
  },
  {
    title: 'Formwork & Props',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQDIHriNJfelTr27f-FJ-fNdAThwVaDF_58EI64tByuOxWQ?e=yNP2Fh',
  },
  {
    title: 'Aluminium Range (Ref. 24391)',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQABidWLeTDuQ4y3JEJq7oYdAc3rv5FxPwsPmlQ5AsZ86oo?e=yxEgG4',
  },
  {
    title: 'Aluminium Products',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQBJPEmZWyIKS6hXH4-oJbg_AdfQJRxbQbr3BTejuSrzcWU?e=4yPKTu',
  },
  {
    title: 'Threading Machine',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQDRbWwpOAsZT6FIsdhjMRaNAe8K7mr8BiCaJy4NIfOvuUc?e=nWb62I',
  },
  {
    title: 'Sample Products',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQCfRsZaLLVRQbMDBC5fSDpdAeg17vN53maxhYt27ZRn6Q4?e=rdq3jF',
  },
  {
    title: 'Tobler Range (Art. 45079652256030)',
    type: 'PPTX',
    group: 'Presentations',
    url: 'https://itkeaainternational-my.sharepoint.com/:p:/g/personal/kishlay_keaa-international_net/IQD2_tC2P9tqSoDLZdIz8A5cARy5fKPgzEX_MVp7o9jxiBw?e=Auh98E',
  },
];

/**
 * Portal only: brand artwork, self-hosted from /public/downloads. A grouped entry — the
 * Resource Library shows one "Logos" row that expands to the files below. Each is a
 * transparent PNG (rasterised from the site's own logo artwork: lockups at 1560x480, icon at
 * 1024x1024) served same-origin with the `download` attribute, so a click saves the file
 * directly. If official master logo files arrive, drop them into /public/downloads and update
 * `url`/`filename` here.
 */
export const brandDownloads = [
  {
    title: 'KEAA Brand Logos',
    type: 'Logos',
    group: 'Brand Assets',
    files: [
      { label: 'KEAA Logo (Primary)', url: '/downloads/keaa-logo-primary.png', filename: 'keaa-logo-primary.png' },
      { label: 'KEAA Logo (White)', url: '/downloads/keaa-logo-white.png', filename: 'keaa-logo-white.png' },
      { label: 'KEAA Logo (Icon)', url: '/downloads/keaa-logo-icon.png', filename: 'keaa-logo-icon.png' },
    ],
  },
];

/** Everything the portal's Resource Library offers, in display order. */
export const portalDownloads = [...catalogueDownloads, ...presentationDownloads, ...brandDownloads];
