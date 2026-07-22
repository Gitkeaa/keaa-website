/**
 * Applicant Tracking System configuration — the single source of truth for the careers
 * pipeline: statuses and their badge colours, the mandatory-field forms each status demands,
 * rejection reasons, and the candidate-facing email templates. Plus small helpers shared
 * across the ATS screens (parse the public "notes" blob, avatar initials, date formatting).
 *
 * Status keys are lowercase-hyphenated to match the existing careers convention and StatusPill.
 */

export const STATUSES = [
  { key: 'new', label: 'New', badge: 'bg-blue-100 text-blue-700 ring-blue-600/20' },
  { key: 'under-review', label: 'Under Review', badge: 'bg-amber-100 text-amber-700 ring-amber-600/20' },
  { key: 'shortlisted', label: 'Shortlisted', badge: 'bg-indigo-100 text-indigo-700 ring-indigo-600/20' },
  { key: 'interview-scheduled', label: 'Interview Scheduled', badge: 'bg-violet-100 text-violet-700 ring-violet-600/20' },
  { key: 'interview-completed', label: 'Interview Completed', badge: 'bg-purple-100 text-purple-700 ring-purple-600/20' },
  { key: 'technical-round', label: 'Technical Round', badge: 'bg-cyan-100 text-cyan-700 ring-cyan-600/20' },
  { key: 'hr-round', label: 'HR Round', badge: 'bg-teal-100 text-teal-700 ring-teal-600/20' },
  { key: 'selected', label: 'Selected', badge: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20' },
  { key: 'offer-sent', label: 'Offer Sent', badge: 'bg-green-100 text-green-700 ring-green-600/20' },
  { key: 'offer-accepted', label: 'Offer Accepted', badge: 'bg-green-100 text-green-700 ring-green-600/20' },
  { key: 'joined', label: 'Joined', badge: 'bg-emerald-200 text-emerald-800 ring-emerald-700/25' },
  { key: 'closed', label: 'Closed', badge: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  { key: 'rejected', label: 'Rejected', badge: 'bg-red-100 text-red-700 ring-red-600/20' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.key, s]));

/** The linear "good path" pipeline, used to draw progress. `rejected` is a terminal branch. */
export const PIPELINE = [
  'new', 'under-review', 'shortlisted', 'interview-scheduled', 'interview-completed',
  'technical-round', 'hr-round', 'selected', 'offer-sent', 'offer-accepted', 'joined', 'closed',
];

/** Map legacy/backend status strings onto our vocabulary. The old careers page used
 *  'interview' and 'hired'; normalise those so existing rows land in the new pipeline. */
const ALIASES = { interview: 'interview-scheduled', hired: 'joined', 'in-review': 'under-review', review: 'under-review' };
export function normalizeStatus(s) {
  const v = String(s || 'new').toLowerCase().trim().replace(/_/g, '-');
  if (STATUS_MAP[v]) return v;
  return ALIASES[v] || 'new';
}
export const statusMeta = (key) => STATUS_MAP[normalizeStatus(key)] || STATUS_MAP.new;

export const REJECTION_REASONS = ['Skills Mismatch', 'Experience', 'Salary Expectation', 'Communication', 'Position Closed', 'Other'];
export const INTERVIEW_MODES = ['Online', 'In-person', 'Phone'];

/**
 * Mandatory-field forms per target status. Moving a candidate INTO one of these statuses opens
 * StatusChangeModal, which requires every `required` field before the move commits.
 */
export const STATUS_FORMS = {
  'interview-scheduled': {
    title: 'Schedule Interview',
    fields: [
      { name: 'date', label: 'Interview Date', type: 'date', required: true },
      { name: 'time', label: 'Interview Time', type: 'time', required: true },
      { name: 'mode', label: 'Interview Mode', type: 'select', required: true, options: INTERVIEW_MODES },
      { name: 'interviewer', label: 'Interviewer', type: 'text', required: true, placeholder: 'Name of the interviewer' },
      { name: 'link', label: 'Meeting Link', type: 'url', required: false, placeholder: 'https:// (optional)' },
    ],
  },
  'interview-completed': {
    title: 'Interview Feedback',
    fields: [
      { name: 'rating', label: 'Rating', type: 'rating', required: true },
      { name: 'feedback', label: 'Feedback', type: 'textarea', required: true, placeholder: 'How did the interview go?' },
    ],
  },
  rejected: {
    title: 'Reject Application',
    fields: [
      { name: 'reason', label: 'Rejection Reason', type: 'select', required: true, options: REJECTION_REASONS },
      { name: 'note', label: 'Note', type: 'textarea', required: false, placeholder: 'Optional internal note' },
    ],
  },
  'offer-sent': {
    title: 'Send Offer',
    fields: [
      { name: 'salary', label: 'Offered Salary', type: 'text', required: true, placeholder: 'e.g. 8,00,000 / year' },
      { name: 'joiningDate', label: 'Joining Date', type: 'date', required: true },
      { name: 'offerLetter', label: 'Offer Letter', type: 'file', required: false },
    ],
  },
};

/** Candidate-facing email templates. Plain text, no em dashes (the client reads those as
 *  machine-written). Opened via mailto / Outlook, so HR sends from their own mailbox. */
export const EMAIL_TEMPLATES = [
  {
    key: 'received',
    label: 'Application Received',
    subject: (c) => `Your application to KEAA International: ${c.position || 'your role'}`,
    body: (c) => `Dear ${c.name},\n\nThank you for applying for the ${c.position || 'advertised'} position at KEAA International. We have received your application and our HR team is reviewing it. We will be in touch with the next steps.\n\nWarm regards,\nKEAA International HR Team`,
  },
  {
    key: 'interview',
    label: 'Interview Invitation',
    subject: (c) => `Interview invitation, KEAA International`,
    body: (c) => {
      const iv = c.interview || {};
      const when = [iv.date, iv.time].filter(Boolean).join(' at ');
      return `Dear ${c.name},\n\nWe are pleased to invite you to an interview for the ${c.position || ''} role at KEAA International.\n\n${when ? `Date and time: ${when}\n` : ''}${iv.mode ? `Mode: ${iv.mode}\n` : ''}${iv.link ? `Meeting link: ${iv.link}\n` : ''}${iv.interviewer ? `Interviewer: ${iv.interviewer}\n` : ''}\nPlease confirm your availability by replying to this email.\n\nWarm regards,\nKEAA International HR Team`;
    },
  },
  {
    key: 'reminder',
    label: 'Interview Reminder',
    subject: () => `Reminder: your interview with KEAA International`,
    body: (c) => {
      const iv = c.interview || {};
      const when = [iv.date, iv.time].filter(Boolean).join(' at ');
      return `Dear ${c.name},\n\nThis is a friendly reminder about your upcoming interview for the ${c.position || ''} role at KEAA International.\n\n${when ? `Date and time: ${when}\n` : ''}${iv.mode ? `Mode: ${iv.mode}\n` : ''}${iv.link ? `Meeting link: ${iv.link}\n` : ''}\nWe look forward to speaking with you.\n\nWarm regards,\nKEAA International HR Team`;
    },
  },
  {
    key: 'offer',
    label: 'Offer Letter',
    subject: () => `Offer of employment, KEAA International`,
    body: (c) => {
      const of = c.offer || {};
      return `Dear ${c.name},\n\nCongratulations! We are delighted to offer you the ${c.position || ''} position at KEAA International.\n\n${of.salary ? `Offered compensation: ${of.salary}\n` : ''}${of.joiningDate ? `Proposed joining date: ${of.joiningDate}\n` : ''}\nYour formal offer letter will follow. Please review the details and let us know if you have any questions.\n\nWarm regards,\nKEAA International HR Team`;
    },
  },
  {
    key: 'rejection',
    label: 'Rejection Email',
    subject: () => `Update on your application to KEAA International`,
    body: (c) => `Dear ${c.name},\n\nThank you for your interest in the ${c.position || ''} position at KEAA International and for the time you invested in the process. After careful consideration, we have decided to move forward with other candidates for this role.\n\nWe genuinely appreciated getting to know you and encourage you to apply for future openings that match your profile.\n\nWarm regards,\nKEAA International HR Team`,
  },
];

/**
 * The public application form crams the fields the backend has no column for into a single
 * `notes` string, one "Label: value" per line (see src/components/JobApplicationModal.jsx).
 * Parse them back out so the profile can show them as structured data.
 */
export function parseNotes(notes) {
  const out = { message: '', qualification: '', notice: '', employer: '', linkedin: '', resumeFlag: '' };
  if (!notes) return out;
  // The cover Message is a multi-line textarea, so capture it AND every following line until the
  // next recognised label. This keeps newlines in the message and stops a later "Label:" line
  // from being swallowed into the wrong field.
  const KNOWN = new Set(['message', 'qualification', 'notice', 'current employer', 'linkedin/portfolio', 'linkedin', 'resume file']);
  let current = null;
  for (const line of String(notes).split('\n')) {
    const m = line.match(/^\s*([^:]+):\s*(.*)$/);
    const key = m ? m[1].trim().toLowerCase() : null;
    if (key && KNOWN.has(key)) {
      const val = m[2].trim();
      current = null;
      if (key === 'message') { out.message = val; current = 'message'; }
      else if (key === 'qualification') out.qualification = val;
      else if (key === 'notice') out.notice = val;
      else if (key === 'current employer') out.employer = val;
      else if (key.startsWith('linkedin')) out.linkedin = val;
      else if (key === 'resume file') out.resumeFlag = val;
    } else if (current === 'message') {
      out.message += (out.message ? '\n' : '') + line;
    }
  }
  out.message = out.message.trim();
  return out;
}

/**
 * Only http(s) URLs are safe to use as an href / iframe src. Applicant-supplied values (the
 * LinkedIn line parsed out of the notes blob) must pass through this before becoming a link, so
 * a crafted `javascript:` submission cannot run script in the authenticated admin origin when HR
 * clicks it. Returns the URL, or null when it is not a safe web URL.
 */
export const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '')) ? String(u) : null);

export const initials = (name) =>
  String(name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

export const fmtDateTime = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
