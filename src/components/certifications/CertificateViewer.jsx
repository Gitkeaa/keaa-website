import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { certificatePageUrl, certificatePageCount } from '../../data/certificateDocuments';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLT } from '../../i18n/LocaleContext';

/**
 * View-only certificate viewer: the WHOLE document, scrolled top to bottom.
 *
 * Every page is stacked in one scrolling column rather than shown one at a time behind
 * arrows. A certificate is read straight through, and a five-page attestation behind a pager
 * asks the reader to discover that pages two to five exist at all.
 *
 * WHY THIS EXISTS RATHER THAN A LINK TO THE PDF. Opening the .pdf in a tab hands the visitor
 * the browser's own PDF viewer, and that viewer has Download and Print buttons built into its
 * toolbar. The owner asked for view-only, so the certificate is shown here as page pictures
 * instead and the .pdf is never linked, never in the markup, and never fetched. There is no
 * document on offer, so there is nothing to download.
 *
 * WHAT THIS DOES NOT DO, stated plainly so nobody later mistakes it for protection: anything
 * a browser can display, a determined visitor can keep. The page images are ordinary <img>
 * elements, so they are in the network tab and a screenshot always works. The right-click
 * menu and image dragging are turned off below, which stops the casual "save image as", and
 * that is the honest limit of what any website can do. Real control needs a document service
 * that streams watermarked, permission-checked pages, which is a different piece of work.
 */
export default function CertificateViewer({ doc, onClose }) {
  const lt = useLT('certifications');
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  // Null until the probe finishes. Page one renders throughout, so the reader is never
  // looking at a spinner while the length is worked out.
  const [pageCount, setPageCount] = useState(null);

  useFocusTrap(panelRef, { active: true, onEscape: onClose });

  useEffect(() => {
    const ac = new AbortController();
    let live = true;
    certificatePageCount(doc, ac.signal).then((n) => {
      if (live) setPageCount(n);
    });
    return () => {
      live = false;
      ac.abort();
    };
  }, [doc]);

  // The page behind must not scroll while this is over it. The column below does the
  // scrolling instead.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => closeRef.current?.focus(), []);

  const pages = Array.from({ length: pageCount || 1 }, (_, i) => i + 1);

  return (
    <div
      className="fixed inset-0 z-[95] flex flex-col bg-navy-950/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={lt('docs.viewerAria', '{name}, certificate viewer', { name: doc.name })}
      /* A backdrop click closes, but only a click on the backdrop ITSELF — `currentTarget`
         rather than a contains() check, so a drag that starts on a page and ends outside
         does not count as a dismissal. */
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={panelRef} className="flex h-full flex-col">
        <div className="flex flex-shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-white sm:text-base">{doc.name}</p>
            {pageCount > 1 && (
              <p className="text-xs text-white/70">{lt('docs.pages', '{total} pages', { total: pageCount })}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={lt('docs.close', 'Close the certificate viewer')}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X aria-hidden className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {/*
          The scrolling column. `tabIndex 0` because a scrollable region that cannot take
          focus cannot be scrolled from the keyboard at all, which would leave a keyboard user
          able to open a five-page certificate and read only the first page.

          Clicks inside here must NOT reach the backdrop handler above, or scrolling by
          clicking the track, or any click that lands in the padding between pages, would
          close the viewer.
        */}
        <div
          tabIndex={0}
          onClick={(e) => e.stopPropagation()}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-4 sm:px-6"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {pages.map((n) => (
              /*
                Each page sits in a fixed A4 box rather than sizing itself to the picture.
                Certificates are A4, and a box that is only as tall as an image that has not
                arrived yet means the whole column reflows underneath the reader as each page
                loads. Reserving the shape keeps the scrollbar honest from the first frame.
                A landscape page letterboxes inside it, which is the rarer case and still
                legible, and `object-contain` means nothing is ever cropped.
              */
              <div key={n} className="relative w-full overflow-hidden rounded-card bg-white shadow-2xl">
                <div className="aspect-[1/1.414] w-full">
                  <img
                    src={certificatePageUrl(doc.pdf, n, 1400)}
                    alt={lt('docs.pageAlt', '{name}, page {page}', { name: doc.name, page: n })}
                    /* Page one is what the reader is looking at the moment this opens, so it
                       is fetched eagerly; the rest wait until they are scrolled towards. */
                    loading={n === 1 ? 'eager' : 'lazy'}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                    className="h-full w-full select-none object-contain"
                  />
                </div>
                {pageCount > 1 && (
                  <span className="pointer-events-none absolute bottom-2 right-3 rounded-full bg-navy-950/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {lt('docs.pageOf', 'Page {page} of {total}', { page: n, total: pageCount })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
