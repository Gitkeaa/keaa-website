import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useApi } from '../api/useApi';

/**
 * "Recent Site Feedback" — the dashboard panel for what the public feedback drawer collects.
 *
 * ONLY MOUNT THIS FOR A ROLE THAT HAS THE `feedback` MODULE. It fetches /api/feedback on mount,
 * and the backend gates that to the admin tiers plus Business Development, so mounting it for HR
 * or Employee would fire a request that 403s and paint an error onto their dashboard. The caller
 * checks `moduleAccess(role, 'feedback')` rather than this component hiding itself afterwards —
 * by then the request has already gone out.
 */
const TYPE_LABELS = {
  suggestion: 'Suggestion',
  feedback: 'Feedback',
  issue: 'Issue',
  compliment: 'Compliment',
};

function Stars({ value }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={`h-3 w-3 ${n <= value ? 'fill-primary-dark text-primary-dark' : 'fill-transparent text-slate-300'}`}
        />
      ))}
      <span className="sr-only">{value} out of 5</span>
    </span>
  );
}

export default function FeedbackCard({ limit = 5 }) {
  const { data, loading, error } = useApi('/api/feedback');
  const all = data || [];
  const recent = all.slice(0, limit);
  const unreviewed = all.filter((f) => (f.status || 'new') === 'new').length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-navy-900">Recent Site Feedback</h2>
          {all.length > 0 && (
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {unreviewed} of {all.length} not yet reviewed
            </p>
          )}
        </div>
        <Link to="/portal/feedback" className="flex-shrink-0 text-sm font-medium text-primary-darker hover:underline">
          View all
        </Link>
      </div>

      {error ? (
        <p role="alert" className="px-5 py-8 text-center text-sm text-red-600">{error}</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {loading && !data && (
            <li className="px-5 py-8 text-center text-sm text-slate-400">Loading…</li>
          )}
          {!loading && recent.length === 0 && (
            <li className="px-5 py-8 text-center">
              <p className="text-sm text-slate-500">No feedback yet.</p>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
                Visitors leave this through the Feedback tab on the right edge of the public site.
              </p>
            </li>
          )}
          {recent.map((f) => (
            <li key={f.id} className="px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Stars value={f.rating || 0} />
                <span className="text-xs font-medium text-slate-500">
                  {TYPE_LABELS[f.type] || f.type}
                </span>
                <span className="truncate text-xs text-slate-400">
                  · {f.name || 'Anonymous'}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-700">{f.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
