/**
 * Force a real download of a backend-served file, cross-origin-safe.
 *
 * A plain `<a download>` is IGNORED by browsers when the href is a different origin (the API runs
 * on API_BASE, e.g. :8080, not the app's own origin), so it only opens the file. This fetches the
 * bytes WITH the admin cookie (credentials: 'include', which the backend CORS already allows for
 * this origin), turns them into a same-origin `blob:` URL, and downloads that, which browsers
 * always honour. If the fetch is blocked (no CORS on the file route, network), it falls back to
 * opening the file so the resume is never simply lost.
 *
 * The cleaner long-term path is the backend serving the file with `Content-Disposition:
 * attachment` (then a plain link downloads too); this makes Download work without waiting for it.
 */
import { API_BASE } from '../api/client';

/** Cloudinary serves files inline by default; the `fl_attachment` delivery flag forces a real
 *  download. Rewrite a Cloudinary URL to its attachment variant; pass anything else through. */
function forceDownloadUrl(url) {
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|raw|video)\/upload\/)(.*)$/i);
  return m ? `${m[1]}fl_attachment/${m[2]}` : url;
}

export async function downloadFile(url, filename) {
  if (!url) return;
  // Only ever send the admin cookie to our own backend. A cross-origin file (e.g. a Cloudinary
  // resumeUrl) is public, so open it directly instead of a credentialed fetch, and use the
  // attachment variant so it downloads rather than opening inline.
  if (!url.startsWith(API_BASE)) {
    window.open(forceDownloadUrl(url), '_blank', 'noopener');
    return;
  }
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = obj;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(obj), 1000);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

/** A sensible download filename for a candidate's resume: the stored file's own name if it has
 *  one, otherwise "<candidate-name>-resume". */
export function resumeFilename(app) {
  const base = decodeURIComponent((app.resumeUrl || '').split('?')[0].split('/').pop() || '');
  if (base && base.includes('.')) return base;
  const name = (app.name || 'candidate').trim().replace(/\s+/g, '-');
  return `${name}-resume`;
}
