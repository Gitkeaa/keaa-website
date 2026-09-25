import { cldImage } from './cloudinary';

/**
 * Per-page hero carousels for GalleryHero: each entry is one PHOTO + its own COPY, so the
 * heading changes as the picture changes. Images are real KEAA gallery photography (see
 * data/gallery.js), hand-picked from a hero-suitability pass — landscape, strong composition,
 * a calm lower-left for the overlaid heading, no faces filling the frame. w_1600 for a
 * full-bleed hero. Edit a slide's `id` to swap its photo, or its `title`/`accent`/`desc` to
 * change what it says.
 */
const build = (arr) => arr.map((s) => ({ ...s, image: cldImage(s.id, { w: 1600 }) }));

export const heroSlides = {
  gallery: build([
    { id: 'DJI_0082_p2qmld', title: 'Building Projects.', accent: 'Delivering Excellence.', desc: '500+ completed projects across 42+ countries.' },
    { id: 'hot_dip_u4t1vc', title: 'Engineered', accent: 'to Last.', desc: 'Every component hot-dip galvanized for a long life in the field.' },
    { id: 'IMG_9471_rxoaxo', title: 'Made with', accent: 'Precision.', desc: 'In-house laser cutting, robotic welding and forming.' },
    { id: 'DJI_0164_efaxki', title: 'On Site,', accent: 'Worldwide.', desc: 'From our plant in Ludhiana to job sites across the globe.' },
  ]),

  products: build([
    { id: 'DJI_0131_ljo3tq', title: 'Engineered for Strength.', accent: 'Built for Performance.', desc: 'Scaffolding, formwork, safety, livestock housing and garden hardware.' },
    { id: 'Locking_2_jrzuql', title: 'Systems that', accent: 'Fit Together.', desc: 'Complete scaffolding & formwork solutions for any project.' },
    { id: 'IMG_1977_qclqp3', title: 'Built to', accent: 'Global Standards.', desc: 'ISO, CE and EN-conformant across the range.' },
    { id: 'IMG_9524_qcbtn4', title: 'The Full', accent: 'Range.', desc: '355+ products in one catalogue.' },
  ]),

  about: build([
    { id: 'DJI_0146_bzclb7', title: 'Building Strength.', accent: 'Delivering Trust.', desc: 'An Indian manufacturer and exporter since 2003.' },
    { id: 'IMG_9471_rxoaxo', title: 'In-House', accent: 'Manufacturing.', desc: '100,000+ sq. m of advanced production in Ludhiana.' },
    { id: 'DJI_0117_jnjfzw', title: 'Products the', accent: 'World Relies On.', desc: 'Scaffolding, formwork, livestock housing and garden hardware.' },
    { id: 'DJI_0126_busis7', title: 'Trusted Across', accent: '42+ Countries.', desc: 'Exports across the Middle East, Europe, Africa and Asia.' },
  ]),

  careers: build([
    { id: 'IMG_2508_kmskzh', title: 'Join Our', accent: 'Team.', desc: 'Build your career with a global manufacturer.' },
    { id: 'IMG_0430_bnfi0v', title: 'Grow', accent: 'With Us.', desc: 'Learn, lead and build alongside skilled people.' },
    { id: 'IMG_9471_rxoaxo', title: 'Work That', accent: 'Matters.', desc: 'Help deliver excellence in manufacturing, every day.' },
    { id: 'DJI_0082_p2qmld', title: 'One Team,', accent: 'One Mission.', desc: 'Across our plants in India and office in the Netherlands.' },
  ]),

  certifications: build([
    { id: 'hot_dip_u4t1vc', title: 'Committed to', accent: 'Global Standards.', desc: 'ISO, CE and EU compliance, independently certified.' },
    { id: 'IMG_9483_xgkajt', title: 'Quality at', accent: 'Every Stage.', desc: 'Strict in-house control from raw steel to dispatch.' },
    { id: 'IMG_9389_pndzst', title: 'Tested &', accent: 'Certified.', desc: 'Third-party audited across Germany, Denmark and India.' },
    { id: 'IMG_9641_pi3mja', title: 'Zero Defect,', accent: 'Zero Effect.', desc: 'ZED-recognised, sustainable manufacturing.' },
  ]),

  // The opening slide was DJI_0146_bzclb7, a low aerial of two shed roofs with an unfinished
  // building and rubble in the foreground — a building site rather than a working plant, which
  // is not the first thing a page headed "Let's Build Together." should show. DJI_0082_p2qmld
  // moved up from the fourth slide instead: an oblique aerial with sky and horizon that reads
  // as the whole works in context, and whose dark lower-left carries the white heading. The
  // other plant aerial takes the slide it vacated, so the carousel still has no repeat.
  contact: build([
    { id: 'DJI_0082_p2qmld', title: "Let's Build", accent: 'Together.', desc: 'Get in touch for inquiries, quotes or partnerships.' },
    { id: 'IMG_9471_rxoaxo', title: 'From Idea', accent: 'to Delivery.', desc: 'Our team responds to every enquiry, fast.' },
    { id: 'Screenshot_2023-04-17_103327_cq7mkj', title: 'Wherever', accent: 'You Build.', desc: 'Serving customers across 42+ countries.' },
    { id: 'DJI_0083_1_w7zuxk', title: 'Talk to', accent: 'KEAA.', desc: 'Manufacturing in Ludhiana.' },
  ]),

  downloads: build([
    { id: 'IMG_9471_rxoaxo', title: 'Downloads &', accent: 'Resources.', desc: 'Every product catalogue in one place.' },
    { id: 'IMG_9524_qcbtn4', title: 'Every', accent: 'Range.', desc: 'Item codes, sizes and finishes in full.' },
    { id: 'DJI_0083_1_w7zuxk', title: 'Know the', accent: 'Product.', desc: 'Everything you need before you order.' },
    { id: 'IMG_9641_pi3mja', title: 'Ready to', accent: 'Reference.', desc: 'Up-to-date documentation, free to download.' },
  ]),

  faq: build([
    { id: 'DJI_0146_bzclb7', title: 'Frequently Asked', accent: 'Questions.', desc: 'Answers on products, manufacturing and ordering.' },
    { id: 'IMG_9389_pndzst', title: 'How We', accent: 'Make It.', desc: 'From steel selection to surface treatment.' },
    { id: 'hot_dip_u4t1vc', title: 'Built to', accent: 'Standard.', desc: 'Certifications, tolerances and compliance.' },
    { id: 'IMG_9518_tzihvj', title: 'Still Have', accent: 'Questions?', desc: 'Ask our team directly, any time.' },
  ]),

  // IMG_9612_xlbdb5 ('Engineered In-House.') was dropped from this carousel: the source photo
  // is stored rotated a quarter turn and Cloudinary delivers it as shot, so it filled the hero
  // on its side — the worker and the building lying horizontally. It is still listed in
  // data/gallery.js, where it has the same problem. Re-add it here only once the asset is
  // re-uploaded upright (or delivered with a rotation baked into the transform).
  manufacturing: build([
    { id: 'IMG_9471_rxoaxo', title: 'Advanced Manufacturing.', accent: 'Built on Precision.', desc: 'Laser cutting, robotic welding and forming under one roof.' },
    { id: 'hot_dip_u4t1vc', title: 'Finished', accent: 'to Last.', desc: 'In-house hot-dip galvanizing per DIN EN 1461.' },
    { id: 'IMG_9389_pndzst', title: 'Scale &', accent: 'Consistency.', desc: '5,000+ MT annual capacity for global demand.' },
  ]),

  rfq: build([
    { id: 'IMG_9406_hz6kms', title: 'Request a', accent: 'Quote.', desc: 'Tell us what you need — we reply within 24 hours.' },
    { id: 'IMG_9405_tqyhyi', title: 'The Right', accent: 'Solution.', desc: 'Tailored specs and pricing for your project.' },
    { id: 'IMG_9524_qcbtn4', title: 'Any Volume,', accent: 'Any Market.', desc: 'From single orders to bulk export.' },
    { id: 'IMG_9483_xgkajt', title: "Let's Get", accent: 'Started.', desc: 'Share your requirement and our team takes it from there.' },
  ]),
};
