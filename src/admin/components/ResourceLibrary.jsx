import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, ExternalLink, FileText, Image as ImageIcon, Presentation, UploadCloud } from 'lucide-react';
import { portalDownloads } from '../../data/content';
import { api, API_BASE } from '../api/client';
import { useAdminAuth } from '../auth/AdminAuthContext';
import { moduleAccess } from '../auth/roles';
import { fmtSize } from '../formatSize';

/**
 * Resource Library — the dashboard card that holds every KEAA file the team may need:
 * the product catalogues (the only ones also published on the public Downloads Center),
 * the company and product presentations, the brand logo artwork, and the files uploaded
 * through the Downloads / Certificates module.
 *
 * The whole card is readable by EVERY signed-in role. The first three groups read the static
 * list in data/content.js, so they hit no endpoint and check no permission at all; add a file
 * by editing `portalDownloads`. The fourth lists what has been uploaded through the Downloads
 * / Certificates module: SecurityConfig lets any authenticated staff member GET those, and
 * only the content roles (MODULES.downloads) upload or delete, which is why the Manage link
 * is the one thing here that is gated.
 */

/* Flatten grouped entries (the brand logos) into one tile per file, so every resource in the
   library is a single click. Same-origin files carry `filename` and save straight to disk;
   SharePoint links open in a new tab, where they can be viewed and downloaded. */
const ITEMS = portalDownloads.flatMap((d) =>
  d.files
    ? d.files.map((f) => ({ title: f.label, type: d.type, group: d.group, url: f.url, filename: f.filename }))
    : [d],
);

const GROUP_META = {
  Catalogues: {
    icon: FileText,
    tint: 'bg-primary/10 text-primary-darker',
    note: 'Also published on the public Downloads Center.',
  },
  Presentations: {
    icon: Presentation,
    tint: 'bg-amber-100 text-amber-700',
    note: 'Internal decks, not published on the website.',
  },
  'Brand Assets': {
    icon: ImageIcon,
    tint: 'bg-emerald-100 text-emerald-700',
    note: 'Logo artwork for documents, decks and print.',
  },
};

// Group in the order the groups first appear in the data, so display order stays with content.js.
const GROUPS = [...new Set(ITEMS.map((i) => i.group))].map((name) => ({
  name,
  meta: GROUP_META[name] || { icon: FileText, tint: 'bg-slate-100 text-slate-600', note: '' },
  items: ITEMS.filter((i) => i.group === name),
}));

/**
 * List the uploaded files. Open to every signed-in role, so this is not permission-gated —
 * a failure just hides the list behind a quiet line rather than a red alert, since this is a
 * secondary card and an older backend (before GET /api/downloads was opened to everyone)
 * still answers 403 for HR and Employee.
 */
function useUploadedFiles() {
  const [files, setFiles] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .get('/api/downloads')
      .then((rows) => alive && setFiles(rows || []))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  return { files, failed, loading: !files && !failed };
}

export default function ResourceLibrary() {
  const { role } = useAdminAuth();
  const canManage = moduleAccess(role, 'downloads') === 'manage';
  const { files, failed, loading } = useUploadedFiles();
  const total = ITEMS.length + (files?.length || 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-bold text-navy-900">Resource Library</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Catalogues, presentations, brand artwork and uploaded certificates. Every team member
            can download all of it.
          </p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {total} files
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {GROUPS.map(({ name, meta, items }) => (
          <section key={name} className="px-5 py-4">
            <GroupHeader icon={meta.icon} tint={meta.tint} name={name} count={items.length} note={meta.note} />
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <FileTile
                  key={item.url}
                  href={item.url}
                  title={item.title}
                  meta={item.type}
                  filename={item.filename}
                />
              ))}
            </ul>
          </section>
        ))}

        <section className="px-5 py-4">
          <GroupHeader
            icon={UploadCloud}
            tint="bg-sky-100 text-sky-700"
            name="Uploaded Files"
            count={files?.length}
            note="Certificates and documents added in Downloads / Certificates."
            action={
              canManage && (
                <Link to="/portal/downloads" className="ml-auto text-xs font-semibold text-primary-darker hover:underline">
                  Manage
                </Link>
              )
            }
          />

          {loading && (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="h-[58px] animate-pulse rounded-lg border border-slate-100 bg-slate-50" />
              ))}
            </ul>
          )}

          {failed && <p className="mt-3 text-sm text-slate-400">Uploaded files could not be loaded right now.</p>}

          {files?.length === 0 && <p className="mt-3 text-sm text-slate-400">Nothing uploaded yet.</p>}

          {files?.length > 0 && (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {files.map((f) => (
                <FileTile
                  key={f.id}
                  href={`${API_BASE}/api/downloads/${f.id}/file`}
                  title={f.title}
                  meta={`${f.category || 'File'} · ${fmtSize(f.size)}`}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function GroupHeader({ icon: Icon, tint, name, count, note, action }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tint}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h3 className="text-sm font-semibold text-navy-900">{name}</h3>
      {count != null && (
        <span className="text-xs text-slate-400">
          {count} {count === 1 ? 'file' : 'files'}
        </span>
      )}
      {note && <span className="text-xs text-slate-400">· {note}</span>}
      {action}
    </div>
  );
}

/**
 * One resource. A `filename` means the file is served same-origin, so the `download`
 * attribute saves it straight to disk; everything else (SharePoint, the backend's file
 * endpoint) is cross-origin, where `download` is ignored and a new tab is the honest
 * behaviour — the browser saves it anyway when the response says to.
 */
function FileTile({ href, title, meta, filename }) {
  const saves = Boolean(filename);
  const attrs = saves ? { download: filename } : { target: '_blank', rel: 'noopener noreferrer' };
  const Icon = saves ? Download : ExternalLink;

  return (
    <li>
      <a
        href={href}
        {...attrs}
        title={title}
        aria-label={`${saves ? 'Download' : 'Open'} ${title}`}
        className="group flex items-center gap-3 rounded-lg border border-slate-100 px-3.5 py-3 transition-colors hover:border-primary/40 hover:bg-slate-50"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-navy-800">{title}</span>
          <span className="block truncate text-xs text-slate-400">{meta}</span>
        </span>
        <Icon className="h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-primary-darker" />
      </a>
    </li>
  );
}
