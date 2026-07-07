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
          aria-label="Explore everything at KEAA"
        >
          {/* Very light atmosphere */}
          <div className="pointer-events-none fixed inset-0">
            <div className="absolute -right-32 -top-32 h-[26rem] w-[26rem] rounded-full bg-gold-300/15 blur-[120px]" />
          </div>

          <div className="relative">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 border-b border-navy-100 bg-surface/80 backdrop-blur-md">
              <div className="container-page flex items-center justify-between py-4">
                <Logo />
                <button
                  onClick={onClose}
                  className="group flex items-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 transition-all hover:border-gold-400 hover:text-navy-900 hover:shadow-sm"
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
                <span className="eyebrow text-gold-600">
                  <span className="h-px w-6 bg-current" /> Explore
                </span>
                <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-navy-800 sm:text-5xl">
                  Explore Everything at <span className="text-gold-500">KEAA</span>
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
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-cardHover"
                  >
                    {/* accent bar that draws in on hover */}
                    <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-gold-500 transition-transform duration-300 group-hover:scale-x-100" />
                    {/* editorial watermark number */}
                    <span className="pointer-events-none absolute right-4 top-2 font-display text-5xl font-bold leading-none text-navy-50 transition-colors duration-300 group-hover:text-gold-100">
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
                    <span className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-600">
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
                    <Globe2 className="h-4 w-4 text-gold-500" /> Exporting to 42+ Countries
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {countries.map((c) => (
                      <span
                        key={c.name}
                        className="rounded-full border border-navy-100 bg-white px-2.5 py-1 text-xs text-navy-700 transition-colors hover:border-gold-300"
                      >
                        {c.flag} {c.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Need help */}
                <div className="md:text-right">
                  <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-navy-800 md:justify-end">
                    <Headset className="h-4 w-4 text-gold-500" /> Need Help?
                  </h4>
                  <div className="mt-3 space-y-2 text-sm">
                    <a
                      href={`tel:${company.phones[0]}`}
                      className="flex items-center gap-2 text-ink/70 transition-colors hover:text-gold-600 md:justify-end"
                    >
                      <Phone className="h-4 w-4 text-gold-500" /> {company.phones[0]}
                    </a>
                    <a
                      href={`mailto:${company.emails[0]}`}
                      className="flex items-center gap-2 break-all text-ink/70 transition-colors hover:text-gold-600 md:justify-end"
                    >
                      <Mail className="h-4 w-4 flex-shrink-0 text-gold-500" /> {company.emails[0]}
                    </a>
                    <p className="flex items-center gap-2 text-ink/50 md:justify-end">
                      <Clock className="h-4 w-4 text-gold-500" /> Mon – Sat, 9 AM – 6 PM (IST)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick access sub-row */}
              <div className="border-t border-navy-100">
                <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-ink/40">
                      Quick Access
                    </span>
                    {downloadResources.slice(0, 3).map((d) => (
                      <button
                        key={d.title}
                        onClick={() => handleNavigate('/downloads')}
                        className="group inline-flex items-center gap-1 text-xs text-ink/60 transition-colors hover:text-gold-600"
                      >
                        {d.title}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink/40">
                    <Globe2 className="h-3.5 w-3.5 text-gold-500" />
                    Our Global Presence: India · Netherlands · UAE · Saudi Arabia · Qatar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
