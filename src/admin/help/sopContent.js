/**
 * Canonical SOP / help content — the single source of truth the whole Contextual Help system
 * reads from. Three surfaces render from THIS file and nowhere else:
 *
 *   1. The dashboard SOP card       (ROLE_SOPS, by role)
 *   2. The per-page Help drawer      (PAGE_GUIDES, by the module key from roles.js)
 *   3. The role's "complete SOP"     (ROLE_SOPS again, opened from the card)
 *
 * WHY ONE FILE: the point of the system is that a process change is made in ONE place and
 * every surface updates. Today that place is this module. In Phase 2 the exact same shapes
 * move into a `sop` table and are served by `GET /api/sops`; `useSop.js` is the only file
 * that changes then — every component keeps calling `roleSop()` / `pageGuide()` unchanged.
 * So keep these objects shaped as plain data (no JSX, no imports): they have to survive a
 * round-trip through JSON and a database column.
 *
 * A guide object may carry any of these fields; the drawer renders whichever are present:
 *   title      string   — always
 *   purpose    string   — one line, what this screen/role is for
 *   checklist  string[] — the short "✓" list (the dashboard card shows this)
 *   workflow   string[] — ordered stages, rendered as a top-to-bottom flow
 *   important  string[] — the rules that bite if ignored
 */

/* Shared by the three admin tiers — they oversee the whole panel, not one desk. */
const ADMIN_SOP = {
  title: 'Admin SOP',
  purpose: 'Oversee every desk and keep the site and its data healthy.',
  checklist: [
    'Review pending approvals and new inquiries',
    'Manage employees and their assigned territories',
    'Publish and update website content',
    'Review reports across departments',
    'Monitor that each desk is clearing its queue',
  ],
  important: [
    'Only Super Admin and Senior Admin can change roles and permissions.',
    'Every create, edit and delete is logged against your account.',
  ],
};

export const ROLE_SOPS = {
  BUSINESS_DEVELOPMENT: {
    title: 'Business Development SOP',
    purpose: 'Turn every assigned inquiry into a closed Won or Lost outcome.',
    checklist: [
      'Check new RFQs assigned to you',
      'Contact the customer within 24 hours',
      'Send the quotation',
      'Keep every status updated',
      'Close the inquiry as Won or Lost',
    ],
    important: [
      'Do not skip a status — move through the workflow in order.',
      'A Lost inquiry requires a reason.',
      'Every action is logged.',
    ],
  },

  HR: {
    title: 'HR SOP',
    purpose: 'Move every applicant cleanly from application to offer or rejection.',
    checklist: [
      'Review new applications',
      'Schedule interviews',
      'Update each candidate’s status',
      'Upload interview feedback',
      'Send the offer or the rejection',
    ],
    important: [
      'Keep a candidate’s status current — it is what the rest of the team sees.',
      'Record a reason when you reject, for a fair and auditable trail.',
    ],
  },

  EMPLOYEE: {
    title: 'Employee SOP',
    purpose: 'Read-only access to the dashboard for visibility.',
    checklist: [
      'Review the dashboard overview',
      'Raise anything that needs action with your desk lead',
    ],
    important: ['Your access is read-only — you cannot change records.'],
  },

  SUPER_ADMIN: ADMIN_SOP,
  SENIOR_ADMIN: ADMIN_SOP,
  ADMIN: ADMIN_SOP,
};

/**
 * Per-page guides, keyed by the module `key` in roles.js (dashboard, rfq, contacts, …). The
 * Help button resolves the current route to a key and shows the matching guide; a page with
 * no entry here falls back to DEFAULT_GUIDE.
 */
export const PAGE_GUIDES = {
  dashboard: {
    title: 'Dashboard',
    purpose: 'Your starting point — territory, workflow and the inquiries waiting on you.',
    important: [
      'The SOP card is your checklist for the day.',
      'Numbers update live as inquiries move.',
    ],
  },

  rfq: {
    title: 'RFQ Guide',
    purpose: 'Manage the customer RFQs assigned to you.',
    workflow: ['New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Won / Lost', 'Closed'],
    important: [
      'Do not skip a status.',
      'A Lost deal requires a reason.',
      'Every action is logged.',
    ],
  },

  'export-inquiries': {
    title: 'Export Inquiries Guide',
    purpose: 'Handle export enquiries from overseas buyers, the same way as an RFQ.',
    workflow: ['New', 'Contacted', 'Quotation Sent', 'Negotiation', 'Won / Lost', 'Closed'],
    important: [
      'Confirm the destination port and country before quoting.',
      'A Lost enquiry requires a reason.',
    ],
  },

  contacts: {
    title: 'Contact Messages Guide',
    purpose: 'Read and resolve general enquiries sent through the Contact page.',
    workflow: ['Unread', 'Read', 'Replied', 'Closed'],
    important: [
      'Mark a message Read once you have opened it.',
      'Convert a genuine buying enquiry into an RFQ rather than closing it here.',
    ],
  },

  applications: {
    title: 'Job Applications Guide',
    purpose: 'Move candidates from application through to a hiring decision.',
    workflow: ['New', 'Shortlisted', 'Interview', 'Offer', 'Hired / Rejected'],
    important: [
      'Keep each candidate’s status current.',
      'Record a reason when rejecting.',
    ],
  },

  users: {
    title: 'User Management Guide',
    purpose: 'Create team members, set their role, and assign territory.',
    important: [
      'A user’s role decides which modules they see — set it carefully.',
      'Assigned countries and categories route inquiries to Business Development automatically.',
      'Only Super Admin and Senior Admin can manage users.',
    ],
  },

  products: {
    title: 'Products Guide',
    purpose: 'Keep the public catalogue accurate — add, edit and organise products.',
    important: [
      'Item codes are shown to customers — keep them correct.',
      'Business Development has read-only access here.',
    ],
  },

  roles: {
    title: 'Roles & Permissions Guide',
    purpose: 'Define what each role can see and do across the panel.',
    important: [
      'A permission change takes effect the next time that user signs in.',
      'Only Super Admin and Senior Admin can reach this screen.',
    ],
  },
};

/** Shown by the Help button on any page without its own guide. */
export const DEFAULT_GUIDE = {
  title: 'Help',
  purpose: 'A quick guide to this screen.',
  important: ['Use the SOP card on your dashboard for your day-to-day checklist.'],
};
