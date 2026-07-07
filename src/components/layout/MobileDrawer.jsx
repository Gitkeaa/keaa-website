import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { X, FileText, ChevronRight } from 'lucide-react';
import Logo from './Logo';
import Button from '../ui/Button';
import { mainNav, megaMenuItems } from '../../data/navigation';
import { productCategories } from '../../data/products';

export default function MobileDrawer({ open, onClose }) {
  const location = useLocation();
  const prevLocationRef = useRef(`${location.pathname}${location.search}${location.hash}`);

  useEffect(() => {
    const currentLocation = `${location.pathname}${location.search}${location.hash}`;

    if (!open) {
      prevLocationRef.current = currentLocation;
      return;
    }

    if (currentLocation !== prevLocationRef.current) {
      onClose();
      prevLocationRef.current = currentLocation;
    }
  }, [location.pathname, location.search, location.hash, onClose, open]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="mobile-drawer-wrapper"
          initial="closed"
          animate="open"
          exit="closed"
          className="fixed inset-0 z-[70] pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            variants={{
              closed: { opacity: 0 },
              open: { opacity: 1 }
            }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy-950/60 pointer-events-auto"
          />
          
          {/* Drawer Content */}
          <motion.div
            variants={{
              closed: { x: '100%' },
              open: { x: 0 }
            }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 z-10 flex w-full max-w-sm flex-col bg-white shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
              <Logo />
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-navy-100 text-navy-700"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <nav className="space-y-1">
                {mainNav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium ${
                        isActive ? 'bg-navy-50 text-navy-800' : 'text-ink/80 hover:bg-navy-50'
                      }`
                    }
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4 text-ink/30" />
                  </NavLink>
                ))}
              </nav>

              <div className="mt-3 border-t border-navy-100 pt-3">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  Product Categories
                </p>
                {productCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/products#${cat.slug}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-navy-50"
                  >
                    {cat.name}
                    <ChevronRight className="h-3.5 w-3.5 text-ink/30" />
                  </Link>
                ))}
              </div>

              <div className="mt-3 border-t border-navy-100 pt-3">
                <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-ink/40">
                  Explore KEAA
                </p>
                {megaMenuItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink/70 hover:bg-navy-50"
                  >
                    {item.title}
                    <ChevronRight className="h-3.5 w-3.5 text-ink/30" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-navy-100 p-5">
              <Button to="/rfq" onClick={onClose} icon={FileText} className="w-full">
                Request a Quote
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
