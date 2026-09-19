import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { AdminAuthProvider } from './admin/auth/AdminAuthContext';
import { localePrefixOf } from './i18n/languages';
import { LocaleProvider } from './i18n/LocaleContext';

/**
 * Locale URLs (/de/about, /fr/contact) are served by giving the router that prefix as its
 * basename, so the ONE route tree below answers every language and every <Link to="/about">
 * automatically renders as /de/about while inside German. Nothing per-language is declared.
 *
 * Read once at module load on purpose: a basename cannot change on a mounted router, so
 * switching to a live language is a full navigation (see setLanguage in LocaleContext) —
 * the reload re-runs this line and the router comes up in the new language's URL space.
 * While no locale is live, the prefix is always '' and the router behaves exactly as before
 * ('/de/about' falls to the catch-all 404 like any unknown URL).
 */
const LOCALE_PREFIX = localePrefixOf(window.location.pathname);

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
const Careers = lazy(() => import('./pages/Careers'));
const Export = lazy(() => import('./pages/Export'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * `/rfq` used to be its own page; the RFQ and Export Inquiry forms are now tabs on
 * /contact (see pages/Contact.jsx), so every existing `/rfq` link — the header CTA, product
 * page bands, the region switcher's `?region=` link — is redirected here rather than edited
 * at each call site. The query string is forwarded and `tab=rfq` added, so `/rfq?region=eu`
 * still lands the visitor on the right desk with the RFQ tab already open.
 */
function RfqRedirect() {
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  qs.set('tab', 'rfq');
  return <Navigate to={`/contact?${qs.toString()}`} replace />;
}

// The chat widget is lazy: it alone pulls in react-markdown + the remark/micromark stack
// (the heaviest dependency on the site), which no first paint needs. Loading it after the
// page keeps that weight off the initial bundle — the floating button just appears a
// moment later.
const AiChat = lazy(() => import('./components/AiChat'));

// Feedback tab + drawer. Lazy for the same reason: nothing about a first paint needs it,
// and its trigger is a permanent tab that can appear a moment after the page.
const FeedbackWidget = lazy(() => import('./components/FeedbackWidget'));

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
const AdminCatalogueRequests = lazy(() => import('./admin/pages/AdminCatalogueRequests'));
const AdminFeedback = lazy(() => import('./admin/pages/AdminFeedback'));
const AdminContacts = lazy(() => import('./admin/pages/AdminContacts'));
const AdminCareers = lazy(() => import('./admin/pages/AdminCareers'));
const AdminProfile = lazy(() => import('./admin/pages/AdminProfile'));
const AdminNotifications = lazy(() => import('./admin/pages/AdminNotifications'));

export default function App() {
  return (
    <BrowserRouter basename={LOCALE_PREFIX || '/'}>
      <AdminAuthProvider>
        <AppShell />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/portal');

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Routes>
          {/* Admin console — its own shell, guarded by AdminLayout. */}
          <Route path="/portal/login" element={<AdminLogin />} />
          <Route path="/portal" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="roles" element={<AdminRoles />} />
            {/* SOP & Help Management moved into Roles & Responsibilities as a tab; keep the old
                deep-link working by redirecting it there. */}
            <Route path="guides" element={<Navigate to="/portal/roles?tab=sop" replace />} />
            <Route path="guides/*" element={<Navigate to="/portal/roles?tab=sop" replace />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="product-categories" element={<AdminProductCategories />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="videos" element={<AdminVideos />} />
            <Route path="downloads" element={<AdminDownloads />} />
            <Route path="rfq" element={<AdminRFQ />} />
            <Route path="export-inquiries" element={<AdminExportInquiries />} />
            <Route path="catalogue-requests" element={<AdminCatalogueRequests />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="feedback" element={<AdminFeedback />} />
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
            {/* Customer Success Stories was retired; its testimonials moved to the FAQ page.
                The route is kept as a redirect so the links already indexed for it land on
                that content instead of a 404. */}
            <Route path="success-stories" element={<Navigate to="/faq#testimonials" replace />} />
            <Route path="careers" element={<Careers />} />
            {/* Export buyers search for the capability, not for a contact form. See pages/Export.jsx. */}
            <Route path="export" element={<Export />} />
            {/* Guides answer the question a specifier asks before they look for a supplier,
                which no product page can rank for. See src/data/blog.js. */}
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="rfq" element={<RfqRedirect />} />

            <Route path="privacy-policy" element={<Legal type="privacy" />} />
            <Route path="terms" element={<Legal type="terms" />} />
            <Route path="cookie-policy" element={<Legal type="cookies" />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>

      {/* Public-only chrome — never rendered inside the admin console. Wrapped in its OWN
          LocaleProvider: these widgets mount beside the public tree, not inside Layout's
          provider, and useLT throws without one. A second provider instance is safe — it
          renders no markup and reads the same URL/localStorage language. */}
      {!isAdmin && (
        <Suspense fallback={null}>
          <LocaleProvider>
            <AiChat />
            <FeedbackWidget />
          </LocaleProvider>
        </Suspense>
      )}
      {/* Certification "Globally Certified" pop-up (FloatingPromos) is temporarily
          disabled site-wide, to be reintroduced later with a refreshed design.
          The component still lives in components/FloatingPromos.jsx — re-add
          <FloatingPromos /> here to bring it back. */}
    </ErrorBoundary>
  );
}
