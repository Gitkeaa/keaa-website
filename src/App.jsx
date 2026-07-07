import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import AiChat from './components/AiChat';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const Manufacturing = lazy(() => import('./pages/Manufacturing'));
const ProjectsGallery = lazy(() => import('./pages/ProjectsGallery'));
const Contact = lazy(() => import('./pages/Contact'));

const DownloadsCenter = lazy(() => import('./pages/DownloadsCenter'));
const Certifications = lazy(() => import('./pages/Certifications'));
const CustomerSuccessStories = lazy(() => import('./pages/CustomerSuccessStories'));
const BuyOnline = lazy(() => import('./pages/BuyOnline'));
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

  return (
    <BrowserRouter>
      <ErrorBoundary>
        {showLoader ? (
          <PageLoader onComplete={() => setShowLoader(false)} />
        ) : (
          <Suspense fallback={null}>
            <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="products" element={<Products />} />
              <Route path="manufacturing" element={<Manufacturing />} />
              <Route path="projects-gallery" element={<ProjectsGallery />} />
              <Route path="contact" element={<Contact />} />

              <Route path="downloads" element={<DownloadsCenter />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="success-stories" element={<CustomerSuccessStories />} />
              <Route path="buy-online" element={<BuyOnline />} />
              <Route path="careers" element={<Careers />} />
              <Route path="rfq" element={<RequestQuotation />} />

              <Route path="privacy-policy" element={<Legal type="privacy" />} />
              <Route path="terms" element={<Legal type="terms" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      )}
      <AiChat />
      </ErrorBoundary>
    </BrowserRouter>
  );
}
