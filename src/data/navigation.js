import {
  Download,
  ShieldCheck,
  Star,
  Briefcase,
  FileText,
  Globe2,
  BookOpen,
} from 'lucide-react';

/**
 * `key` is the i18n lookup (see src/i18n/locales.js); `label` is the English fallback that
 * ships if a locale has not translated that key yet. Consumers should render
 * `t(item.key)` — `t` already falls back to English, so `label` is documentation plus a
 * safety net for any caller that has no access to the locale context.
 */
/**
 * `children` turns a nav item into a half-height panel (see layout/NavPanel.jsx). Items
 * without it are plain links — Home has no sub-content, and inventing some to make the nav
 * symmetrical would be padding.
 *
 * WHY EACH PAGE SITS WHERE IT DOES. These five used to live in a separate "Explore KEAA"
 * mega-menu — a second discovery system beside the nav — and, when that was removed, in the
 * footer only. Each is now filed under the thing a visitor is actually doing when they want
 * it, rather than in a catch-all:
 *
 *   Careers            -> Contact Us    applying is a way of getting in touch, and it sits
 *                                       beside Our Team, the people you would be joining
 *   Downloads Center   -> Products      catalogues and datasheets are evaluated WITH the
 *                                       products they describe, during a purchase
 *   Certifications     -> Manufacturing ISO 9001 / EN 1090 / SLV welding are proof of
 *                                       PRODUCTION capability, not company trivia
 *   Success Stories    -> Projects      the narrative half of the same evidence the
 *                                       gallery shows visually
 *   Request a Quote    -> nowhere       it is already the header's primary CTA; listing it
 *                                       again would state one action twice
 *
 * THE FIRST CHILD OF EVERY PANEL IS THE PARENT PAGE ITSELF. Without it the parent is
 * unreachable on touch, where there is no hover to separate "open the menu" from "go to the
 * page" — the old Products dropdown listed only categories and had exactly that flaw.
 */
/**
 * `feature` is the promo card on the right of each panel — eyebrow, headline, image and one
 * call to action. It exists so a panel is a place to go, not just a list to read past.
 *
 * `#hash` children point at real section ids on the destination page (added in About.jsx,
 * Manufacturing.jsx and ProjectsGallery.jsx). They land correctly because ScrollToTop waits
 * for the lazy route chunk to mount before scrolling, and `[id] { scroll-margin-top }` in
 * index.css keeps the sticky header off the heading. Do not add a hash child without a
 * matching `id` — the link would silently do nothing.
 */
