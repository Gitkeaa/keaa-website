/**
 * Explicit icon map for the admin console's data-driven icons.
 *
 * The admin nav (auth/roles.js) and dashboard (pages/AdminDashboard.jsx) store icons as
 * STRINGS and look them up at render. Doing that with a namespace import
 * (`import * as Icons from 'lucide-react'`) defeats tree-shaking and pulls the ENTIRE
 * lucide library (~700 KB) into the build — and because the public site shares the same
 * lucide chunk, that weight lands on the marketing pages too. This map imports only the
 * icons those data files actually reference, so tree-shaking is restored.
 *
 * If you add a new `icon: '...'` string to the admin data, add that icon here too.
 */
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Mail,
  Briefcase,
  UserPlus,
  Circle,
  ArrowRight,
  Activity,
} from 'lucide-react';

export const ADMIN_ICONS = {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Mail,
  Briefcase,
  UserPlus,
  Circle,
  ArrowRight,
  Activity,
};
