import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { AdminAuthProvider } from './admin/auth/AdminAuthContext';

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
const FAQ = lazy(() => import('./pages/FAQ'));
const RequestQuotation = lazy(() => import('./pages/RequestQuotation'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));

// The chat widget is lazy: it alone pulls in react-markdown + the remark/micromark stack
// (the heaviest dependency on the site), which no first paint needs. Loading it after the
// page keeps that weight off the initial bundle — the floating button just appears a
// moment later.
const AiChat = lazy(() => import('./components/AiChat'));

// Admin console — lazy so its bundle (and the mock data / catalogue it pulls in) never
// touches the public site's entry chunk. Its own shell provides header/nav/footer, so it
// lives OUTSIDE the public <Layout> and skips the marketing chat widget.
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./admin/pages/AdminUsers'));
const AdminRoles = lazy(() => import('./admin/pages/AdminRoles'));
const AdminProducts = lazy(() => import('./admin/pages/AdminProducts'));
const AdminProductCategories = lazy(() => import('./admin/pages/AdminProductCategories'));
const AdminMedia = lazy(() => import('./admin/pages/AdminMedia'));
const AdminVideos = lazy(() => import('./admin/pages/AdminVideos'));
const AdminDownloads = lazy(() => import('./admin/pages/AdminDownloads'));
const AdminRFQ = lazy(() => import('./admin/pages/AdminRFQ'));
const AdminExportInquiries = lazy(() => import('./admin/pages/AdminExportInquiries'));
const AdminContacts = lazy(() => import('./admin/pages/AdminContacts'));
const AdminCareers = lazy(() => import('./admin/pages/AdminCareers'));
const AdminProfile = lazy(() => import('./admin/pages/AdminProfile'));
const AdminNotifications = lazy(() => import('./admin/pages/AdminNotifications'));

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppShell />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Routes>
          {/* Admin console — its own shell, guarded by AdminLayout. */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="product-categories" element={<AdminProductCategories />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="downloads" element={<AdminDownloads />} />
            <Route path="rfq" element={<AdminRFQ />} />
            <Route path="export-inquiries" element={<AdminExportInquiries />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="careers" element={<AdminCareers />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>

          {/* Public site. */}
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
            <Route path="faq" element={<FAQ />} />
            <Route path="rfq" element={<RequestQuotation />} />

            <Route path="privacy-policy" element={<Legal type="privacy" />} />
            <Route path="terms" element={<Legal type="terms" />} />
            <Route path="cookie-policy" element={<Legal type="cookies" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Public-only chrome — never rendered inside the admin console. */}
      {!isAdmin && (
        <Suspense fallback={null}>
          <AiChat />
        </Suspense>
      )}
      {/* Certification "Globally Certified" pop-up (FloatingPromos) is temporarily
          disabled site-wide, to be reintroduced later with a refreshed design.
          The component still lives in components/FloatingPromos.jsx — re-add
          <FloatingPromos /> here to bring it back. */}
    </ErrorBoundary>
  );
}