export const mainNav = [
  { key: 'nav.home', label: 'Home', to: '/' },
  {
    key: 'nav.about',
    label: 'About Us',
    to: '/about',
    children: [
      { label: 'About KEAA', to: '/about', desc: 'Who we are and what we build' },
      { label: 'Our Journey', to: '/about#journey', desc: 'From 2003 to 42+ countries' },
      { label: 'Leadership', to: '/about#leadership', desc: 'Message from our Managing Directors' },
      /* Export and Guides are carried by the DESKTOP panel only. They are also resource pages
         (`resourcesNav` below), and the mobile drawer lists them there instead — it subtracts
         every resource route from the sections above its Resources block, so neither view ever
         shows one of them twice. The panel has two columns to fill and these two balance it;
         the drawer is a single scrolling list where a Resources heading reads better. */
      { label: 'Export', to: '/export', desc: 'Supplying buyers in 42+ countries' },
      { label: 'Guides', to: '/blog', desc: 'How to choose the right system' },
    ],
    feature: {
      eyebrow: 'Careers',
      title: 'Build what the world builds on',
      image: 'weldersFactory',
      cta: { label: 'Find a role', to: '/careers' },
    },
  },
  {
    key: 'nav.products',
    label: 'Products',
    to: '/products',
    /* The category rows are injected at render time from the catalogue itself, so this list
       can never name a line that has no page. See Header.jsx. */
    categories: true,
    children: [
      { label: 'All Products', to: '/products', desc: 'Every line we manufacture' },
      { label: 'Downloads Center', to: '/downloads', desc: 'Full product catalogues' },
      { label: 'Certifications', to: '/certifications', desc: 'Standards every product meets' },
      /* FAQ sits under Products because almost every question on it — MOQ, finishes, lead
         times, samples, export documentation — is asked while evaluating what to buy. */
      { label: 'FAQ & Testimonials', to: '/faq', desc: 'Ordering, finishes, lead times, export and customer reviews' },
    ],
    feature: {
      eyebrow: 'Downloads',
      title: 'Every product catalogue, in one place',
      image: 'scaffoldRacks',
      cta: { label: 'Open Downloads', to: '/downloads' },
    },
  },
  {
    key: 'nav.manufacturing',
    label: 'Manufacturing',
    to: '/manufacturing',
    children: [
      { label: 'Manufacturing', to: '/manufacturing', desc: 'Facilities and capability' },
      { label: 'Our Process', to: '/manufacturing#process', desc: 'Raw material to dispatch, in seven steps' },
      { label: 'Advanced Machinery', to: '/manufacturing#machinery', desc: 'Laser cutting, robotic welding, galvanizing' },
      { label: 'Output at Scale', to: '/manufacturing#stats', desc: 'Capacity, area and workforce' },
      { label: 'Certifications & Compliance', to: '/certifications', desc: 'ISO, CE, EN 1090 and test reports' },
    ],
    feature: {
      eyebrow: 'In-house capability',
      title: '100,000+ sq. m. of integrated manufacturing',
      image: 'factoryMachines',
      cta: { label: 'See the plant', to: '/manufacturing' },
    },
  },
  {
    key: 'nav.projects',
    label: 'Projects & Gallery',
    to: '/projects-gallery',
    children: [
      { label: 'Projects & Gallery', to: '/projects-gallery', desc: 'Everything we have delivered' },
      { label: 'Featured Projects', to: '/projects-gallery#projects', desc: 'Completed work by sector' },
      { label: 'Factory & Product Gallery', to: '/projects-gallery#gallery', desc: 'Photography from the floor' },
      { label: 'Films', to: '/projects-gallery#videos', desc: 'Manufacturing and product footage' },
    ],
    feature: {
      eyebrow: 'Track record',
      title: '500+ projects delivered across 42+ countries',
      image: 'scaffoldHighRise',
      cta: { label: 'Browse projects', to: '/projects-gallery' },
    },
  },
  {
    key: 'nav.contact',
    label: 'Contact Us',
    to: '/contact',
    /* Contact Us and Book a Factory Visit both land on /contact: the page's default tab is
       the contact form, and an unknown ?tab= falls back to it (Contact.jsx). Booking a visit
       is an enquiry, so it needs no separate route. Rows are keyed by route AND label in both
       renderers, so that shared `to` is safe. */
    children: [
      { label: 'Contact Us', to: '/contact', desc: 'Offices, phone and email' },
      { label: 'Book a Factory Visit', to: '/contact', desc: 'See the plant in person before you order' },
      { label: 'Our Team', to: '/contact#team', desc: 'The people behind the products' },
      /* Careers is carried by the DESKTOP panel, which has a second column to fill, and by
         `resourcesNav` below. The drawer subtracts every resource route from the sections
         above its Resources block, so on a phone it appears under Resources and nowhere else —
         the same arrangement Export and Guides have under About Us. Applying is a way of
         getting in touch, and it sits beside Our Team, the people you would be joining. */
      { label: 'Careers', to: '/careers', desc: 'Open roles and life at KEAA' },
    ],
  },
];


