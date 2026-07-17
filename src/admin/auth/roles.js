/**
 * Admin access model.
 *
 * Phase 1 ships SUPER_ADMIN with every module. The other roles are declared now so the
 * navigation and route guards are already role-aware — when the HR / Employee / Sales
 * dashboards land, they only need their `roles` arrays widened, no structural change.
 *
 * These strings must match the roles the Spring Boot backend will issue in the JWT
 * (e.g. ROLE_SUPER_ADMIN → 'SUPER_ADMIN'). Keep them in sync with the DB `roles` table.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
  SALES: 'SALES',
};

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  HR: 'HR',
  EMPLOYEE: 'Employee',
  SALES: 'Sales',
};

/**
 * Navigation for the admin shell. Each item lists the roles allowed to see it; the sidebar
 * filters by the signed-in user's role. `end` marks index-style exact matching.
 *
 * icon is a lucide-react component name resolved in AdminSidebar, so this file stays free
 * of JSX and can be imported anywhere (including future tests).
 */
export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'LayoutDashboard', end: true, roles: [ROLES.SUPER_ADMIN, ROLES.HR, ROLES.EMPLOYEE, ROLES.SALES] },
  { to: '/admin/users', label: 'User Management', icon: 'Users', roles: [ROLES.SUPER_ADMIN] },
  { to: '/admin/products', label: 'Products', icon: 'Package', roles: [ROLES.SUPER_ADMIN, ROLES.SALES] },
  { to: '/admin/rfq', label: 'RFQ Requests', icon: 'FileText', roles: [ROLES.SUPER_ADMIN, ROLES.SALES] },
  { to: '/admin/contacts', label: 'Contact Messages', icon: 'Mail', roles: [ROLES.SUPER_ADMIN, ROLES.SALES] },
  { to: '/admin/careers', label: 'Job Applications', icon: 'Briefcase', roles: [ROLES.SUPER_ADMIN, ROLES.HR] },
];

/** Items the given role may see. */
export const navForRole = (role) => ADMIN_NAV.filter((item) => item.roles.includes(role));
