// Apple system color gradients for icon backgrounds
const gradients = {
  primary: 'linear-gradient(145deg,#007AFF,#0055b3)',
  green:   'linear-gradient(145deg,#34C759,#248a3d)',
  yellow:  'linear-gradient(145deg,#FF9500,#c97200)',
  red:     'linear-gradient(145deg,#FF3B30,#c0281f)',
  blue:    'linear-gradient(145deg,#5AC8FA,#32ade6)',
  purple:  'linear-gradient(145deg,#AF52DE,#8944ab)',
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card hover:shadow-card-hover p-5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[13px] font-medium text-gray-500 dark:text-[#8E8E93] leading-tight">
          {title}
        </p>
        {Icon && (
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: gradients[color] || gradients.primary }}
          >
            <Icon size={17} className="text-white" aria-hidden="true" />
          </div>
        )}
      </div>

      <p className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight tabular-nums leading-none mb-1.5">
        {value}
      </p>

      {subtitle && (
        <p className="text-[12px] text-gray-400 dark:text-[#636366]">
          {subtitle}
        </p>
      )}

      {trend !== undefined && (
        <p className={`text-[11px] font-semibold mt-2 ${trend >= 0 ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mes anterior
        </p>
      )}
    </div>
  )
}
