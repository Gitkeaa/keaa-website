export default function Stat({ icon: Icon, value, label, light = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {Icon && (
        <Icon
          className={`h-6 w-6 flex-shrink-0 ${light ? 'text-gold-400' : 'text-gold-500'}`}
          strokeWidth={1.75}
        />
      )}
      <div>
        <div className={`font-display text-xl sm:text-2xl font-bold ${light ? 'text-white' : 'text-navy-800'}`}>
          {value}
        </div>
        <div className={`text-xs sm:text-sm ${light ? 'text-white/60' : 'text-ink/60'}`}>{label}</div>
      </div>
    </div>
  );
}
