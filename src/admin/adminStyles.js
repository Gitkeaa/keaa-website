/**
 * Shared Tailwind class strings for the admin console.
 *
 * `inputCls` is the standard text-input/select styling used across admin create/edit forms
 * (Users, Products, Media, Videos, SOP manager). Centralised so the fields stay visually
 * consistent. Forms with intentionally different field styling (AdminProfile, AdminLogin,
 * CareerFilters) keep their own strings on purpose.
 */
export const inputCls =
  'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy-800 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';
