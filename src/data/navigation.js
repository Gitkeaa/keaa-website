import {
  Download,
  ShieldCheck,
  Star,
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
    desc: 'Access all essential KEAA resources in one place, including company brochures, product catalogues, technical datasheets, certifications, presentations, and installation guides to support your projects and purchasing decisions.',
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
    title: 'Customer Success Stories',
    desc: "Discover how contractors, distributors, and industrial partners worldwide have successfully completed projects using KEAA's reliable engineering solutions through real customer testimonials and project case studies.",
    to: '/success-stories',
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
  resources: [
    { label: 'Downloads Center', to: '/downloads' },
    { label: 'Certifications', to: '/certifications' },
    { label: 'Careers', to: '/careers' },
    { label: 'Request a Quote', to: '/rfq' },
  ],
};
