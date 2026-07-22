import { useLocation } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { useHelp } from './HelpContext';
import { guideForPath } from './useSop';

/**
 * The topbar Help control. Opens the drawer with the guide for whatever page the user is on,
 * resolved from the route — so "Help" always answers "help with THIS screen". Styled as the
 * topbar's other icon buttons (theme toggle, menu) so it reads as one of the row's controls.
 */
export default function HelpButton() {
  const location = useLocation();
  const { openHelp } = useHelp();

  return (
    <button
      type="button"
      onClick={() => openHelp(guideForPath(location.pathname))}
      aria-label="Help for this page"
      title="Help"
      className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    >
      <HelpCircle className="h-[18px] w-[18px]" />
      <span className="hidden sm:inline">Help</span>
    </button>
  );
}