/**
 * ONE PAGE, ONE PLACE IN THE NAVIGATION.
 *
 * Every route that already hangs off a main-nav item — Downloads and FAQ under Products,
 * Certifications under Products and Manufacturing, Careers under Contact Us, and so on — is
 * collected here straight from `mainNav`. The resource lists below are then filtered through
 * it, so a page that a visitor can already reach by opening its parent section is never
 * repeated in a second flat list beside it. The mobile drawer showed exactly that: About KEAA,
 * Our Journey and Leadership indented under About Us, and then the same pages again in a
 * separate list further down.
 *
 * This is DERIVED, not a hand-kept list. Move a page under a parent in `mainNav` and it drops
 * out of the resource lists by itself; take it back out of a parent and it reappears. Nothing
 * is ever removed from the site by this — only the duplicate entry is, and the page keeps its
 * route and its place under its parent.
 */
const parentedRoutes = new Set(
  mainNav.flatMap((item) => (item.children || []).map((child) => child.to))
);

/** True when this route is already reachable as a child of a main-nav section. */
export const isParentedRoute = (to) => parentedRoutes.has(to);

/**
 * RESOURCES — the pages a visitor reaches on their own terms rather than through a section.
 *
 * Careers, Export, Guides, Success Stories and the quote form. Success Stories was linked from
 * nowhere on the site before this list existed. The mobile drawer renders these as a Resources
 * block after the sections, and the footer column below uses the same set.
 *
 * Export and Guides ALSO appear under About Us in `mainNav`, and that is deliberate: the
 * desktop panel has two columns to fill and shows them there, while the drawer subtracts every
 * route in this list from the sections above it, so on a phone they appear under Resources and
 * nowhere else. One page, one place, in each view.
 */
export const resourcesNav = [
  { label: 'Downloads Center', to: '/downloads', desc: 'Full product catalogues' },
  { label: 'Certifications', to: '/certifications', desc: 'Standards every product meets' },
  { label: 'FAQ & Testimonials', to: '/faq', desc: 'Ordering, finishes, lead times and reviews' },
  { label: 'Output at Scale', to: '/manufacturing#stats', desc: 'Capacity, area and workforce' },
  { label: 'Careers', to: '/careers', desc: 'Open roles and life at KEAA' },
  { label: 'Export', to: '/export', desc: 'Supplying buyers in 42+ countries' },
  { label: 'Guides', to: '/blog', desc: 'How to choose the right system' },
  /* Not drawn on the sketch, but kept: this page is linked from nowhere else on the site, so
     dropping it from here would strand it again. */
  { label: 'Success Stories', to: '/success-stories', desc: 'What we delivered, and for whom' },
];

/** The routes above, for the drawer to subtract from its sections. */
export const resourceRoutes = new Set(resourcesNav.map((r) => r.to));

/**
 * Drops entries a parent section already carries — EXCEPT the resource pages, which are
 * allowed in both places by design: Export and Guides sit under About Us in the desktop panel
 * and under Resources everywhere a Resources block is rendered. Everything else (Downloads,
 * Certifications, FAQ) is carried by a parent and so never repeats in a flat list.
 */
const orphansOnly = (links) =>
  links.filter((l) => !parentedRoutes.has(l.to) || resourceRoutes.has(l.to));

