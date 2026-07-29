import { useCallback, useEffect, useRef, useState } from 'react';
import { cldImage } from '../../data/cloudinary';
import { useLT } from '../../i18n/LocaleContext';

/**
 * Full-screen image viewer for the photo gallery: click a tile, see it large, step through
 * the set with the arrows / arrow keys, close with × / Esc / a backdrop click.
 *
 * Rendered inline and only while open (index is a number) — so at prerender time it is not
 * in the DOM and cannot ship as dead markup, and it needs no portal because `fixed inset-0`
 * already covers the viewport wherever it sits in the tree.
 *
 * `items` is the list of Cloudinary public_ids to page through; `index` is the position in
 * that list (or null when closed).
 *
 * OPENS INSTANTLY: a tiny 400px version (the grid tile has usually cached it, and if not it
 * is ~30 KB) is shown blurred the moment the viewer opens, so there is never a blank dark
 * screen while the sharp copy downloads. The full image is asked for at 1280px — enough to
 * fill a screen, roughly half the bytes of 1600 — and fades in over the placeholder once it
 * has loaded. `ready` resets every time the shown image changes.
 */
export default function Lightbox({ items, index, onClose, onIndex, alt = () => '' }) {
  const lt = useLT('gallery');
  const open = index !== null && index !== undefined;
  const closeRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false); // the full-res of the newly-shown image has not loaded yet
  }, [index]);

  const go = useCallback(
    (n) => {
      if (!items.length) return;
      onIndex((n + items.length) % items.length); // wrap at both ends
    },
    [items.length, onIndex]
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // stop the page scrolling behind the overlay
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, go, onClose]);

  // Warm the neighbours so stepping left/right shows instantly. Only two extra requests, and
  // only while the viewer is open, so it does not weigh on the grid or waste bandwidth.
  useEffect(() => {
    if (!open || items.length < 2) return;
    [index - 1, index + 1].forEach((n) => {
      const img = new Image();
      img.src = cldImage(items[(n + items.length) % items.length], { w: 1280 });
    });
  }, [open, index, items]);

  if (!open) return null;
  const id = items[index];
  const ctrl =
    'absolute flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={lt('lightbox.label', 'Image viewer')}
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-navy-950/95 p-4"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={lt('lightbox.close', 'Close')}
        className={`${ctrl} right-3 top-3 h-11 w-11 text-2xl leading-none sm:right-5 sm:top-5`}
      >
        &times;
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(index - 1);
        }}
        aria-label={lt('lightbox.prev', 'Previous image')}
        className={`${ctrl} left-2 top-1/2 h-12 w-12 -translate-y-1/2 text-3xl leading-none sm:left-5`}
      >
        &lsaquo;
      </button>

      {/* A FIXED box (not sized by either image), so both images object-contain into the same
          area — the small blurred one shows instantly, the sharp one fades in over it with no
          size jump. Sizing the box off the tiny placeholder instead would shrink the whole
          viewer to 400px. */}
      <div
        className="relative flex h-[86vh] w-[92vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={cldImage(id, { w: 400 })}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain blur-md"
        />
        <img
          src={cldImage(id, { w: 1280 })}
          alt={alt(id)}
          onLoad={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          go(index + 1);
        }}
        aria-label={lt('lightbox.next', 'Next image')}
        className={`${ctrl} right-2 top-1/2 h-12 w-12 -translate-y-1/2 text-3xl leading-none sm:right-5`}
      >
        &rsaquo;
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
        {lt('lightbox.counter', '{current} / {total}', { current: index + 1, total: items.length })}
      </div>
    </div>
  );
}
