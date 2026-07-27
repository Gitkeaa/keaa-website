/**
 * Locale-aware date formatting shared by the admin console.
 *
 * `en-GB` gives day-month-year ordering. `fallback` is what an empty/undefined date renders
 * as, and differs by caller (blank in careers tables, an em-dash elsewhere), so it is a
 * parameter rather than baked in. Used by InquiryManager, AdminFeedback, SopHelpManager,
 * TwoFactorCard and the careers ATS config.
 */
export const formatDateTime = (iso, fallback = '—') =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : fallback;

export const formatDate = (iso, fallback = '—') =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : fallback;