export const megaMenuItems = orphansOnly([
  {
    n: 1,
    title: 'Downloads Center',
    desc: 'Download the complete KEAA product catalogues, scaffolding and formworks, livestock housing solutions, and wood connectors and garden hardware, with the full range, item codes and sizes to support your projects and purchasing decisions.',
    to: '/downloads',
    icon: Download,
    color: 'bg-sky-500',
  },
  {
    n: 2,
    title: 'Certifications & Compliance',
    desc: "Explore our internationally recognized certifications, quality standards, compliance documents, and test reports that demonstrate KEAA's commitment to safety, precision manufacturing, and global regulatory requirements.",
    to: '/certifications',
    icon: ShieldCheck,
    color: 'bg-emerald-500',
  },
  {
    n: 4,
    title: 'FAQ & Testimonials',
    desc: 'Answers on products, manufacturing, certifications, ordering and export, alongside what contractors, distributors and industrial partners say about working with KEAA.',
    to: '/faq',
    icon: Star,
    color: 'bg-amber-500',
  },
  {
    n: 5,
    title: 'Export',
    desc: 'How KEAA ships to buyers in 42+ countries: documentation, packing, incoterms and the support that goes with an overseas order.',
    to: '/export',
    icon: Globe2,
    color: 'bg-indigo-500',
  },
  {
    n: 6,
    title: 'Guides',
    desc: 'Practical buying and specification guides that explain how to choose the right scaffolding, formwork or livestock system for the job.',
    to: '/blog',
    icon: BookOpen,
    color: 'bg-cyan-600',
  },
  {
    n: 8,
    title: 'Careers',
    desc: "Join a team driven by innovation, engineering excellence, and continuous growth. Explore exciting career opportunities and become part of KEAA's journey in building world-class manufacturing solutions.",
    to: '/careers',
    icon: Briefcase,
    color: 'bg-green-600',
  },
  {
    n: 9,
    title: 'Request for Quotation',
    desc: 'Submit your project requirements to receive a customized quotation, competitive factory pricing, OEM manufacturing support, and expert recommendations tailored to your business and project needs.',
    to: '/contact?tab=rfq',
    icon: FileText,
    color: 'bg-pink-600',
  },
]);

/**
 * The nine keyword landing pages, linked from the footer on every page so they are reachable
 * and so internal link equity reaches them. Kept here rather than derived from
 * data/landingPages.js to avoid a data module importing a navigation module and back.
 */
export const solutionsLinks = [
  { label: 'Scaffolding', to: '/scaffolding' },
  { label: 'Ringlock Scaffolding', to: '/scaffolding/ringlock-scaffolding' },
  { label: 'Cuplock Scaffolding', to: '/scaffolding/cuplock-scaffolding' },
  { label: 'Scaffold Couplers', to: '/scaffolding/scaffold-couplers' },
  { label: 'Formwork', to: '/formwork' },
  { label: 'Adjustable Steel Props', to: '/formwork/adjustable-steel-props' },
  { label: 'Garden Hardware', to: '/garden-hardware' },
  { label: 'Ground Anchors', to: '/garden-hardware/ground-anchors' },
  { label: 'Cattle Headlocks', to: '/livestock/cattle-headlocks' },
];

export const footerLinks = {
  quick: [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Products', to: '/products' },
    { label: 'Manufacturing', to: '/manufacturing' },
    { label: 'Projects & Gallery', to: '/projects-gallery' },
    { label: 'Contact Us', to: '/contact' },
  ],
  /**
   * This column is the ONLY desktop route to these pages. The header's "Explore KEAA"
   * mega-menu used to carry the same destinations, and when its trigger was removed the
   * footer became the sole desktop entry point, so anything missing here is unreachable for
   * a desktop visitor.
   *
   * Keep this in step with `megaMenuItems` above.
   */
  /**
   * Filtered through `orphansOnly`, so this column carries only what no parent section
   * already lists. Downloads, Certifications, FAQ and Careers all sit under Products,
   * Manufacturing or Contact Us in `mainNav` and are reachable there, in the header panels
   * and in the mobile drawer alike, so repeating them here was the duplication.
   *
   * `k` is the translation key suffix and is FIXED per entry. The labels are translated by
   * position (`common.footer.resources.<n>` in src/i18n/content/*.js), so reordering or
   * filtering this array without pinning the number would hand every locale the wrong word —
   * Export would have rendered as "Careers" in all eight. New entries take the next free
   * number and fall back to English until they are translated.
   */
  resources: orphansOnly([
    { k: 0, label: 'Downloads Center', to: '/downloads' },
    { k: 1, label: 'Certifications', to: '/certifications' },
    { k: 2, label: 'FAQ & Testimonials', to: '/faq' },
    { k: 3, label: 'Careers', to: '/careers' },
    { k: 4, label: 'Request a Quote', to: '/contact?tab=rfq' },
    /* Export and Guides belong to no parent section, so they show here. */
    { k: 5, label: 'Export', to: '/export' },
    { k: 6, label: 'Guides', to: '/blog' },
  ]),
};
