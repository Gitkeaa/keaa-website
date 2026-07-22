import { Mail } from 'lucide-react';
import { EMAIL_TEMPLATES } from './atsConfig';
import { logEmail } from './careersStore';

/**
 * Template email buttons. Each opens the HR user's own mail client (mailto) pre-filled from the
 * template, and records the send on the candidate's activity timeline. Server-sent automation is
 * a Phase 2 backend job; composing from the mailbox works today (same idea as the RFQ/Contact
 * reach-out shortcuts).
 */
export default function EmailComposer({ app, by, disabled }) {
  const send = (tpl) => {
    const subject = tpl.subject(app);
    const body = tpl.body(app);
    const href = `mailto:${app.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(href, '_self');
    logEmail(app.id, tpl.label, by);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {EMAIL_TEMPLATES.map((tpl) => (
        <button
          key={tpl.key}
          type="button"
          disabled={disabled || !app.email}
          onClick={() => send(tpl)}
          title={!app.email ? 'No email on file for this applicant' : `Compose: ${tpl.label}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Mail className="h-3.5 w-3.5" /> {tpl.label}
        </button>
      ))}
    </div>
  );
}
