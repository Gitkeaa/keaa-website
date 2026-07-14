/**
 * `tone="gold"` is kept as a key because a dozen call sites pass it, but the tone itself
 * is now brand blue: its label had already moved to `primary-darker`, and leaving the
 * cream `gold-50` surface behind it made the badge read as two different brands. The
 * label measures 6.0:1 on this tint.
 */
export default function Badge({ children, tone = 'gold', className = '' }) {
  const tones = {
    gold: 'bg-primary/[0.08] text-primary-darker border-primary/25',
    navy: 'bg-navy-50 text-navy-700 border-navy-100',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
