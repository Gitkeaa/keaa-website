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
    { id: 'image_large_3_hxtwtf', title: 'On Site,', accent: 'Worldwide.', desc: 'From our plant in Ludhiana to job sites across the globe.' },
  ]),

  products: build([
    { id: 'DSC_6057_x8jy1k', title: 'Engineered for Strength.', accent: 'Built for Performance.', desc: 'Scaffolding, formwork, safety, livestock housing and garden hardware.' },
    { id: 'image_large_x3tifr', title: 'Systems that', accent: 'Fit Together.', desc: 'Complete scaffolding & formwork solutions for any project.' },
    { id: 'image_large_2_gi4d42', title: 'Built to', accent: 'Global Standards.', desc: 'ISO, CE and EN-conformant across the range.' },
    { id: 'DSC_6058_fev55g', title: 'The Full', accent: 'Range.', desc: '355+ products in one catalogue.' },
  ]),

  about: build([
    { id: 'DJI_0146_bzclb7', title: 'Building Strength.', accent: 'Delivering Trust.', desc: 'An Indo-Dutch manufacturer and exporter since 2003.' },
    { id: 'IMG_9471_rxoaxo', title: 'In-House', accent: 'Manufacturing.', desc: '25,000 sq. m of advanced production in Ludhiana.' },
    { id: 'image_large_2_gi4d42', title: 'Products the', accent: 'World Relies On.', desc: 'Scaffolding, formwork, livestock housing and garden hardware.' },
    { id: 'image_large_3_hxtwtf', title: 'Trusted Across', accent: '42+ Countries.', desc: 'Exports across the Middle East, Europe, Africa and Asia.' },
  ]),

  careers: build([
    { id: 'IMG_2508_kmskzh', title: 'Join Our', accent: 'Team.', desc: 'Build your career with a global manufacturer.' },
    { id: 'IMG_0430_bnfi0v', title: 'Grow', accent: 'With Us.', desc: 'Learn, lead and build alongside skilled people.' },
    { id: 'IMG_9471_rxoaxo', title: 'Work That', accent: 'Matters.', desc: 'Help deliver excellence in manufacturing, every day.' },
    { id: 'DJI_0082_p2qmld', title: 'One Team,', accent: 'One Mission.', desc: 'Across our plants in India and office in the Netherlands.' },
  ]),

  certifications: build([
    { id: 'hot_dip_u4t1vc', title: 'Committed to', accent: 'Global Standards.', desc: 'ISO, CE and EU compliance, independently certified.' },
    { id: 'IMG_9646_fegbtz', title: 'Quality at', accent: 'Every Stage.', desc: 'Strict in-house control from raw steel to dispatch.' },
    { id: 'IMG_9389_pndzst', title: 'Tested &', accent: 'Certified.', desc: 'Third-party audited across Germany, Denmark and India.' },
    { id: 'IMG_9641_pi3mja', title: 'Zero Defect,', accent: 'Zero Effect.', desc: 'ZED-recognised, sustainable manufacturing.' },
  ]),

  contact: build([
    { id: 'DJI_0146_bzclb7', title: "Let's Build", accent: 'Together.', desc: 'Get in touch for inquiries, quotes or partnerships.' },
    { id: 'IMG_9471_rxoaxo', title: 'From Idea', accent: 'to Delivery.', desc: 'Our team responds to every enquiry, fast.' },
    { id: 'image_large_3_hxtwtf', title: 'Wherever', accent: 'You Build.', desc: 'Serving customers across 42+ countries.' },
    { id: 'DJI_0082_p2qmld', title: 'Talk to', accent: 'KEAA.', desc: 'Sales in Eindhoven, manufacturing in Ludhiana.' },
  ]),

  customerSuccess: build([
    { id: 'image_large_x3tifr', title: 'Trusted', accent: 'Worldwide.', desc: 'Real results from real projects.' },
    { id: 'image_large_2_gi4d42', title: 'Built to', accent: 'Perform.', desc: 'Products that hold up on the toughest sites.' },
    { id: 'DJI_0082_p2qmld', title: '42+ Countries,', accent: 'One Standard.', desc: 'Consistent quality, everywhere we ship.' },
    { id: 'DSC_6057_x8jy1k', title: 'Partners, Not', accent: 'Just Suppliers.', desc: 'Long-term relationships built on trust.' },
  ]),

  downloads: build([
    { id: 'IMG_9471_rxoaxo', title: 'Downloads &', accent: 'Resources.', desc: 'Brochures, catalogues and datasheets in one place.' },
    { id: 'IMG_9646_fegbtz', title: 'Every', accent: 'Spec.', desc: 'Technical sheets and installation guides.' },
    { id: 'DJI_0083_1_w7zuxk', title: 'Know the', accent: 'Product.', desc: 'Everything you need before you order.' },
    { id: 'IMG_9641_pi3mja', title: 'Ready to', accent: 'Reference.', desc: 'Up-to-date documentation, free to download.' },
  ]),

  faq: build([
    { id: 'DJI_0146_bzclb7', title: 'Frequently Asked', accent: 'Questions.', desc: 'Answers on products, manufacturing and ordering.' },
    { id: 'IMG_9389_pndzst', title: 'How We', accent: 'Make It.', desc: 'From steel selection to surface treatment.' },
    { id: 'hot_dip_u4t1vc', title: 'Built to', accent: 'Standard.', desc: 'Certifications, tolerances and compliance.' },
    { id: 'image_large_2_gi4d42', title: 'Still Have', accent: 'Questions?', desc: 'Ask our team directly, any time.' },
  ]),

  manufacturing: build([
    { id: 'IMG_9471_rxoaxo', title: 'Advanced Manufacturing.', accent: 'Built on Precision.', desc: 'Laser cutting, robotic welding and forming under one roof.' },
    { id: 'IMG_9646_fegbtz', title: 'Engineered', accent: 'In-House.', desc: '25,000 sq. m across two integrated units.' },
    { id: 'hot_dip_u4t1vc', title: 'Finished', accent: 'to Last.', desc: 'In-house hot-dip galvanizing per DIN EN 1461.' },
    { id: 'IMG_9389_pndzst', title: 'Scale &', accent: 'Consistency.', desc: '5,000+ MT annual capacity for global demand.' },
  ]),

  rfq: build([
    { id: 'image_9a3a7917-5b5e-474f-b8f7-cd170a7ca8f620230407_115549_rrzguh', title: 'Request a', accent: 'Quote.', desc: 'Tell us what you need — we reply within 24 hours.' },
    { id: 'image_large_x3tifr', title: 'The Right', accent: 'Solution.', desc: 'Tailored specs and pricing for your project.' },
    { id: 'IMG_9524_qcbtn4', title: 'Any Volume,', accent: 'Any Market.', desc: 'From single orders to bulk export.' },
    { id: 'DSC_6058_fev55g', title: "Let's Get", accent: 'Started.', desc: 'Share your requirement and our team takes it from there.' },
  ]),
};
