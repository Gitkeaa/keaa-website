import { statusMeta } from './atsConfig';

/**
 * A coloured status pill for the ATS pipeline. It has its own palette (via atsConfig) because
 * the shared StatusPill does not cover the full careers workflow (technical round, offer, etc.).
 */
export default function StatusBadge({ status, className = '' }) {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${m.badge} ${className}`}>
      {m.label}
    </span>
  );
}
