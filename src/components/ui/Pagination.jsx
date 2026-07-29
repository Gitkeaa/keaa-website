import { useMemo } from 'react';
import { useLT } from '../../i18n/LocaleContext';

/**
 * Prev / numbered pages / next, with a "Show N per page" selector and a "Page X of Y"
 * readout — the shared control under the videos and photo galleries.
 *
 * Controlled and presentational: the parent owns `page` and `perPage` and slices its own
 * list; this renders the controls and calls back. Page numbers are 1-based. When `perPage`
 * changes the parent should reset `page` to 1 so it can never point past the last page.
 */

/** First and last page always, a ±1 window around the current page, ellipsis for the gaps. */
function pageList(current, totalPages) {
  const wanted = [1, totalPages, current, current - 1, current + 1];
  const sorted = [...new Set(wanted)].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}

export default function Pagination({
  total,
  page,
  perPage,
  perPageOptions = [20, 40, 80],
  onPage,
  onPerPage,
}) {
  const lt = useLT('common');
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const items = useMemo(() => pageList(page, totalPages), [page, totalPages]);
  if (total === 0) return null;

  const go = (p) => onPage(Math.min(totalPages, Math.max(1, p)));
  const cell =
    'inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors';
  const quiet = 'border-navy-100 text-ink hover:border-navy-300';
  const disabled = 'disabled:cursor-default disabled:opacity-40 disabled:hover:border-navy-100';

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <nav aria-label={lt('pagination.nav', 'Pagination')} className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1}
          className={`${cell} ${quiet} ${disabled} tracking-wide`}
        >
          {lt('pagination.prev', 'PREV')}
        </button>

        {items.map((n, i) =>
          n === '…' ? (
            <span key={`gap-${i}`} aria-hidden className="px-1 text-muted">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => go(n)}
              aria-current={n === page ? 'page' : undefined}
              aria-label={lt('pagination.page', 'Page {n}', { n })}
              className={`${cell} ${
                n === page ? 'border-navy-700 bg-navy-700 text-white' : quiet
              }`}
            >
              {n}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages}
          className={`${cell} ${quiet} ${disabled} tracking-wide`}
        >
          {lt('pagination.next', 'NEXT')}
        </button>
      </nav>

      <div className="flex items-center gap-3 text-sm text-ink">
        <label className="flex items-center gap-2">
          {lt('pagination.show', 'Show')}
          <select
            value={perPage}
            onChange={(e) => onPerPage(Number(e.target.value))}
            className="rounded-lg border border-navy-100 bg-white px-2 py-1.5 text-sm text-ink focus:border-navy-300 focus:outline-none"
            aria-label={lt('pagination.itemsPerPage', 'Items per page')}
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {lt('pagination.perPage', 'per page')}
        </label>
        <span className="whitespace-nowrap text-muted">
          {lt('pagination.pageOf', 'Page {page} of {total}', { page, total: totalPages })}
        </span>
      </div>
    </div>
  );
}
