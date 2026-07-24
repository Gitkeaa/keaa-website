import { useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { moduleKeyForPath, hasModuleHelp } from '../auth/roles';
import { useHelp } from './HelpContext';
import { guideForPath, roleSop, useSopVersion } from './useSop';

/**
 * The topbar Help control, with DYNAMIC VISIBILITY. It appears only where dedicated
 * documentation exists:
 *
 *   - the dashboard, where "Help" opens the signed-in role's own SOP (Admin / Business
 *     Development / HR SOP), so the full role guide is reachable from the help section itself;
 *   - the workflow-intensive modules (RFQ, Export Inquiries, Contact Messages, Job Applications,
 *     User Management, Roles & Responsibilities, Products, Reports) that own a Module Help drawer.
 *
 * On every other, simpler page (profile, notifications, gallery, categories, …) the button is
 * hidden entirely, so a user never opens irrelevant Help. Those pages rely on the role SOP and
 * inline descriptions instead.
 */
export default function HelpButton() {
  const location = useLocation();
  const { role } = useAdminAuth();
  const { openHelp } = useHelp();
  useSopVersion(); // keep the resolved guide fresh if it is edited live

  const key = moduleKeyForPath(location.pathname);
  const isDashboard = key === 'dashboard';

  // Hidden unless this page has a role SOP (dashboard) or a dedicated module guide.
  if (!isDashboard && !hasModuleHelp(key)) return null;

  const open = () => {
    const guide = isDashboard
      ? roleSop(role) || guideForPath(location.pathname)
      : guideForPath(location.pathname);
    openHelp(guide);
  };

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Help for this page"
      title="Help"
      className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    >
      <HelpCircle className="h-[18px] w-[18px]" />
      <span className="hidden sm:inline">Help</span>
    </button>
  );
}
