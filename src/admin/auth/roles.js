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
  { key: 'dashboard', to: '/portal', label: 'Dashboard', icon: 'LayoutDashboard', end: true, implemented: true, roles: ALL_ROLES },
  // User Management: Super/Senior manage; Admin + HR view-only (HR checks staff details).
  { key: 'users', to: '/portal/users', label: 'User Management', icon: 'Users', implemented: true, roles: [...ADMINS, ROLES.HR], viewOnly: [ROLES.ADMIN, ROLES.HR] },
  // Products: admin tiers manage, Business Development view-only.
  { key: 'products', to: '/portal/products', label: 'Products', icon: 'Package', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.BUSINESS_DEVELOPMENT] },
  // Lead pipeline: Super/Senior view, Admin assigns to BD, BD works its assigned leads.
  { key: 'rfq', to: '/portal/rfq', label: 'RFQ Requests', icon: 'FileText', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  { key: 'contacts', to: '/portal/contacts', label: 'Contact Messages', icon: 'Mail', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  // Job Applications: admin tiers view, only HR edits status.
  { key: 'applications', to: '/portal/careers', label: 'Job Applications', icon: 'Briefcase', implemented: true, roles: [...ADMINS, ROLES.HR], viewOnly: ADMINS },

  // ---- planned (matrix encoded now; pages/endpoints built in phases) ----
  // Roles & Responsibilities also hosts the SOP & Help Management centre (a tab inside the page),
  // so there is no separate "Help & SOP" sidebar item — documentation is managed from here.
  { key: 'roles', to: '/portal/roles', label: 'Roles & Responsibilities', icon: 'ShieldCheck', implemented: true, roles: SUPERS },
  // Product Categories: Super/Senior manage, Admin + BD view-only.
  { key: 'product-categories', to: '/portal/product-categories', label: 'Product Categories', icon: 'FolderTree', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.ADMIN, ROLES.BUSINESS_DEVELOPMENT] },
  { key: 'pages', to: '/portal/pages', label: 'Pages (CMS)', icon: 'LayoutTemplate', implemented: false, roles: ADMINS_BD },
  { key: 'blogs', to: '/portal/blogs', label: 'Blogs / News', icon: 'Newspaper', implemented: false, roles: ADMINS_BD },
  // Gallery + Videos: admin tiers manage, Business Development view-only.
  { key: 'media', to: '/portal/media', label: 'Gallery', icon: 'Image', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.BUSINESS_DEVELOPMENT] },
  { key: 'videos', to: '/portal/videos', label: 'Videos', icon: 'Video', implemented: true, roles: ADMINS_BD, viewOnly: [ROLES.BUSINESS_DEVELOPMENT] },
  // Downloads: these roles UPLOAD and DELETE from the module page. Reading is deliberately
  // wider than this entry — SecurityConfig lets any signed-in staff member GET /api/downloads,
  // because the dashboard's Resource Library offers every file to the whole team.
  { key: 'downloads', to: '/portal/downloads', label: 'Downloads / Certificates', icon: 'Download', implemented: true, roles: ADMINS_BD },
  { key: 'export-inquiries', to: '/portal/export-inquiries', label: 'Export Inquiries', icon: 'Globe2', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  // Site Feedback: what the public feedback drawer (components/FeedbackWidget.jsx) collects.
  // NOT part of the lead pipeline — feedback is its own table, not an Inquiry (see the note on
  // the Feedback entity in the backend, and BACKEND_FEEDBACK.md). Same desk shape as Contact
  // Messages: the admin tiers and BD triage it, Super/Senior observe.
  { key: 'feedback', to: '/portal/feedback', label: 'Site Feedback', icon: 'MessageSquare', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  // Leads captured by the catalogue download gate on the public Downloads Center. Same stream
  // model as RFQ and Export: they are CATALOGUE-type inquiries, not a separate table.
  { key: 'catalogue-requests', to: '/portal/catalogue-requests', label: 'Catalogue Requests', icon: 'BookOpen', implemented: true, roles: ADMINS_BD, viewOnly: SUPERS },
  { key: 'seo', to: '/portal/seo', label: 'SEO Management', icon: 'Search', implemented: false, roles: ADMINS },
  { key: 'analytics', to: '/portal/analytics', label: 'Analytics', icon: 'BarChart3', implemented: false, roles: [...ADMINS_BD, ROLES.HR], viewOnly: [ROLES.BUSINESS_DEVELOPMENT, ROLES.HR] },
  // Reports: cross-department performance view for the admin tiers (read-only). Page pending, but
  // encoded now so it carries a proper label wherever a guide links to it as a related module.
  { key: 'reports', to: '/portal/reports', label: 'Reports', icon: 'BarChart3', implemented: false, roles: ADMINS, viewOnly: ADMINS },
  { key: 'profile', to: '/portal/profile', label: 'Profile', icon: 'CircleUser', implemented: true, roles: ALL_ROLES },
  { key: 'notifications', to: '/portal/notifications', label: 'Notifications', icon: 'Bell', implemented: true, roles: ALL_ROLES },
];

/** The modules that actually render in the sidebar today (page + endpoint exist). */
export const ADMIN_NAV = MODULES.filter((m) => m.implemented);

/** Sidebar items for the given role — only live modules the role may open. */
export const navForRole = (role) => ADMIN_NAV.filter((item) => item.roles.includes(role));

/** The module that owns `path` — exact for the dashboard index, prefix for the rest. */
const moduleForPath = (path) =>
  MODULES.find((m) => (m.end ? path === m.to : path === m.to || path.startsWith(`${m.to}/`)));

/** The stable module key that owns `path` (e.g. '/portal/rfq' → 'rfq'), or null. This is the
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

/** The human label for a module key (e.g. 'rfq' → 'RFQ Requests'), or the key if unknown.
 *  Used by the help drawer to render Related Module chips and by the SOP manager. */
export const moduleLabel = (key) => MODULES.find((m) => m.key === key)?.label ?? key;

/* ------------------------------------------------------------------ *
 * Contextual Help visibility
 *
 * The enterprise help model deliberately does NOT give every page its own drawer. Only the
 * workflow-intensive modules carry dedicated Module Help; simple pages (dashboard, profile,
 * notifications, gallery, categories, …) rely on the role SOP and inline descriptions instead.
 * This is the single list the Help button and the SOP manager read, so a page never shows
 * irrelevant documentation.
 * ------------------------------------------------------------------ */
export const HELP_MODULES = new Set([
  'rfq',
  'export-inquiries',
  'contacts',
  'applications',
  'users',
  'roles',
  'products',
  'reports',
]);

/** True if `key` is a workflow module that owns a dedicated Help drawer. */
export const hasModuleHelp = (key) => HELP_MODULES.has(key);

/* ------------------------------------------------------------------ *
 * SOP & Help Management permissions
 *
 * A dedicated permission category, shown in the access matrix and enforced in the SOP manager.
 * The whole management surface lives inside Roles & Responsibilities, which is already gated to
 * the two top tiers by the route guard; these actions refine what each role may do there and
 * document the model for everyone else (who get read-only View access).
 * ------------------------------------------------------------------ */
export const SOP_HELP_ACTIONS = [
  { key: 'view', label: 'View Documentation' },
  { key: 'edit', label: 'Edit Documentation' },
  { key: 'publish', label: 'Publish Documentation' },
  { key: 'restore', label: 'Restore Previous Version' },
  { key: 'history', label: 'Manage Version History' },
];

const SOP_HELP_ALL = SOP_HELP_ACTIONS.map((a) => a.key);

/** Default access per role: the two top tiers get everything; every other role is view-only. */
const SOP_HELP_ACCESS = {
  [ROLES.SUPER_ADMIN]: SOP_HELP_ALL,
  [ROLES.SENIOR_ADMIN]: SOP_HELP_ALL,
  [ROLES.ADMIN]: ['view'],
  [ROLES.BUSINESS_DEVELOPMENT]: ['view'],
  [ROLES.HR]: ['view'],
  [ROLES.EMPLOYEE]: ['view'],
};

/** The SOP & Help actions a role may perform (array of action keys). */
export const sopHelpAccess = (role) => SOP_HELP_ACCESS[role] || [];

/** True if `role` may perform a specific SOP & Help action ('edit', 'publish', 'restore', …). */
export const canDoSopHelp = (role, action) => sopHelpAccess(role).includes(action);

/** Convenience: may this role edit/publish documentation at all (the write gate for the manager)? */
export const canEditDocs = (role) => canDoSopHelp(role, 'edit');
