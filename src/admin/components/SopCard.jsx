import { Check } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useHelp } from '../help/HelpContext';
import { roleSop } from '../help/useSop';

/**
 * The dashboard SOP card — the short "✓" checklist for the signed-in user's role, with a
 * button that opens the role's complete SOP in the help drawer. Content comes from useSop.js,
 * so it is the same source the drawer and (in Phase 2) the Guide Management module edit.
 *
 * Renders nothing for a role with no SOP, so it is safe to drop onto any dashboard.
 */
export default function SopCard() {
  const { role } = useAdminAuth();
  const { openHelp } = useHelp();
  const sop = roleSop(role);

  if (!sop) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-base font-bold text-navy-900">{sop.title}</h2>
      {sop.purpose && <p className="mt-0.5 text-sm text-slate-500">{sop.purpose}</p>}

      <ul className="mt-4 space-y-2.5">
        {sop.checklist.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-navy-800">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-dark" />
            {item}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => openHelp(sop)}
        className="mt-5 text-sm font-semibold text-primary-darker hover:underline"
      >
        View complete SOP
      </button>
    </div>
  );
}
