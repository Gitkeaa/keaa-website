import { useState } from 'react';
import { Eye, FileText } from 'lucide-react';
import Button from '../ui/Button';
import CertificateViewer from './CertificateViewer';
import { certificateThumbUrl } from '../../data/certificateDocuments';
import { useLT } from '../../i18n/LocaleContext';

/**
 * One PDF certificate card.
 *
 * Deliberately the same box as the image cards above it on the Certifications page: same
 * border, radius, shadow, hover lift, same picture frame and the same title / scope / note
 * stack underneath.
 *
 * VIEW ONLY. The button opens the in-page viewer (CertificateViewer) rather than linking at
 * the .pdf, because a link to the .pdf opens the browser's own PDF viewer and that comes with
 * Download and Print in its toolbar. Nothing here references the document file at all, only
 * pictures of its pages. See the note at the top of CertificateViewer for what that does and
 * does not actually prevent.
 *
 * THE THUMBNAIL IS ALLOWED TO FAIL. Cloudinary refuses PDF delivery until an account setting
 * is turned on, and a PDF uploaded as `raw` cannot be rendered as a picture at all (both are
 * spelled out at the top of data/certificateDocuments.js). Either way the request comes back
 * an error, and a broken-image glyph in the middle of a certification page is worse than no
 * picture. The frame falls back to a document mark at the same height, so the row still lines
 * up and the button still opens the viewer.
 */
export default function CertificateDocCard({ doc }) {
  const lt = useLT('certifications');
  const [thumbFailed, setThumbFailed] = useState(false);
  const [open, setOpen] = useState(false);

  const thumbUrl = certificateThumbUrl(doc.pdf);
  const showThumb = Boolean(thumbUrl) && !thumbFailed;

  // A slot with nothing pasted into it is not a card. The page filters these out already;
  // this is the second gate, so the component can never render a button that opens nothing.
  if (!thumbUrl) return null;

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-card border border-navy-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover">
        {/* The whole picture is a second way into the viewer, because a certificate thumbnail
            is the thing people instinctively click. `tabIndex -1` and `aria-hidden` keep it
            out of the tab order: the real control is the button below, and two stops that do
            the same thing is noise on a keyboard. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          tabIndex={-1}
          aria-hidden
          className="block cursor-zoom-in overflow-hidden border-b border-navy-100 bg-navy-50/40 p-4 text-left"
        >
          {showThumb ? (
            <img
              src={thumbUrl}
              alt=""
              loading="lazy"
              draggable={false}
              onError={() => setThumbFailed(true)}
              onContextMenu={(e) => e.preventDefault()}
              className="mx-auto max-h-[440px] w-auto select-none object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            /* `aspect-[1/1.414]` is A4, so the placeholder occupies the same shape the real
               first page would, and a card that falls back does not become shorter than the
               cards beside it. */
            <div className="mx-auto flex aspect-[1/1.414] max-h-[440px] w-full max-w-[311px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-navy-200 bg-white">
              <FileText aria-hidden className="h-10 w-10 text-navy-300" strokeWidth={1.5} />
              <p className="px-6 text-center text-xs font-semibold uppercase tracking-wide text-muted">
                {lt('docs.previewUnavailable', 'Preview unavailable')}
              </p>
            </div>
          )}
        </button>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-semibold text-text">{doc.name}</h3>
          {/* `body` is optional: a certificate whose issuing body is named on the document
              itself does not need one invented for it here, and the comma has to go with it
              or the line ends in dangling punctuation. */}
          {(doc.scope || doc.body) && (
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-primary-darker">
              {[doc.scope, doc.body].filter(Boolean).join(', ')}
            </p>
          )}
          {doc.note && <p className="mt-2 text-body-compact leading-relaxed text-ink">{doc.note}</p>}

          {/* `mt-auto` pins the button to the bottom of the card, so a row of cards with notes
              of different lengths still has its buttons on one line. */}
          <div className="mt-auto pt-4">
            <Button onClick={() => setOpen(true)} variant="outlineNavy" size="sm" icon={Eye}>
              {lt('docs.view', 'View Certificate')}
            </Button>
          </div>
        </div>
      </div>

      {open && <CertificateViewer doc={doc} onClose={() => setOpen(false)} />}
    </>
  );
}
