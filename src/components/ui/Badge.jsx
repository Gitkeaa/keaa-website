export default function Badge({ children, tone = 'gold', className = '' }) {
  const tones = {
    gold: 'bg-gold-50 text-gold-700 border-gold-200',
    navy: 'bg-navy-50 text-navy-700 border-navy-100',
    white: 'bg-white/10 text-white border-white/20',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
