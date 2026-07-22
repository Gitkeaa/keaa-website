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
  SENIOR_ADMIN: 'SENIOR_ADMIN',
  ADMIN: 'ADMIN',
  BUSINESS_DEVELOPMENT: 'BUSINESS_DEVELOPMENT',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  SENIOR_ADMIN: 'Senior Admin',
  ADMIN: 'Admin',
  BUSINESS_DEVELOPMENT: 'Business Development',
  HR: 'HR',
  EMPLOYEE: 'Employee',
};

const ALL_ROLES = Object.values(ROLES);
// The two top tiers, the three admin tiers, and the same plus the Business Development desk.
const SUPERS = [ROLES.SUPER_ADMIN, ROLES.SENIOR_ADMIN];
const ADMINS = [...SUPERS, ROLES.ADMIN];
const ADMINS_BD = [...ADMINS, ROLES.BUSINESS_DEVELOPMENT];

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
  // User Management: Super/Senior manage; Admin + HR view-only (HR checks staff details).
  { key: 'users', to: '/admin/users', label: 'User Management', icon: 'Users', implemented: true, roles: [...ADMINS, ROLES.HR], viewOnly: [ROLES.ADMIN, ROLES.HR] },
  // Products: admin tiers manage, Business Development view-only.
  { key: 'products', to: '/admin/products', label: 'Products', icon: 'Package', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.BUSINESS_DEVELOPMENT] },
  // Lead pipeline: Super/Senior view, Admin assigns to BD, BD works its assigned leads.
  { key: 'rfq', to: '/admin/rfq', label: 'RFQ Requests', icon: 'FileText', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  { key: 'contacts', to: '/admin/contacts', label: 'Contact Messages', icon: 'Mail', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  // Job Applications: admin tiers view, only HR edits status.
  { key: 'applications', to: '/admin/careers', label: 'Job Applications', icon: 'Briefcase', implemented: true, roles: [...ADMINS, ROLES.HR], viewOnly: ADMINS },

  // ---- planned (matrix encoded now; pages/endpoints built in phases) ----
  { key: 'roles', to: '/admin/roles', label: 'Roles & Permissions', icon: 'ShieldCheck', implemented: true, roles: SUPERS },
  // Product Categories: Super/Senior manage, Admin + BD view-only.
  { key: 'product-categories', to: '/admin/product-categories', label: 'Product Categories', icon: 'FolderTree', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.ADMIN, ROLES.BUSINESS_DEVELOPMENT] },
  { key: 'pages', to: '/admin/pages', label: 'Pages (CMS)', icon: 'LayoutTemplate', implemented: false, roles: ADMINS_BD },
  { key: 'blogs', to: '/admin/blogs', label: 'Blogs / News', icon: 'Newspaper', implemented: false, roles: ADMINS_BD },
  // Gallery + Videos: admin tiers manage, Business Development view-only.
  { key: 'media', to: '/admin/media', label: 'Gallery', icon: 'Image', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.BUSINESS_DEVELOPMENT] },
  { key: 'videos', to: '/admin/videos', label: 'Videos', icon: 'Video', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.BUSINESS_DEVELOPMENT] },
  { key: 'downloads', to: '/admin/downloads', label: 'Downloads / Certificates', icon: 'Download', implemented: true, roles: ADMINS_BD },
  { key: 'export-inquiries', to: '/admin/export-inquiries', label: 'Export Inquiries', icon: 'Globe2', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  { key: 'seo', to: '/admin/seo', label: 'SEO Management', icon: 'Search', implemented: false, roles: ADMINS },
  { key: 'analytics', to: '/admin/analytics', label: 'Analytics', icon: 'BarChart3', implemented: false, roles: [...ADMINS_BD, ROLES.HR], viewOnly: [ROLES.BUSINESS_DEVELOPMENT, ROLES.HR] },
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

/** The stable module key that owns `path` (e.g. '/admin/rfq' → 'rfq'), or null. This is the
 *  `contextKey` the Contextual Help system binds a page's guide to, so a guide follows the
 *  page regardless of the exact URL. */
export const moduleKeyForPath = (path) => moduleForPath(path)?.key ?? null;

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
