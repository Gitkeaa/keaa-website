/**
 * Shared bits for the public request modals (JobApplicationModal, CatalogueRequestModal).
 *
 * These modals are not native <form>s, so the browser's own `type="email"` / `required`
 * validation never runs on submit — `EMAIL_RE` is the only gate before contact details are
 * sent. `fieldCls` is their common input styling. Deliberately a loose typo check, not an
 * RFC 5322 parser.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const fieldCls =
  'mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';
