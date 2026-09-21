

export const company = {
  name: 'KEAA International Pvt. Ltd.',
  shortName: 'KEAA',
  tagline: 'Built for Safety. Built to Last.',
  founded: 2003,
  group: 'Runi Industries B.V.',
  description:
    'Keaa Established in 2003, KEAA International Pvt. Ltd. is a trusted manufacturing and export company delivering quality products and reliable solutions to customers worldwide. We manufacture and export scaffolding systems, formwork accessories, safety products, livestock housing solutions and garden hardware from 100,000+ sq. m of in-house manufacturing facilities in Ludhiana, India.',

  manufacturing: {
    label: 'Manufacturing Plant',
    line1: 'Village Bhagwanpura, Dehlon Road',
    line2: 'Ludhiana – 141120, Punjab, India',
    country: 'India',
  },
  salesOffice: {
    label: 'Sales Office & Warehouse, Europe',
    line1: 'Park Forum 1005',
    line2: '5657 HJ Eindhoven, The Netherlands',
    country: 'Netherlands',
    phone: '+31 655 282 244',
  },

  phones: ['+91 98767 01926', '+91 98729 84707'],
  emails: ['raveesh@keaa-international.net', 'sumit@keaa-international.net', 'bhupesh@keaa-international.net'],
  website: 'www.keaainternational.com',

  /**
   * One line per channel, read by both the footer and the contact page.
   *
   * linkedin, youtube and whatsapp are LIVE accounts. facebook, instagram and x are
   * PLACEHOLDERS: the client asked for every icon to show now and will send the real profile
   * URLs to drop in. They point at each platform's home page for the meantime rather than at
   * '#', because '#' scrolls the reader to the top of the page instead of leaving the site.
   * REPLACE each placeholder with the real profile URL when it arrives; nothing else changes,
   * the icon simply starts pointing at the right place.
   *
   * A channel set back to `null` disappears from both places (the two lists filter falsy
   * hrefs), so removing one is a one-word edit too.
   */
  social: {
    linkedin: 'https://www.linkedin.com/company/keaa/',
    facebook: 'https://www.facebook.com/Keaainternational/', // TODO: real KEAA page URL
    instagram: 'https://www.instagram.com/keaa_international/?utm_source=ig_web_button_share_sheet', // TODO: real KEAA profile URL
    youtube: 'https://www.youtube.com/@keaainternationalpvtltd5005',
    whatsapp: 'https://wa.me/919872984707',
  },

  stats: [
    { label: 'Years of Experience', value: '23+' },
    { label: 'Countries Exported', value: '42+' },
    { label: 'Manufacturing Facilities', value: '6' },
    { label: 'Sq. Ft Covered Area', value: '2,69,000+' },
    /* Label must stay exactly 'Skilled Employees': the Home band, Careers banner and
       Manufacturing page all look this figure up by label and drop the cell when it misses. */
    { label: 'Skilled Employees', value: '1000+' },
  ],

  facilities: {
    area: '100,000+ sq. m.',
    units: 5,
    /* Annual production capacity. Was a hard-coded literal on the Manufacturing page and the
       Home band; centralised here so the two can never disagree. TODO: client to confirm. */
    capacity: '5,000+ MT',
    moldRooms: 'In House Tool Room, Research and Development',
    galvanizingBaths:'3x In house Hot Dip Galvanizing Plant',
    powderCoating: '2x In-house Powder coating Plant',
    Electroplating: 'Automatic Electroplating Plant',
    testing:
      'In-house tensile & compression testing, fracture & bend test and macro/weld-penetration examination',
    welders: 'Certified welders as per EN 1090-2 / 3834-2, accredited by SLV Germany',
    quality: 'Ü-mark certified props (EN 1065 Class BD) and couplers (EN74-1B/BB), accredited by Sigma Karlsruhe Germany',
  },

  certifications: [
    {
      name: 'ISO 9001:2015',
      body: 'TÜV Rheinland',
      scope: 'Quality Management System',
      image: '/images/cert-iso-9001.jpg',
      note: 'Quality Management System for the manufacture of sheet-metal and fabricated components: scaffolding, framework, garden hardware and livestock products.',
    },
    {
      name: 'ISO 14001:2015',
      body: 'TÜV Rheinland',
      scope: 'Environmental Management System',
      image: '/images/cert-iso-14001.jpg',
      note: 'Environmental Management System ensuring responsible, low-impact and sustainable manufacturing across all operations.',
    },
    {
      name: 'ISO 45001:2018',
      body: 'TÜV Rheinland',
      scope: 'Occupational Health & Safety',
      image: '/images/cert-iso-45001.jpg',
      note: 'Occupational Health & Safety Management System protecting our workforce and maintaining a safe production environment.',
    },
    {
      name: 'ZED Silver',
      body: 'MSME Sustainable (ZED), Govt. of India',
      scope: 'Zero Defect Zero Effect',
      image: '/images/cert-zed-silver.jpg',
      note: 'Zero Defect Zero Effect (ZED) Silver certification recognising quality-driven and eco-conscious manufacturing.',
    },
  ],

  machinery: [
    { name: 'Sheet Laser Cutting', desc: 'High-precision laser cutting for flat steel components and brackets.' },
    { name: 'Tube Laser Cutting', desc: 'Accurate tube and pipe cutting for scaffolding and formwork frames.' },
    { name: 'Robotic Welding Stations', desc: 'Consistent, repeatable weld quality across high production volumes.' },
    { name: 'CNC Press Brake', desc: 'Precision bending for brackets, clamps and structural connectors.' },
    { name: 'Hot Dip Galvanizing Plant', desc: '3x In-house Hot Dip Galvanizing Plant as per DIN EN 1461.' },
    { name: 'Automatic Powder Coating Plant', desc: '2x In House Powder Coating Plant with Automatic Robotic Spray Gun' },
  ],

  processSteps: [
    { step: '01', title: 'Raw Material Selection', desc: 'High-grade steel is carefully sourced from trusted, audited vendors.' },
    { step: '02', title: 'Cutting', desc: 'Precision sheet and tube laser cutting for accurate dimensions.' },
    { step: '03', title: 'Welding', desc: 'Robotic and certified manual welding (EN 1090-2/3834-2) for strong, lasting joints.' },
    { step: '04', title: 'Surface Treatment', desc: 'Hot dip galvanizing or powder coating per DIN EN 1461 for corrosion resistance.' },
    { step: '05', title: 'Inspection & Testing', desc: 'Tensile, compression, bend and weld-penetration testing on every batch.' },
    { step: '06', title: 'Packaging & Dispatch', desc: 'Secure export packaging and on-time worldwide dispatch.' },
  ],
  
  timeline: [
    { year: '2003', title: 'The Beginning', desc: 'KEAA International was established with a vision to deliver quality scaffolding and construction hardware.' },
    { year: '2008', title: 'Expanding Capabilities', desc: 'Added livestock housing and garden hardware lines alongside scaffolding and formwork.' },
    { year: '2014', title: 'Going Global', desc: 'Opened a European sales office in Eindhoven, the Netherlands, to better serve European clients.' },
    { year: '2018', title: 'Excellence Recognised', desc: 'Achieved ISO 9001:2015, SLV welding certification and Sigma Karlsruhe Ü-mark conformity.' },
    { year: '2026', title: 'Future Forward', desc: 'Continuing to invest in automation, sustainability and new product development.' },
  ],

  values: {
    vision:
      'To be a trusted globally admired partner in providing resilient, intelligent and advanced solutions in infrastructural systems, integrated habitat technologies, and smart living creations-committed to sustainable growth and the well being of people and the planet.',
    mission:
      'We are committed to delivering world class scaffolding systems, livestock housing solutions and DIY wood Connectors by combining deep domain expertise with advanced manufacturing Thought a culture of respect, innovation and sustainable growth, we empower our people to exceed expectations and build enduring value for our global partners.',
    values: [
      'Integrity in everything we do',
      'Innovation driven solutions',
      'Excellence in manufacturing and service',
      'Customer Focus and satisfaction',
      'Team Empowerment and collaboration',
      'Sustainability and environmental responsibility',
      ],
  },
};

