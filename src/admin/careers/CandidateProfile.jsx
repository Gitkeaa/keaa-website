import { useEffect, useState } from 'react';
import { Mail, Phone, Linkedin, MapPin, Briefcase, GraduationCap, Clock, Building2, ExternalLink } from 'lucide-react';
import Modal from '../components/Modal';
import { initials, statusMeta, PIPELINE, STATUSES, STATUS_FORMS, fmtDate, fmtDateTime, safeUrl } from './atsConfig';
import { changeStatus, addNote, setRating, timelineFor } from './careersStore';
import StatusBadge from './StatusBadge';
import ResumePreview from './ResumePreview';
import EmailComposer from './EmailComposer';
import StatusChangeModal, { StarInput } from './StatusChangeModal';

/**
 * The full candidate workspace: parsed candidate info, resume preview, the status workflow
 * (with mandatory-field gates), a 5-star rating, internal HR notes, email templates and the
 * activity timeline. Mirrors the InquiryManager detail pattern. HR / Super Admin manage; Admin
 * sees everything read-only.
 */
export default function CandidateProfile({ app, open, onClose, canManage, by }) {
  const [target, setTarget] = useState('');
  const [modalTarget, setModalTarget] = useState(null);
  const [note, setNote] = useState('');

  // Reset the per-candidate draft state whenever a different candidate is opened. The modal stays
  // mounted while closed (it returns null below), so without this the previous candidate's note
  // draft or status selection would bleed onto the next one.
  useEffect(() => {
    setNote('');
    setTarget('');
    setModalTarget(null);
  }, [app?.id]);

  if (!app) return null;
  const p = app.parsed;
  const timeline = timelineFor(app);

  const applyStatus = (to) => {
    if (!to || to === app.status) return;
    if (STATUS_FORMS[to]) { setModalTarget(to); return; }
    changeStatus(app.id, to, { by, from: app.status });
    setTarget('');
  };
  const confirmModal = (extra) => {
    changeStatus(app.id, modalTarget, { by, from: app.status, extra, remark: extra.note || extra.feedback || extra.reason || '' });
    setModalTarget(null);
    setTarget('');
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Candidate Profile" maxWidth="max-w-3xl">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-primary-dark font-display text-lg font-bold text-white">{initials(app.name)}</span>
              <div>
                <p className="font-display text-xl font-bold text-navy-900">{app.name || 'Unnamed applicant'}</p>
                <p className="text-sm text-slate-500">{app.position || 'Applicant'}{app.location ? ` · ${app.location}` : ''}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <StatusBadge status={app.status} />
                  <StarInput value={app.rating} readOnly />
                </div>
              </div>
            </div>
            <ContactRow app={app} />
          </div>

          {/* Info grid */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm sm:grid-cols-3">
            <Info icon={Mail} label="Email" value={app.email} />
            <Info icon={Phone} label="Phone" value={app.phone} />
            <Info icon={MapPin} label="Location" value={app.location} />
            <Info icon={Briefcase} label="Experience" value={app.experience} />
            <Info icon={GraduationCap} label="Qualification" value={p.qualification} />
            <Info icon={Clock} label="Notice Period" value={p.notice} />
            <Info icon={Building2} label="Current Employer" value={p.employer} />
            <Info icon={Briefcase} label="Applied For" value={app.position} />
            <Info label="Applied On" value={fmtDate(app.createdAt)} />
            {p.linkedin && (
              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs text-slate-400">LinkedIn / Portfolio</dt>
                <dd>
                  {safeUrl(p.linkedin) ? (
                    <a href={safeUrl(p.linkedin)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary-dark hover:text-primary-darker"><Linkedin className="h-3.5 w-3.5" />{p.linkedin}</a>
                  ) : (
                    <span className="break-all text-slate-700">{p.linkedin}</span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          {/* Cover message */}
          {p.message && (
            <div>
              <p className="mb-1 text-sm font-semibold text-navy-900">Cover Message</p>
              <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{p.message}</p>
            </div>
          )}

          {/* Resume */}
          <div>
            <p className="mb-1.5 text-sm font-semibold text-navy-900">Resume / CV</p>
            <ResumePreview app={app} />
          </div>

          {/* Pipeline progress */}
          <div>
            <p className="mb-2 text-sm font-semibold text-navy-900">Pipeline</p>
            <div className="flex flex-wrap gap-1">
              {PIPELINE.map((s) => {
                const active = app.status === s;
                const passed = PIPELINE.indexOf(s) <= PIPELINE.indexOf(app.status);
                const m = statusMeta(s);
                return <span key={s} className={`rounded px-2 py-1 text-[11px] font-semibold ${active ? m.badge : passed ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-300'}`}>{m.label}</span>;
              })}
              {app.status === 'rejected' && <span className={`rounded px-2 py-1 text-[11px] font-semibold ${statusMeta('rejected').badge}`}>Rejected</span>}
            </div>
          </div>

          {/* Status control */}
          {canManage ? (
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-navy-900">Update status</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary">
                  <option value="">Move to...</option>
                  {STATUSES.filter((s) => s.key !== app.status).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <button type="button" onClick={() => applyStatus(target)} disabled={!target} className="rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker disabled:opacity-50">Update</button>
                <span className="ml-auto flex items-center gap-2 text-xs text-slate-500">Rating<StarInput value={app.rating} onChange={(n) => setRating(app.id, n, by)} /></span>
              </div>
              {app.interview && <Detail title="Interview" lines={[`${app.interview.date || ''} ${app.interview.time || ''}`.trim(), app.interview.mode, app.interview.interviewer && `Interviewer: ${app.interview.interviewer}`, app.interview.link].filter(Boolean)} />}
              {app.offer && <Detail title="Offer" lines={[app.offer.salary && `Salary: ${app.offer.salary}`, app.offer.joiningDate && `Joining: ${app.offer.joiningDate}`, app.offer.offerLetter && `Letter: ${app.offer.offerLetter}`].filter(Boolean)} />}
              {app.rejection && <Detail title="Rejection" lines={[app.rejection.reason, app.rejection.note].filter(Boolean)} />}
            </div>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">View only. The job-application workflow is managed by HR.</p>
          )}

          {/* Email templates */}
          {canManage && (
            <div>
              <p className="mb-1.5 text-sm font-semibold text-navy-900">Send Email</p>
              <EmailComposer app={app} by={by} />
            </div>
          )}

          {/* Internal notes */}
          <div>
            <p className="mb-1.5 text-sm font-semibold text-navy-900">Internal HR Notes <span className="font-normal text-slate-400">(private)</span></p>
            {app.hrNotes.length > 0 && (
              <ul className="mb-2 space-y-1.5">
                {app.hrNotes.map((n, i) => (
                  <li key={i} className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-slate-700">
                    <p>{n.text}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{n.by} · {fmtDateTime(n.at)}</p>
                  </li>
                ))}
              </ul>
            )}
            {canManage && (
              <div className="flex items-center gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note..." className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary" />
                <button type="button" onClick={() => { addNote(app.id, note, by); setNote(''); }} disabled={!note.trim()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-slate-50 disabled:opacity-50">Add</button>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-2 text-sm font-semibold text-navy-900">Application Timeline</p>
            <ol className="space-y-3 border-l border-slate-200 pl-4">
              {timeline.slice().reverse().map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary-dark ring-4 ring-white" />
                  <p className="text-sm text-navy-800">{eventText(e)}</p>
                  {e.remark && e.action !== 'created' && <p className="text-xs text-slate-500">{e.remark}</p>}
                  <p className="text-xs text-slate-400">{fmtDateTime(e.at)} · {e.by || 'System'}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Modal>

      <StatusChangeModal open={Boolean(modalTarget)} target={modalTarget} onClose={() => setModalTarget(null)} onConfirm={confirmModal} />
    </>
  );
}

function eventText(e) {
  if (e.action === 'created') return 'Application received';
  if (e.action === 'status') return <>Moved {e.from ? `${statusMeta(e.from).label} to ` : 'to '}<strong>{statusMeta(e.to).label}</strong></>;
  if (e.action === 'note') return 'Internal note added';
  if (e.action === 'rating') return 'Rating updated';
  if (e.action === 'email') return e.remark || 'Email sent';
  return e.remark || 'Updated';
}

function Info({ icon: Icon, label, value }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-slate-400">{Icon && <Icon className="h-3 w-3" />}{label}</dt>
      <dd className="font-medium text-navy-800">{value || <span className="text-slate-300">Not provided</span>}</dd>
    </div>
  );
}

function Detail({ title, lines }) {
  if (!lines.length) return null;
  return (
    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      {lines.map((l, i) => <p key={i} className="text-slate-700">{l}</p>)}
    </div>
  );
}

function ContactRow({ app }) {
  const digits = (app.phone || '').replace(/[^\d]/g, '');
  const items = [
    app.email && { href: `mailto:${app.email}`, icon: <Mail className="h-4 w-4" />, title: `Email ${app.email}`, ext: false },
    app.email && { href: `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(app.email)}`, icon: <ExternalLink className="h-4 w-4" />, title: 'Compose in Outlook', ext: true },
    digits && { href: `https://wa.me/${digits}`, icon: <WhatsApp className="h-4 w-4" />, title: `WhatsApp ${app.phone}`, ext: true, cls: 'text-[#25D366]' },
    app.phone && { href: `tel:${app.phone}`, icon: <Phone className="h-4 w-4" />, title: `Call ${app.phone}`, ext: false },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="flex items-center gap-1.5">
      {items.map((a, i) => (
        <a key={i} href={a.href} title={a.title} aria-label={a.title} {...(a.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 ${a.cls || ''}`}>
          {a.icon}
        </a>
      ))}
    </div>
  );
}

/* lucide has no WhatsApp glyph; same mark used by InquiryManager. */
function WhatsApp({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.89-.8-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.56-.35zM12.02 21.5h-.01c-1.68 0-3.33-.45-4.77-1.3l-.34-.2-3.55.93.95-3.46-.22-.36a9.4 9.4 0 01-1.44-5.02c0-5.2 4.24-9.44 9.46-9.44 2.53 0 4.9.99 6.68 2.78a9.36 9.36 0 012.76 6.67c-.01 5.2-4.24 9.45-9.46 9.45zM20.48 3.5A11.28 11.28 0 0012.02 0C5.75 0 .64 5.1.64 11.39c0 2 .53 3.96 1.53 5.69L.5 24l7.09-1.86a11.36 11.36 0 005.43 1.39h.01c6.27 0 11.38-5.11 11.38-11.4 0-3.04-1.19-5.9-3.34-8.03z" />
    </svg>
  );
}
