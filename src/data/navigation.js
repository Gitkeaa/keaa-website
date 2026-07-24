import {
  Download,
  ShieldCheck,
  Star,
  Briefcase,
  FileText,
} from 'lucide-react';

/**
 * `key` is the i18n lookup (see src/i18n/locales.js); `label` is the English fallback that
 * ships if a locale has not translated that key yet. Consumers should render
 * `t(item.key)` — `t` already falls back to English, so `label` is documentation plus a
 * safety net for any caller that has no access to the locale context.
 */
/**
 * `children` turns a nav item into a half-height panel (see layout/NavPanel.jsx). Items
 * without it are plain links — Home and Contact Us have no sub-content, and inventing some
 * to make the nav symmetrical would be padding.
 *
 * WHY EACH PAGE SITS WHERE IT DOES. These five used to live in a separate "Explore KEAA"
 * mega-menu — a second discovery system beside the nav — and, when that was removed, in the
 * footer only. Each is now filed under the thing a visitor is actually doing when they want
 * it, rather than in a catch-all:
 *
 *   Careers            -> About Us      it is company/organisation information
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
      { label: 'Our Team', to: '/about#team', desc: 'The people behind the products' },
      { label: 'Careers', to: '/careers', desc: 'Open roles and life at KEAA' },
      { label: 'Contact Us', to: '/contact', desc: 'Offices, phone and email' },
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
      { label: 'Request a Quote', to: '/rfq', desc: 'Tell us what you need made' },
    ],
    feature: {
      eyebrow: 'In-house capability',
      title: '25,000 sq. m. of integrated manufacturing',
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
  { key: 'nav.contact', label: 'Contact Us', to: '/contact' },
];

export const megaMenuItems = [
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
    to: '/rfq',
    icon: FileText,
    color: 'bg-pink-600',
  },
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
  resources: [
    { label: 'Downloads Center', to: '/downloads' },
    { label: 'Certifications', to: '/certifications' },
    { label: 'FAQ & Testimonials', to: '/faq' },
    { label: 'Careers', to: '/careers' },
    { label: 'Request a Quote', to: '/rfq' },
  ],
};