/**
 * Turn a `whatsapp` value into a real wa.me link, whatever shape it was typed in.
 *
 * These numbers arrive as ordinary phone numbers in mixed formats — '+91 98729 84707',
 * '75080 07931', '7508007760' — and a bare number used as an href is NOT a URL: the browser
 * resolves it as a relative path, so the link silently lands on the site instead of opening
 * WhatsApp. Everything is reduced to digits here so the data can stay human-readable.
 *
 * A value with no '+' that is exactly 10 digits is treated as Indian and given a 91 prefix;
 * every KEAA number is either an Indian mobile or carries its own '+', as the Eindhoven
 * desk's +31 one does. An already-complete URL passes straight through.
 */
export const waLink = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const national = !value.trim().startsWith('+') && digits.length === 10;
  return `https://wa.me/${national ? `91${digits}` : digits}`;
};

/**
 * Everyone below the two Managing Directors is shown as a contact card on the Contact page,
 * each with a WhatsApp and an email button.
 *
 * `email` and `whatsapp` are optional and rendered only when filled, so a blank one simply
 * hides that button rather than producing a dead link. Fill them in as they arrive:
 *   email:    'firstname@keaa-international.net'
 *   whatsapp: '+91 98765 43210'   // any format; waLink() above normalises it
 */
