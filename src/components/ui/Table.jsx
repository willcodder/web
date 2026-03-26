/**
 * Responsive Table
 * - Desktop: standard <table>
 * - Mobile (<lg): card list. Each column with `mobileLabel` appears as a field.
 *   Columns without `mobileLabel` are hidden on mobile unless `mobileAlwaysShow` is true.
 */
export default function Table({ columns, data, onRowClick, emptyMessage = 'No hay datos' }) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {columns.map((col, i) => (
                <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 focus-within:bg-gray-50 dark:focus-within:bg-gray-700/50' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onRowClick && onRowClick(row)}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col, j) => (
                  <td key={j} className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${col.cellClassName || ''}`}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ── */}
      <div className="lg:hidden space-y-3">
        {data.map((row, i) => {
          const visibleCols = columns.filter(c => c.mobileLabel !== undefined)
          const actionCol = columns.find(c => c.mobileAction)

          return (
            <div
              key={row.id || i}
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${onRowClick ? 'cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/50' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onRowClick && onRowClick(row)}
              role={onRowClick ? 'button' : undefined}
            >
              {/* Primary field (first visible) */}
              {columns[0]?.mobileLabel !== undefined && (
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    {columns[0].render ? columns[0].render(row) : row[columns[0].accessor]}
                  </div>
                  {/* Actions */}
                  {actionCol && (
                    <div onClick={e => e.stopPropagation()} className="ml-2 flex-shrink-0">
                      {actionCol.render(row)}
                    </div>
                  )}
                </div>
              )}

              {/* Secondary fields */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {visibleCols.slice(1).map((col, j) => (
                  <div key={j} className={col.mobileFull ? 'col-span-2' : ''}>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{col.mobileLabel}</p>
                    <div className="text-sm">{col.render ? col.render(row) : row[col.accessor]}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
