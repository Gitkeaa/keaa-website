import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Globe2,
  Clock,
  Phone,
  Mail,
  Headset,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';
import Logo from './Logo';
import { megaMenuItems } from '../../data/navigation';
import { company, countries } from '../../data/company';
import { downloadResources } from '../../data/content';

const gridStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};
const cardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function MegaMenu({ open, onClose }) {
  const navigate = useNavigate();

  const handleNavigate = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] overflow-y-auto bg-surface"
          role="dialog"
          aria-modal="true"
          aria-label="Explore KEAA"
        >
          {/* Very light atmosphere */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-primary/15 blur-[120px]" />
            {/* Large faint KEAA cube watermark */}
            <svg
              viewBox="0 0 100 100"
              className="absolute -right-24 top-1/2 h-[36rem] w-[36rem] -translate-y-1/2 opacity-[0.05]"
              aria-hidden="true"
            >
              <defs>
                <mask id="menu-cube-mask">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <line x1="50" y1="50" x2="5" y2="50" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
                  <line x1="50" y1="50" x2="73" y2="10" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
                  <line x1="50" y1="50" x2="73" y2="90" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
                </mask>
              </defs>
              <g mask="url(#menu-cube-mask)">
                <polygon points="10,50 30,15.36 70,15.36 50,50" fill="#79c7f9" />
                <polygon points="10,50 50,50 70,84.64 30,84.64" fill="#2b84da" />
                <polygon points="50,50 70,15.36 90,50 70,84.64" fill="#2065be" />
              </g>
            </svg>
          </div>

          <div className="relative">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 border-b border-navy-100 bg-surface/80 backdrop-blur-md">
              <div className="flex w-full items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
                <button onClick={() => handleNavigate('/')} aria-label="Go to home page">
                  <Logo />
                </button>
                <button
                  onClick={onClose}
                  className="group flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 transition-all hover:border-primary/60 hover:text-navy-900 hover:shadow-sm"
                >
                  <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  Close
                </button>
              </div>
            </div>

            {/* Heading + cards */}
            <div className="container-page py-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.3 }}
              >
                <span className="eyebrow text-primary-darker">Explore</span>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
                  Explore More About <span className="text-primary-dark">KEAA</span>
                </h2>
                <p className="mt-3 max-w-md text-sm text-ink/55">
                  Resources, insights and solutions — all in one place.
                </p>
              </motion.div>

              <motion.div
                variants={gridStagger}
                initial="hidden"
                animate="show"
                className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {megaMenuItems.map((item, i) => (
                  <motion.button
                    key={item.to}
                    variants={cardVariant}
                    onClick={() => handleNavigate(item.to)}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-black bg-white p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-cardHover"
                  >
                    {/* accent bar that draws in on hover */}
                    <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary-light to-primary transition-transform duration-300 group-hover:scale-x-100" />
                    {/* editorial watermark number */}
                    <span className="pointer-events-none absolute right-4 top-2 font-display text-5xl font-bold leading-none text-navy-50 transition-colors duration-300 group-hover:text-primary-light">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span
                      className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${item.color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                    >
                      <item.icon className="h-5 w-5" />
                    </span>

                    <h3 className="relative mt-5 font-display text-base font-semibold text-navy-800">
                      {item.title}
                    </h3>
                    <p className="relative mt-1.5 flex-1 text-xs leading-relaxed text-ink/55">
                      {item.desc}
                    </p>
                    <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-darker">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            {/* Compact info strip */}
            <div className="border-t border-navy-100 bg-navy-50/60">
              <div className="container-page grid gap-8 py-10 md:grid-cols-2">
                {/* Countries */}
                <div>
                  <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-navy-800">
                    <Globe2 className="h-4 w-4 text-primary-dark" /> Exporting to 42+ Countries
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {countries.map((c) => (
                      <span
                        key={c.name}
                        className="rounded-full border border-navy-100 bg-white px-2.5 py-1 text-xs text-navy-700 transition-colors hover:border-primary/50"
                      >
                        {c.flag} {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Need help */}
                <div className="md:text-right">
                  <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-navy-800 md:justify-end">
                    <Headset className="h-4 w-4 text-primary-dark" /> Need Help?
                  </h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <a
                      href={`tel:${company.phones[0]}`}
                      className="flex items-center gap-2 text-ink/70 transition-colors hover:text-primary-deep md:justify-end"
                    >
                      <Phone className="h-4 w-4 text-primary-dark" /> {company.phones[0]}
                    </a>
                    <a
                      href={`mailto:${company.emails[0]}`}
                      className="flex items-center gap-2 break-all text-ink/70 transition-colors hover:text-primary-deep md:justify-end"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0 text-primary-dark" /> {company.emails[0]}
                    </a>
                    <p className="flex items-center gap-2 text-ink/50 md:justify-end">
                      <Clock className="h-4 w-4 text-primary-dark" /> Mon – Sat, 9 AM – 6 PM (IST)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick access sub-row */}
              <div className="border-t border-navy-100">
                <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                    Quick Access
                  </span>
                  {downloadResources.slice(0, 3).map((d) => (
                    <a
                      key={d.title}
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="group inline-flex items-center gap-1.5 font-display text-sm font-semibold text-navy-700 transition-colors hover:text-primary-deep"
                    >
                      {d.title}
                      <ArrowUpRight className="h-4 w-4 text-primary-dark opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
