// Product range and item codes sourced directly from KEAA / Runi Industries
// catalogues: Scaffolding & Formworks, Livestock Housing Solutions, and the
// 2024 Garden Hardware catalogue.

import { img } from './images.js';

export const productCategories = [
  {
    slug: 'scaffolding-systems',
    name: 'Scaffolding Systems',
    brochureUrl: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/kishlay_keaa-international_net/IQDrlCW9_78jTbaxSmZFAXVFAQSkhKUTANw7Jq1pdWmfvSE?e=dASYwX',
    short: 'A complete range of scaffolding products designed for safety, strength and easy installation.',
    bullets: ['Cuplock Scaffolding System', 'Ringlock Scaffolding System', 'H-Frame & Walk-Through Frame', 'HK System Scaffolds', 'Scaffolding Pipes & Fittings'],
    standard: 'Hot dip galvanized as per DIN EN 1461',
    families: [
      {
        title: 'Load Bearing System — Shoring Tower (Frame)',
        spec: 'Tube: vertical Ø57mm, horizontal Ø42 & Ø27mm · CEBTP load tested to 310kN for 8m height',
        items: [
          { code: 'KIST-F-5ST', label: 'Frame (5 Steps)', size: '1500(L) x 1200(W) mm' },
          { code: 'KIST-F-3ST', label: 'Frame (3 Steps)', size: '1500(L) x 1200(W) mm' },
          { code: 'KIST-F-2ST', label: 'Frame (2 Steps)', size: '925(L) x 1200(W) mm' },
          { code: 'KIST-CB', label: 'Cross Brace', size: '1600 mm' },
          { code: 'KIST-VB', label: 'V Brace', size: '1600 mm' },
          { code: 'KIST-GRF', label: 'Guard Rail Frame', size: '1200 mm' },
          { code: 'KIST-GRC', label: 'Guard Rail Connector', size: '1200 mm' },
        ],
      },
      {
        title: 'System Scaffolds — Ringlock',
        spec: 'Standard & diagonal brace tube Ø48.3mm, S355JR / S235JR — EN10219 / EN10025',
        items: [
          { code: 'KIRS 50–300', label: 'Ringlock Standard', size: '500 – 3000 mm' },
          { code: 'KIRDB 730–3070', label: 'Ringlock Diagonal Brace', size: '730 – 3070 x 2000 mm' },
          { code: 'KIRL 73–037', label: 'Ringlock Ledger', size: '730 – 3070 mm' },
        ],
      },
      {
        title: 'System Scaffolds — HK',
        spec: 'High tensile, low-weight tube Ø48.3mm S355JRH / S420JRH — EN10219 / EN10025',
        items: [
          { code: 'KIHKS 050–300', label: 'HK Standard', size: '500 – 3000 mm (under 15kg)' },
          { code: 'KIHKES 100–300', label: 'Enhak Standard', size: '1000 – 3000 mm' },
          { code: 'KIHKL (LD/HD)', label: 'Ledger — Light/Heavy Duty', size: '1000 – 3000 mm' },
          { code: 'KIHKGRF 120–300', label: 'Guard Rail Frame', size: '1200 – 3000 mm' },
        ],
      },
      {
        title: 'Scaffold Tube Fittings — European',
        spec: 'Tube fitting 48.3mm — EN 74-1, finish EZP / hot dip galvanized as per DIN EN 1461',
        items: [
          { code: 'KIHCLS/SS', label: 'Half Coupler with L Strip (Long/Short)' },
          { code: 'KIHCWR', label: 'Half Coupler with Welded Rod' },
          { code: 'KIHCVS', label: 'Half Coupler with Welded V-Strip' },
          { code: 'KIGC-E', label: 'Girder Coupler' },
          { code: 'KISC-F', label: 'Sleeve Coupler — Forged' },
          { code: 'KICWS', label: 'Coupler with Welded Strip' },
          { code: 'KIHCWT', label: 'Half Coupler with Welded Tube' },
          { code: 'KIPSC', label: 'Pin for Sleeve Coupler' },
          { code: 'KIRC', label: 'Rosette Coupler — fitment 48.3mm' },
        ],
      },
    ],
  },
  {
    slug: 'formwork-accessories',
    name: 'Formwork Accessories',
    brochureUrl: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/kishlay_keaa-international_net/IQDrlCW9_78jTbaxSmZFAXVFAQSkhKUTANw7Jq1pdWmfvSE?e=dASYwX',
    short: 'High-quality formwork components for construction projects that ensure efficiency and durability.',
    bullets: ['Slab Formwork Props', 'Wall Formwork Accessories', 'Column Formwork Accessories', 'Beam Formwork Accessories', 'Formwork Clamps'],
    standard: 'Pre-galvanized / hot dip galvanized as per DIN 1461',
    families: [
      {
        title: 'Slab Formwork Systems — Props (Ü-Mark Certified)',
        spec: 'Props EN 1065 Class BD — Ü-mark certified, Cert No. 9 152/Z (Sigma Karlsruhe)',
        items: [
          { code: 'KIP-Ü-BD30', label: 'Ü-Mark Prop', size: 'Closing 1747 / Opening 3000 mm' },
          { code: 'KIP-Ü-BD35', label: 'Ü-Mark Prop', size: 'Closing 1980 / Opening 3500 mm' },
        ],
      },
      {
        title: 'Slab Formwork Props — 20kN Load Tested (PN-EN 1065)',
        spec: 'Inner tube Ø48mm S235JRH, outer tube Ø60.3mm S235JRH — G locking pin S355JR',
        items: [
          { code: 'KIP-B15', label: 'Prop', size: 'Closing 950 / Opening 1500 mm' },
          { code: 'KIP-B25', label: 'Prop', size: 'Closing 1500 / Opening 2500 mm' },
          { code: 'KIP-B30', label: 'Prop', size: 'Closing 1780 / Opening 3000 mm' },
          { code: 'KIP-B35', label: 'Prop', size: 'Closing 2000 / Opening 3500 mm' },
          { code: 'KIP-B40', label: 'Prop', size: 'Closing 2300 / Opening 4000 mm' },
          { code: 'KIP-B55', label: 'Prop', size: 'Closing 3000 / Opening 5500 mm' },
          { code: 'KIPHD-4.1', label: 'Heavy Duty Special Size Prop', size: 'Closing 2300 / Opening 4100 mm' },
        ],
      },
      {
        title: 'Prop Accessories',
        spec: 'G-locking pins, base plates, U-heads, drop-head couplers',
        items: [
          { code: 'Prop Accessories', label: 'G-pin · base plate · U-head · ring nut · wing nut clamp' },
        ],
      },
    ],
  },
  {
    slug: 'safety-products',
    name: 'Safety Products',
    short: 'Reliable safety equipment to ensure maximum protection and peace of mind on every site.',
    bullets: ['Safety Harness', 'Safety Helmets', 'Safety Nets', 'Lanyards & Lifelines', 'Other Safety Accessories'],
    standard: 'Conforms to applicable EN safety standards',
    families: [
      {
        title: 'Personal Protective Equipment',
        spec: 'Full body harnesses, lanyards, helmets and debris/safety nets for working-at-height compliance',
        items: [
          { code: 'KI-FBH', label: 'Full Body Harness' },
          { code: 'KI-SH', label: 'Safety Helmet' },
          { code: 'KI-LL', label: 'Lanyards & Lifelines' },
          { code: 'KI-SN', label: 'Safety / Debris Net' },
        ],
      },
    ],
  },
  {
    slug: 'livestock-housing-solutions',
    name: 'Livestock Housing Solutions',
    brochureUrl: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/kishlay_keaa-international_net/IQAE1nDX1LiORZ7UEr7sRjleAdYIXywvMCAQ5nc4CJn_swE?e=Y3nKaA',
    short: 'Innovative and durable hot-dip galvanized solutions for modern livestock farming and management.',
    bullets: ['Cattle Shed Structures', 'Cow Safety Headlocks', 'Panels & Gates', 'Feeders & Troughs', 'Sheep Handling Equipment'],
    standard: 'Hot dip galvanized as per DIN 1461',
    families: [
      {
        title: 'Cow Safety Headlocks',
        spec: 'Essential requirement of a free-stall barn — rubber bush noise reduction, individual feed-space locking',
        items: [
          { code: 'ART 325007', label: 'Giant Safety Headlock', size: '44cm wide head space — 129/194/260/325cm runs' },
          { code: 'ART 325008', label: 'HF Safety Headlock', size: '38cm wide head space — 129/194/260/325cm runs' },
        ],
      },
      {
        title: 'Mounting Accessories',
        spec: 'Hot dip galvanized clamps, brackets and posts for cubicle and headlock installation',
        items: [
          { code: 'ART 325015–18', label: 'Single / Double Head Clamps', size: 'Ø60x60 / Ø60x76 mm' },
          { code: 'ART 325019–24', label: 'Neck Rail & U-Bolt Clamps', size: 'Ø48–Ø76 mm' },
          { code: 'ART 325025–26', label: 'Cubicle Divider Mounting Brackets' },
          { code: 'ART 325027–28', label: 'Brisket Board Clamp & Plate' },
          { code: 'ART 325013–14', label: 'Posts with Foot Plate', size: 'Ø76 x 3.6mm — 100/145/160/180/195cm' },
        ],
      },
      {
        title: 'Sheep Handling Equipment',
        spec: 'Hot dip galvanized finish for long service life under outdoor conditions',
        items: [
          { code: 'ART 425010', label: 'Sheep Weighing Scale', size: 'Capacity up to 200kg' },
          { code: 'ART 425011', label: 'Sheep Race', size: '4.8m long (excludes drafting gate)' },
          { code: 'ART 425011(a)', label: 'Drafting Gate' },
          { code: 'ART 425011(b)', label: 'Non-Return Gate' },
          { code: 'ART 425011(c)', label: 'Joiner' },
        ],
      },
    ],
  },
  {
    slug: 'garden-hardware',
    name: 'Garden Hardware',
    brochureUrl: 'https://itkeaainternational-my.sharepoint.com/:b:/g/personal/kishlay_keaa-international_net/IQDZg2UkpJN-RaIAwbR0rsxeAdG_K_o0bs7OdFkVftP2DS0?e=HLEUDc',
    short: 'Durable and practical garden hardware products for outdoor structures and timber connections.',
    bullets: ['Wood Connectors', 'Post Holders', 'Hinges & Latches', 'Gate Hardware', 'Pergola & Swing Connectors'],
    standard: 'S250GD + Z275 per DIN EN 10346 · CE marked',
    families: [
      {
        title: 'Wood Connectors — Joist Hangers',
        spec: 'Material S250GD + Z275 (DIN EN 10346) · YS min. 250 MPa, UTS min. 350 MPa · Z275 zinc coating ≈20µm',
        items: [
          { code: 'Joist Hanger — Type A', label: 'Blank sizes 210–320 mm', size: 'CE / Z275 marked' },
          { code: 'Joist Hanger — Type B', label: 'Blank sizes 240–500 mm', size: 'CE / Z275 marked' },
          { code: 'Joist Hanger — Type C', label: 'a 25–50 mm range', size: 'CE / Z275 marked' },
          { code: 'Joist Hanger — Type D', label: 'Compact angle bracket', size: 'CE / Z275 marked' },
        ],
      },
      {
        title: 'Post Holders, Hinges & Gate Hardware',
        spec: 'Galvanized steel post holders, heavy-duty hinges, latches and pergola/swing connectors',
        items: [
          { code: 'GH-PH', label: 'Post Holders' },
          { code: 'GH-HL', label: 'Hinges & Latches' },
          { code: 'GH-GATE', label: 'Gate Hardware' },
          { code: 'GH-PSC', label: 'Pergola & Swing Connectors' },
        ],
      },
      {
        title: 'Outdoor & Garden Tools',
        spec: 'Wheelbarrows, fencing supports and general garden hardware accessories',
        items: [
          { code: 'GH-WB', label: 'Wheelbarrow' },
          { code: 'GH-FENCE', label: 'Fencing & Supports' },
          { code: 'GH-TOOLS', label: 'Garden Tools' },
        ],
      },
    ],
  },
];

export const bestSellers = [
  { name: 'Ringlock Standard (KIRS)', category: 'Scaffolding Systems' },
  { name: 'Ü-Mark Prop (KIP-Ü-BD30)', category: 'Formwork Accessories' },
  { name: 'Full Body Harness', category: 'Safety Products' },
  { name: 'Giant Safety Headlock (ART 325007)', category: 'Livestock Housing Solutions' },
  { name: 'Joist Hanger — Type A', category: 'Garden Hardware' },
  { name: 'Sheep Race (ART 425011)', category: 'Livestock Housing Solutions' },
];

// Premium curated photography (see src/data/images.js), mapped by category slug.
export const categoryImages = {
  'scaffolding-systems': img.heroScaffoldTower,
  'formwork-accessories': img.steelFrame,
  'safety-products': img.grinderMetal,
  'livestock-housing-solutions': img.cattleHerdBarn,
  'garden-hardware': img.woodenFrameSky,
};

// Parallel array to bestSellers above — index-matched.
export const bestSellerImages = [
  img.scaffoldFrame,
  img.metalPour,
  img.grinderMetal,
  img.cattleHerdBarn,
  img.woodenFrameBrown,
  img.cattleGrazing,
];
