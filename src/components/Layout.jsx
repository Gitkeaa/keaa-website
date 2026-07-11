import { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import Header from './layout/Header';
import Footer from './layout/Footer';
import MegaMenu from './layout/MegaMenu';
import MobileDrawer from './layout/MobileDrawer';
import ScrollToTop from './ScrollToTop';
import BackToTop from './BackToTop';

export default function Layout() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = megaOpen || drawerOpen ? 'hidden' : '';
  }, [megaOpen, drawerOpen]);

  useEffect(() => {
    if (megaOpen || drawerOpen) {
      setMegaOpen(false);
      setDrawerOpen(false);
    }
  }, [location.pathname, location.search, location.hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 right-0 top-0 z-[100] h-[3px] origin-left bg-primary-dark"
      />
      <ScrollToTop />
      <Header onOpenMegaMenu={() => setMegaOpen(true)} onOpenDrawer={() => setDrawerOpen(true)} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Suspense fallback={<div className="min-h-[60vh]" />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <BackToTop />
    </div>
  );
}
