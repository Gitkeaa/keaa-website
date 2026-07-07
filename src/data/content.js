import { img } from './images.js';

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

export const videoLibrary = [
  { title: 'Company Overview', duration: '3:25', category: 'Corporate Videos' },
  { title: 'Factory Tour', duration: '5:48', category: 'Factory Tour' },
  { title: 'Scaffolding Systems in Action', duration: '2:49', category: 'Product Videos' },
  { title: 'Formwork Solutions Explained', duration: '2:41', category: 'Product Videos' },
];

// KEAA aerial / drone film (SharePoint). Single source of truth for the share
// link — used by the Home hero and the Projects & Gallery page. SharePoint can't
// be embedded inline, so the play buttons open it in a new browser tab. The link
// must be shared as "Anyone with the link — view".
export const droneFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/kishlay_keaa-international_net/IQDm1CX67h50RL_3WVI0XCz_ARLdLPLGNnMQDX8Qkuqnezk?e=LnaAC2&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';

// Product / brand films shown in Projects & Gallery, below the featured factory
// film. Each opens the SharePoint video in a new tab. Update links here.
export const naymoFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/kishlay_keaa-international_net/IQCbf_O95O_0S64CVQFKmFfkATD2IZ_SNyYZTfN9gtONkpg?e=zJC052&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';
export const raasFilmUrl =
  'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/kishlay_keaa-international_net/IQCZZvmPtHSfSaEXtfyRk8DdAfOtL-WxCApdaOWCI_eUQxQ?e=iOvkQX&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D';

export const marketInsights = [
  {
    date: 'June 2026',
    title: 'Global Scaffolding Market to Reach $9.7 Billion by 2030',
    summary:
      'Rising infrastructure spending across the Gulf and South Asia continues to push demand for system scaffolding and engineered formwork solutions.',
  },
  {
    date: 'May 2026',
    title: 'E-commerce in Construction: Trends and Opportunities',
    summary:
      'B2B marketplaces are reshaping how contractors source scaffolding and formwork components, favouring suppliers with verified certifications.',
  },
  {
    date: 'April 2026',
    title: 'Export Opportunities for Indian Manufacturers',
    summary:
      'Government incentives and AEO status are helping certified Indian exporters compete on lead time and compliance in EU and GCC markets.',
  },
  {
    date: 'March 2026',
    title: 'Rising Demand for Safety Products Worldwide',
    summary:
      'Stricter working-at-height regulations are driving global demand for certified harnesses, guard rails and fall-protection systems.',
  },
];

export const careers = [
  { title: 'Sales Executive – International Business', location: 'Ludhiana, India', type: 'Full Time' },
  { title: 'Production Engineer', location: 'Ludhiana, India', type: 'Full Time' },
  { title: 'Quality Control Inspector', location: 'Ludhiana, India', type: 'Full Time' },
  { title: 'Digital Marketing Executive', location: 'Ludhiana, India', type: 'Full Time' },
];

export const marketplaces = [
  { name: 'IndiaMART', desc: 'Browse our full catalogue and request quotes from verified sellers.' },
  { name: 'TradeIndia', desc: 'Bulk and export inquiries through India\u2019s leading B2B marketplace.' },
  { name: 'Amazon', desc: 'Selected safety and garden hardware products for direct purchase.' },
  { name: 'Alibaba', desc: 'Export-ready listings for international wholesale buyers.' },
  { name: 'Moglix', desc: 'Industrial procurement for scaffolding and formwork accessories.' },
  { name: 'IndustryBuying', desc: 'Direct industrial purchasing for safety and construction hardware.' },
];

// Downloadable resources (SharePoint PowerPoint files). `url` opens the file in
// a new tab where visitors can view and download it. NOTE: each link must be
// shared as "Anyone with the link — view" so public visitors can open it.
export const downloadResources = [
  {
    title: 'Scaffolding & Formworks Catalogue',
    type: 'PDF',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/kishlay_keaa-international_net/IQDrlCW9_78jTbaxSmZFAXVFAQSkhKUTANw7Jq1pdWmfvSE?e=dASYwX',
  },
  {
    title: 'Livestock Housing Solutions Catalogue',
    type: 'PDF',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/kishlay_keaa-international_net/IQAE1nDX1LiORZ7UEr7sRjleAdYIXywvMCAQ5nc4CJn_swE?e=Y3nKaA',
  },
  {
    title: 'Wood Connectors Catalogue',
    type: 'PDF',
    url: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/kishlay_keaa-international_net/IQDZg2UkpJN-RaIAwbR0rsxeAdG_K_o0bs7OdFkVftP2DS0?e=HLEUDc',
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