/**
 * The people shown on the About page and, from "Global Business Head" down, on the Contact
 * page team grid.
 *
 * CHANGING A PHOTOGRAPH
 * --------------------
 * Upload the picture to Cloudinary, copy its public_id, and paste it into that person's
 * `cloudinaryId`. It takes over from `photo` immediately and is delivered resized and
 * converted to the format the visitor's browser prefers, which the local files are not.
 * Leave `cloudinaryId` empty and the local `photo` is used exactly as before, so people can
 * be moved across one at a time.
 *
 * ADDING SOMEONE
 * --------------
 * Copy a block, change the fields. `name` and `role` are the only ones required. With no
 * photograph and no cloudinaryId the card falls back to a branded tile with their initials,
 * so a new person can be added before their picture exists.
 *
 * REMOVING SOMEONE
 * ----------------
 * Delete their block. Nothing else refers to them by position.
 *
 * WHO APPEARS WHERE: the Contact page filters out Chief Managing Director and Managing
 * Director, because those two carry full message blocks on About instead. See the TEAM
 * constant in pages/Contact.jsx.
 */
export const leadership = [
  {
    name: 'Raveesh Moudgil',
    role: 'Chief Managing Director',
    bio: 'Drives the overall strategic vision, global partnerships, and long-term growth of Keaa International.',
    photo: '/images/raveesh-moudgil.jpg',
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: '',
    linkedin: 'https://www.linkedin.com/in/raveesh-moudgil-b0618642',
    email: 'raveesh@keaa-international.net',
  },
  {
    name: 'Sumit Moudgil',
    role: 'Managing Director',
    bio: 'Oversees day-to-day operations, manufacturing facilities, and technology integration.',
    photo: '/images/sumit.jpg',
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: '',
    linkedin: 'https://www.linkedin.com/in/sumit-moudgil',
    email: 'sumit@keaa-international.net',
  },
  {
    name: 'Bhupesh Gautam',
    role: 'Global Business Head',
    
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: 'ChatGPT_Image_19_Sept_2026_16_18_05_t7pgv4',
    linkedin: 'https://www.linkedin.com/in/bhupesh-gautam-13867a7b/',
    email: 'bhupesh@keaa-international.net',
    whatsapp: '+91 98729 84707',
  },
  {
    name: 'Jaskamal Singh',
    role: 'Sales Manager',
   
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: 'Jaskamal_Keaa_nr05tj',
    linkedin: 'https://www.linkedin.com/in/jaskamal-singh-37b469377/',
    email: 'team2@keaa-international.net',
    whatsapp: '75080 07931',
  },
  {
    name: 'Vikram Singh',
    role: 'Sales Manager',
  
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: 'Vikram_keaa_kjc9cj',
    linkedin: 'https://www.linkedin.com/in/vikram-singh-panwar%E2%9C%A8/',
    email: 'team8@keaa-international.net',
    whatsapp: '7508007760',
  },

  {
    name: 'Ajay Rana',
    role: 'Sales Manager',
    
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: 'Ajay_RAna_Keaa_tn10ww',
    linkedin: 'https://www.linkedin.com/in/ajay-rana-00410241/',
    email: 'team4@keaa-international.net',
    whatsapp: '+91 788 849 2505',
  },
  {
    name: 'Sumeet Dogra',
    role: 'Asst. Sales Manager',
    
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: 'sumit_Dogra_keaa_enpham',
    linkedin: 'https://www.linkedin.com/in/sumeet-dogra-20b575116/',
    email: 'team5@keaa-international.net',
    whatsapp: '+91 75080 07980',
  },
  {
    name: 'Harpreet Singh',
    role: 'Sales Manager',
  
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: 'ChatGPT_Image_19_Sept_2026_16_13_24_r2nb0b',
    linkedin: 'https://www.linkedin.com/in/harpreet-singh-ahluwalia-540b41b4/',
    email: 'team@keaa-international.net',
    whatsapp: '+31 6 23427362',
  },
  {
    name: 'Amarjot Singh',
    role: 'Sales Manager',
   
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: 'Amarjot_keaa_m3uucm',
    linkedin: 'https://www.linkedin.com/in/amarjot--singh/',
    email: 'team3@keaa-international.net',
    whatsapp: '+91 80548 05002',
  },
];

