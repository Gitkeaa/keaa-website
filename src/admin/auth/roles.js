/**
 * Admin access model — the single source of truth for who sees what in the console.
 *
 * This file MIRRORS the backend's authorization rules (SecurityConfig.java) and Role enum.
 * The backend is what actually enforces access (a blocked call 403s); this file drives the
 * UI so a role is never shown a module it cannot use, and the route guard turns a deep-link
 * into a redirect instead of a dead page.
 *
 * The role strings must equal the JWT's role claim (ROLE_SUPER_ADMIN → 'SUPER_ADMIN').
 *
 * Tiers, highest access first:
 *   SUPER_ADMIN  every module, incl. user/role management (only role that can)
 *   ADMIN        every module EXCEPT user management
 *   SALES        RFQ + contact enquiries, products (read)
 *   MARKETING    products (manage) + contact enquiries
 *   HR           job applications
 *   EMPLOYEE     dashboard only (read-only)
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  MARKETING: 'MARKETING',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  SALES: 'Sales',
  MARKETING: 'Marketing',
  HR: 'HR',
  EMPLOYEE: 'Employee',
};

const ALL_ROLES = Object.values(ROLES);

/**
 * The COMPLETE admin module map — the whole panel the site is being built toward, not just
 * what ships today. It is the single source of truth for permissions.
 *
 * Per module:
 *   roles        every role with ANY access (drives nav visibility + the route guard)
 *   viewOnly     the subset of `roles` that gets read-only access (no create/edit/delete)
 *   implemented  true once the page + backend endpoint actually exist. Only implemented
 *                modules appear in the sidebar, so the panel never shows a dead link — flip
 *                this to true when a module lands and it wires itself in automatically.
 *
 * `icon` is a lucide-react name resolved in AdminSidebar (adminIcons.js); add the icon there
 * when a module goes live. `end` marks index-style exact matching (only the dashboard).
 *
 * Keep this in step with the backend (SecurityConfig.java rules + Role enum).
 */
export const MODULES = [
  // ---- live today ----
  { key: 'dashboard', to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', end: true, implemented: true, roles: ALL_ROLES },
  { key: 'users', to: '/admin/users', label: 'User Management', icon: 'Users', implemented: true, roles: [ROLES.SUPER_ADMIN] },
  { key: 'products', to: '/admin/products', label: 'Products', icon: 'Package', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES, ROLES.MARKETING], viewOnly: [ROLES.SALES] },
  { key: 'rfq', to: '/admin/rfq', label: 'RFQ Requests', icon: 'FileText', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES] },
  { key: 'contacts', to: '/admin/contacts', label: 'Contact Messages', icon: 'Mail', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES, ROLES.MARKETING] },
  { key: 'applications', to: '/admin/careers', label: 'Job Applications', icon: 'Briefcase', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR] },

  // ---- planned (matrix encoded now; pages/endpoints built in phases) ----
  { key: 'roles', to: '/admin/roles', label: 'Roles & Permissions', icon: 'ShieldCheck', implemented: true, roles: [ROLES.SUPER_ADMIN] },
  { key: 'product-categories', to: '/admin/product-categories', label: 'Product Categories', icon: 'FolderTree', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'pages', to: '/admin/pages', label: 'Pages (CMS)', icon: 'LayoutTemplate', implemented: false, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'blogs', to: '/admin/blogs', label: 'Blogs / News', icon: 'Newspaper', implemented: false, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'media', to: '/admin/media', label: 'Gallery / Media', icon: 'Image', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'downloads', to: '/admin/downloads', label: 'Downloads / Certificates', icon: 'Download', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'export-inquiries', to: '/admin/export-inquiries', label: 'Export Inquiries', icon: 'Globe2', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES] },
  { key: 'careers', to: '/admin/job-postings', label: 'Careers', icon: 'ClipboardList', implemented: false, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.HR] },
  { key: 'newsletter', to: '/admin/newsletter', label: 'Newsletter Subscribers', icon: 'Send', implemented: false, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'seo', to: '/admin/seo', label: 'SEO Management', icon: 'Search', implemented: false, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'analytics', to: '/admin/analytics', label: 'Analytics', icon: 'BarChart3', implemented: false, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING, ROLES.SALES, ROLES.HR], viewOnly: [ROLES.SALES, ROLES.HR] },
  { key: 'translations', to: '/admin/translations', label: 'Languages / Translations', icon: 'Languages', implemented: true, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MARKETING] },
  { key: 'settings', to: '/admin/settings', label: 'Website Settings', icon: 'Settings', implemented: true, roles: [ROLES.SUPER_ADMIN] },
  { key: 'profile', to: '/admin/profile', label: 'Profile', icon: 'CircleUser', implemented: true, roles: ALL_ROLES },
  { key: 'notifications', to: '/admin/notifications', label: 'Notifications', icon: 'Bell', implemented: true, roles: ALL_ROLES },
];

/** The modules that actually render in the sidebar today (page + endpoint exist). */
export const ADMIN_NAV = MODULES.filter((m) => m.implemented);

/** Sidebar items for the given role — only live modules the role may open. */
export const navForRole = (role) => ADMIN_NAV.filter((item) => item.roles.includes(role));

/** The module that owns `path` — exact for the dashboard index, prefix for the rest. */
const moduleForPath = (path) =>
  MODULES.find((m) => (m.end ? path === m.to : path === m.to || path.startsWith(`${m.to}/`)));

/**
 * True if `role` may open `path`. Used by the route guard so a deep-link to a module the role
 * cannot use redirects to the dashboard instead of rendering a page the backend would only
 * 403. Unknown paths fall through to allowed — add the module to MODULES to gate it.
 */
export const roleAllowsPath = (role, path) => {
  const m = moduleForPath(path);
  return m ? m.roles.includes(role) : true;
};

/**
 * A role's access level for a module key: 'manage' (full CRUD), 'view' (read-only), or null
 * (no access). Pages use this to render read-only for view-only roles (e.g. Sales on Products).
 */
export const moduleAccess = (role, key) => {
  const m = MODULES.find((x) => x.key === key);
  if (!m || !m.roles.includes(role)) return null;
  return m.viewOnly?.includes(role) ? 'view' : 'manage';
};
