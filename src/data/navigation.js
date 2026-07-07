import {
  Download,
  ShieldCheck,
  Star,
  ShoppingCart,
  Briefcase,
  FileText,
} from 'lucide-react';

export const mainNav = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Manufacturing', to: '/manufacturing' },
  { label: 'Projects & Gallery', to: '/projects-gallery' },
  { label: 'Contact Us', to: '/contact' },
];

export const megaMenuItems = [
  {
    n: 1,
    title: 'Downloads Center',
    desc: 'Brochures, catalogues, datasheets, installation guides and more.',
    to: '/downloads',
    icon: Download,
    color: 'bg-sky-500',
  },
  {
    n: 2,
    title: 'Certifications & Compliance',
    desc: 'ISO, CE, EU compliance, quality standards and test reports.',
    to: '/certifications',
    icon: ShieldCheck,
    color: 'bg-emerald-500',
  },
  {
    n: 4,
    title: 'Customer Success Stories',
    desc: 'Real reviews, testimonials and case studies from our customers.',
    to: '/success-stories',
    icon: Star,
    color: 'bg-amber-500',
  },
  {
    n: 5,
    title: 'Buy Online',
    desc: 'Purchase our products through trusted global marketplaces.',
    to: '/buy-online',
    icon: ShoppingCart,
    color: 'bg-rose-500',
  },
  {
    n: 8,
    title: 'Careers',
    desc: 'Join our team and build your career with KEAA International.',
    to: '/careers',
    icon: Briefcase,
    color: 'bg-green-600',
  },
  {
    n: 9,
    title: 'Request for Quotation',
    desc: 'Quick RFQ, bulk order, OEM manufacturing and export inquiries.',
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
  resources: [
    { label: 'Downloads Center', to: '/downloads' },
    { label: 'Certifications', to: '/certifications' },
    { label: 'Careers', to: '/careers' },
    { label: 'Request a Quote', to: '/rfq' },
  ],
};
