import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import AiChat from './components/AiChat';
import FloatingPromos from './components/FloatingPromos';
import { SplashProvider } from './hooks/useSplash';

/**
 * TEMPORARY A/B TOGGLE — delete this once the variant is chosen.
 *
 *   true  (variant B) entrance animations wait for the splash to finish, then play.
 *                     A first-time visitor sees exactly what they see today.
 *   false (variant A) entrance animations run behind the splash, so the page is already
 *                     settled when the splash lifts.
 *
 * Both variants mount the routes at t=0 — the crawler and LCP fix is identical either way.
 * This only decides whether the entrance choreography is preserved or consumed.
 */
const GATE_ANIMATIONS_UNTIL_SPLASH_DONE = true;

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const ProductCatalog = lazy(() => import('./pages/ProductCatalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Manufacturing = lazy(() => import('./pages/Manufacturing'));
const ProjectsGallery = lazy(() => import('./pages/ProjectsGallery'));
const Contact = lazy(() => import('./pages/Contact'));

const DownloadsCenter = lazy(() => import('./pages/DownloadsCenter'));
const Certifications = lazy(() => import('./pages/Certifications'));
const CustomerSuccessStories = lazy(() => import('./pages/CustomerSuccessStories'));
const Careers = lazy(() => import('./pages/Careers'));
const RequestQuotation = lazy(() => import('./pages/RequestQuotation'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.sessionStorage.getItem('keaa-splash-shown');
  });

  useEffect(() => {
    if (!showLoader) return;
    window.sessionStorage.setItem('keaa-splash-shown', 'true');
  }, [showLoader]);

  /**
   * The splash is an overlay, not a gate.
   *
   * It used to be rendered *instead of* <Routes>, which meant the route tree — and
   * therefore every word of page copy and the LCP hero image — did not exist in the DOM
   * for the 3.5s the splash ran. The lazy route chunk was not even requested until it
   * finished. A crawler always has empty sessionStorage, so that was the page Googlebot
   * saw: a loading animation with no content.
   *
   * Routes now mount immediately and the splash sits on top of them (it is already
   * `fixed inset-0 z-[9999]` and fully opaque, so nothing behind it is visible). The
   * splash itself is unchanged: same 3.1s progress run, same 400ms blur-and-fade exit.
   *
   * Body scroll is locked while it is up. Without this the now-mounted page would put a
   * scrollbar on the right of the splash, which was never there before. Layout owns
   * body.overflow for its menus, and its effect runs before this one (child effects run
   * before parent effects), so this write lands last and wins.
   */
  useEffect(() => {
    if (!showLoader) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showLoader]);

  const splashDone = GATE_ANIMATIONS_UNTIL_SPLASH_DONE ? !showLoader : true;

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <SplashProvider done={splashDone}>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:categorySlug" element={<ProductCatalog />} />
              <Route path="products/:categorySlug/:subSlug" element={<ProductCatalog />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="manufacturing" element={<Manufacturing />} />
              <Route path="projects-gallery" element={<ProjectsGallery />} />
              <Route path="contact" element={<Contact />} />

              <Route path="downloads" element={<DownloadsCenter />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="success-stories" element={<CustomerSuccessStories />} />
              <Route path="careers" element={<Careers />} />
              <Route path="rfq" element={<RequestQuotation />} />

              <Route path="privacy-policy" element={<Legal type="privacy" />} />
              <Route path="terms" element={<Legal type="terms" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        {showLoader && <PageLoader onComplete={() => setShowLoader(false)} />}
        <AiChat />
        <FloatingPromos />
        </SplashProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
