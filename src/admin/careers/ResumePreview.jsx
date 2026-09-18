import { FileText, Download, ExternalLink } from 'lucide-react';
import { resolveUpload, isOwnApiUrl } from '../api/client';
import { downloadFile, resumeFilename } from './download';

/**
 * Resume preview + download. Renders an inline PDF when a stored resumeUrl exists; otherwise the
 * honest "not received" state. The public form cannot deliver the file until the backend stores
 * multipart uploads (see src/data/adminApi.js), so most rows land in the empty state today and
 * flip to a live preview the moment a resumeUrl is present.
 */
export default function ResumePreview({ app }) {
  const url = app.resumeUrl ? resolveUpload(app.resumeUrl) : null;

  if (!url) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        <p className="font-medium text-slate-600">Resume not received</p>
        <p className="mt-0.5 text-xs">
          {app.parsed.resumeFlag || 'The applicant did not attach a file, or the server has not stored it yet. Request it directly from the candidate.'}
        </p>
      </div>
    );
  }

  const isPdf = /\.pdf($|\?)/i.test(url);
  // Only frame files from a trusted host: our own backend, or Cloudinary (where resumes are
  // stored). resolveUpload passes absolute URLs through, so an attacker-influenced resumeUrl
  // could otherwise frame arbitrary external content inside the authenticated console.
  const framable = isPdf && (isOwnApiUrl(url) || /^https:\/\/res\.cloudinary\.com\//i.test(url));
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-800">
          <FileText className="h-4 w-4 text-primary-dark" /> Resume
        </span>
        <span className="flex items-center gap-3">
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:text-primary-darker">
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>
          <button type="button" onClick={() => downloadFile(url, resumeFilename(app))} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:text-primary-darker">
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </span>
      </div>
      {framable ? (
        <iframe src={url} title="Resume preview" className="h-80 w-full" />
      ) : (
        <p className="p-3 text-xs text-slate-500">Inline preview is available for PDF files served by the backend. Use Open or Download for this file.</p>
      )}
    </div>
  );
}
