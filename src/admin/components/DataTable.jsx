/**
 * A reusable admin table. Every module screen renders through this so they stay visually
 * consistent and get responsive horizontal scroll, hover rows and an empty state for free.
 *
 * Props:
 *   columns: [{ key, label, render?(row), align?, className? }]
 *   rows:    array of records
 *   keyField: unique field on each row (default 'id')
 *   onRowClick?(row)
 *   empty:    text for the empty state
 */
export default function DataTable({ columns, rows, keyField = 'id', onRowClick, empty = 'Nothing to show yet.' }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`whitespace-nowrap px-4 py-3 font-semibold text-slate-600 ${
                    c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                  }`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row[keyField]}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50/60'}`}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 text-slate-700 ${
                        c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : ''
                      } ${c.className || ''}`}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
