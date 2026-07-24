import { Check, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { useHelp } from '../help/HelpContext';
import { roleSop, useSopVersion } from '../help/useSop';

/**
 * The dashboard SOP card — a concise preview of the signed-in role's SOP, with a button that
 * opens the role's complete SOP in the help drawer. Content comes from useSop.js, the same
 * source the drawer and the SOP & Help manager read, so a change in one place updates here too.
 *
 * The card shows only the first few checklist items (a role SOP can be long); the rest, along
 * with responsibilities, best practices and notes, live in the full SOP behind the button. It
 * renders nothing for a role with no SOP, so it is safe to drop onto any dashboard.
 */
const PREVIEW = 5;

export default function SopCard() {
  const { role } = useAdminAuth();
  const { openHelp } = useHelp();
  useSopVersion(); // re-render when the DB-backed content loads or is edited
  const sop = roleSop(role);

  if (!sop) return null;

  const checklist = sop.checklist || [];
  const preview = checklist.slice(0, PREVIEW);
  const hidden = checklist.length - preview.length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-navy-900">{sop.title}</h2>
          {sop.purpose && <p className="mt-0.5 text-sm text-slate-500">{sop.purpose}</p>}
        </div>
        <span className="flex-shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-darker">
          SOP
        </span>
      </div>

      {preview.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {preview.map((item, i) => (
            <li key={`${i}-${item}`} className="flex gap-2.5 text-sm text-navy-800">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-dark" />
              {item}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => openHelp(sop)}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-darker hover:underline"
      >
        View complete SOP
        {hidden > 0 && <span className="font-normal text-slate-400">({hidden} more)</span>}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