export const chairmanMessage = {
  name: 'Om Parkash Sharma',
  role: 'Chairman, KEAA International Pvt. Ltd.',
  message:
    'For over two decades, KEAA International has grown on a foundation of quality, integrity and trust, from a focused manufacturing vision to a name relied upon across 42+ countries. I am deeply proud of the people and partnerships behind this journey, and remain committed to building solutions that make the world safer and stronger for generations to come.',
  photo: '/images/chairman.jpg',
  /* Cloudinary public_id. Fill this in and it replaces the photo above. */
  cloudinaryId: '',
};

// Managing Directors — shown together on the About page under one heading.
export const managingDirectors = [
  {
    name: 'Raveesh Moudgil',
    role: 'Managing Director, KEAA International Pvt. Ltd.',
    message:
      'At Keaa International, our vision is to engineer safety and reliability into every scaffolding and formwork solution we deliver. Over the past two decades, our commitment to quality, innovation, and international standards has made us a trusted global partner. We continue to invest in advanced technology and our people to support the world\'s infrastructure with integrity.',
    photo: '/images/raveesh-moudgil.jpg',
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: '',
    linkedin: 'https://www.linkedin.com/in/raveesh-moudgil-b0618642/',
    whatsapp: 'https://wa.me/919876701926',
    email: 'raveesh@keaa-international.net',
  },
  {
    name: 'Sumit Moudgil',
    role: 'Managing Director, KEAA International Pvt. Ltd.',
    message:
      'Our focus at Keaa International is on manufacturing excellence and operational efficiency. By leveraging state-of-the-art machinery and certified processes at our Ludhiana plants, we ensure that every product meets the most stringent international quality benchmarks. We are dedicated to providing customized, high-performing solutions that drive value for our clients globally.',
    photo: '/images/sumit.jpg',
    /* Cloudinary public_id. Fill this in and it replaces the photo above. */
    cloudinaryId: '',
    linkedin: 'https://www.linkedin.com/in/sumit-moudgil',
    whatsapp: 'https://wa.me/919872984707',
    mail: 'sumit@keaa-international.net',
  },
];

export const developer = {
  name: 'Kishlay Raj',
  linkedin: 'https://www.linkedin.com/in/kishlay258/',
};

export const countries = [
  { name: 'India', flag: '🇮🇳' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
];
