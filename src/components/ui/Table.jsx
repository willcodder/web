/**
 * Responsive Table
 * - lg+: standard <table> with Apple-style spacing
 * - <lg: card list using `mobileLabel` column prop
 */
export default function Table({ columns, data, onRowClick, emptyMessage = 'No hay datos' }) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card px-6 py-14 text-center">
        <p className="text-[14px] text-gray-400 dark:text-[#636366]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop table ── */}
      <div className="hidden lg:block overflow-x-auto bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-black/[0.05] dark:border-white/[0.05]">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`
                    px-5 py-3.5 text-left text-[11px] font-semibold
                    text-gray-400 dark:text-[#636366]
                    uppercase tracking-wider
                    ${col.className || ''}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                className={`
                  border-b border-black/[0.04] dark:border-white/[0.04] last:border-0
                  transition-colors
                  ${onRowClick
                    ? 'cursor-pointer hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] focus-within:bg-[#F2F2F7] dark:focus-within:bg-[#2C2C2E]'
                    : ''
                  }
                `}
                onClick={() => onRowClick && onRowClick(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onRowClick && onRowClick(row)}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col, j) => (
                  <td
                    key={j}
                    className={`px-5 py-3.5 text-gray-700 dark:text-gray-300 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ── */}
      <div className="lg:hidden space-y-2.5">
        {data.map((row, i) => {
          const visibleCols = columns.filter(c => c.mobileLabel !== undefined)
          const actionCol   = columns.find(c => c.mobileAction)

          return (
            <div
              key={row.id || i}
              className={`
                bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-4
                ${onRowClick ? 'cursor-pointer active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E]' : ''}
              `}
              onClick={() => onRowClick && onRowClick(row)}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onRowClick && onRowClick(row)}
              role={onRowClick ? 'button' : undefined}
            >
              {/* Primary + actions row */}
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex-1 min-w-0">
                  {columns[0]?.mobileLabel !== undefined &&
                    (columns[0].render ? columns[0].render(row) : row[columns[0].accessor])}
                </div>
                {actionCol && (
                  <div onClick={e => e.stopPropagation()} className="ml-3 flex-shrink-0">
                    {actionCol.render(row)}
                  </div>
                )}
              </div>

              {/* Secondary fields grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {visibleCols.slice(1).map((col, j) => (
                  <div key={j} className={col.mobileFull ? 'col-span-2' : ''}>
                    <p className="text-[10px] text-gray-400 dark:text-[#636366] uppercase tracking-wide mb-0.5 font-medium">
                      {col.mobileLabel}
                    </p>
                    <div className="text-[13px]">
                      {col.render ? col.render(row) : row[col.accessor]}
                    </div>
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
