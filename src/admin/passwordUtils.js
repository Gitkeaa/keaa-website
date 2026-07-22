/**
 * Shared password helpers for the Change-Password and Add-User forms — a strength meter, a
 * strong-password generator and the requirements hint, in one place so the two screens agree.
 */

/** Rough password strength 0–4 from length + character variety. */
export const pwStrength = (p) => {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
};

export const STRENGTH_LABEL = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
export const STRENGTH_COLOR = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-emerald-500'];

/** A random 16-char password mixing the four character classes (ambiguous chars dropped). */
export const suggestStrongPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  const arr = new Uint32Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join('');
};

export const PW_HINT = 'Use at least 6 characters. A mix of upper & lower case, a number and a symbol is strongest.';
