/**
 * Canonical SOP / help content — the static fallback the whole Contextual Help system reads
 * from when the backend is unavailable or has not been seeded yet. Three surfaces render from
 * this shape (via useSop.js, never directly):
 *
 *   1. The dashboard SOP card       (ROLE_SOPS, by role)
 *   2. The per-page Help drawer      (PAGE_GUIDES, by the module key from roles.js)
 *   3. The role's "complete SOP"     (ROLE_SOPS again, opened from the card)
 *   4. The SOP & Help manager        (FALLBACK_GUIDE_ROWS, when the API has no rows)
 *
 * WHY ONE FILE: a process change is made in ONE place and every surface updates. Live, that
 * place is the `sops` table served by `GET /api/sops`; this module is the offline mirror of
 * the DB seed. Keep these objects as plain data (no JSX, no imports): they must survive a JSON
 * round-trip and a database column.
 *
 * A guide object may carry any of these fields; each surface renders whichever are present:
 *   title            string    always
 *   department       string    the owning function (drives the manager's filter + a header chip)
 *   purpose          string    one or two lines: what this screen / role is for
 *   workflow         string[]  ordered stages, rendered as a vertical timeline
 *   responsibilities string[]  the ongoing duties
 *   checklist        string[]  do-today actions (the dashboard card previews these)
 *   bestPractices    string[]  operational best practice
 *   important        string[]  the rules that bite if ignored
 *   quickTips        string[]  short, high-value tips
 *   related          string[]  related module keys, rendered as jump-to chips
 *
 * DO NOT hand-edit for wording once the backend is live — edit in the SOP & Help manager so the
 * change is versioned and reaches every reader. This file only needs touching when the SHAPE
 * changes. It was generated to mirror the seeded guides.
 */

/* eslint-disable */

export const ROLE_SOPS = {
  "SUPER_ADMIN": {
    "title": "Super Admin SOP",
    "department": "Administration",
    "purpose": "Super Admin is the ultimate owner of the KEAA admin console and every record it holds. You hold full manage access to all modules and are one of only two roles that can create accounts, shape the access matrix, and maintain this documentation, so the integrity of the whole console rests on how carefully you use that reach.",
    "responsibilities": [
      "Own every module in the console, from Products and the catalogue through RFQ Requests, Contact Messages, Export Inquiries, Job Applications and Reports.",
      "Maintain user accounts alongside Senior Admin, opening access when people join and closing it when they change role or leave.",
      "Set each Business Development user's territory, the assigned countries and product categories that decide where new enquiries route.",
      "Keep the Roles & Responsibilities definitions and the access matrix aligned with how the team actually works.",
      "Curate the SOP and Help documentation so every role works from current, accurate guidance."
    ],
    "checklist": [
      "Confirm each active account still needs its current access, and revoke anything stale.",
      "Check that every Business Development user has a territory set, so no enquiry lands unrouted.",
      "Open Reports and scan for a backlog building in RFQ Requests or Export Inquiries.",
      "Verify the access matrix matches the responsibilities people actually hold this week.",
      "Read one Help guide end to end and correct anything now out of date.",
      "Skim recent log entries for any edit or deletion you did not expect."
    ],
    "bestPractices": [
      "Grant the narrowest access that lets a person do their job, then widen it only on a clear need.",
      "Coordinate account and matrix changes with Senior Admin so neither of you overwrites the other.",
      "Treat the access matrix as the single source of truth, and update it before granting access, not after.",
      "Test a territory change against a sample enquiry to confirm it routes where you intend.",
      "Keep documentation edits small and frequent so guidance never drifts far from practice."
    ],
    "important": [
      "Every create, edit and delete across the console is recorded against your account, so treat each action as one you can be asked to explain.",
      "User accounts, the access matrix, and this documentation can be changed only by you and Senior Admin, so misuse here reaches every role downstream.",
      "A Business Development user left without a territory receives none of the auto-routed enquiries, and those records sit unassigned until someone intervenes.",
      "A published guide edit reaches every reader at once, so a mistake stays live until you or Senior Admin restore the previous version.",
      "A delete removes a record that live workflows may still rely on, so confirm the impact before removing anything in use."
    ],
    "quickTips": [
      "Adjust territories one at a time, so any shift in where enquiries land is easy to trace.",
      "Keep a running note of who holds which role, so access reviews move quickly.",
      "After editing a guide, reopen it as an ordinary reader to confirm it still reads clearly."
    ],
    "related": [
      "users",
      "roles",
      "reports",
      "rfq",
      "export-inquiries",
      "contacts",
      "applications",
      "products"
    ]
  },
  "SENIOR_ADMIN": {
    "title": "Senior Admin SOP",
    "department": "Administration",
    "purpose": "Senior Admin is the deputy administrator and operational lead for the KEAA console. You hold the same tooling as Super Admin, own daily administration across every desk and all website content, and step back only on the most structural or security-sensitive changes.",
    "responsibilities": [
      "Run day-to-day administration across every desk and keep the platform stable and current.",
      "Manage user accounts: create operators, edit their details, and adjust the access each one holds.",
      "Maintain Roles & Responsibilities and the access matrix so permissions stay correct for every role.",
      "Edit and publish SOP & Help documentation, and restore a previous version when an edit needs reverting.",
      "Oversee all website content and the desks that produce it, resolving issues before they reach customers."
    ],
    "checklist": [
      "Review new and pending user accounts and confirm each holds the access its role requires.",
      "Check the access matrix for permissions that no longer match a person's current duties.",
      "Publish any SOP or Help edits that are ready, then read the live version to confirm it is correct.",
      "Scan the activity log for actions that look unexpected or out of pattern.",
      "Walk each desk to confirm content and work queues are moving cleanly.",
      "Restore a superseded document version where a recent publish introduced an error."
    ],
    "bestPractices": [
      "Record a clear reason with each account or permission change so the log stays meaningful to whoever reads it later.",
      "Make one change at a time on the access matrix and confirm the effect before the next.",
      "Draft SOP edits fully, then publish once, rather than pushing repeated small corrections to the live copy.",
      "Note the previous version before you replace a document, so a restore stays straightforward.",
      "Keep the access matrix readable by editing an existing role rather than adding an overlapping one."
    ],
    "important": [
      "Creating other top-tier admins and making wide permission changes belong to Super Admin; raise these rather than acting on your own.",
      "Every action is logged and attributed to you, so treat the log as a permanent record of what you changed and why.",
      "Publishing SOP or Help content replaces what your colleagues see, so confirm accuracy before it goes live.",
      "Edits to website content are public-facing, so a mistake is visible to anyone who visits the site."
    ],
    "quickTips": [
      "Batch a person's account edits into one pass so their access is never left half-applied.",
      "Prefer the restore action over retyping a known-good version, since retyping risks a new error.",
      "Begin your desk walk at the desk carrying the most work, so a stalled queue surfaces before it backs up."
    ],
    "related": [
      "users",
      "roles",
      "reports",
      "products",
      "rfq",
      "export-inquiries",
      "contacts",
      "applications"
    ]
  },
  "ADMIN": {
    "title": "Admin SOP",
    "department": "Administration",
    "purpose": "You are the operational owner of the KEAA desks and the public website content. You keep the catalogue, media and downloads accurate, and you route incoming enquiries to the right people, without managing staff accounts or permissions.",
    "workflow": [
      "A new RFQ Request or Export Inquiry lands in its queue.",
      "You open the lead and read what the buyer is asking for.",
      "You assign it to the Business Development user who covers that country or product line.",
      "Business Development takes ownership and works the lead through to a close."
    ],
    "responsibilities": [
      "Keep the product catalogue accurate, with each product and Product Category correctly named and placed.",
      "Maintain Gallery, Videos and Downloads so the public site carries current media and files.",
      "Triage incoming RFQ Requests and Export Inquiries, then hand each lead to the right Business Development user.",
      "Monitor Contact Messages so every enquiry reaches the desk responsible for the reply.",
      "Stay aware of team coverage through the read-only User Management and Job Applications views."
    ],
    "checklist": [
      "Clear the new RFQ Requests queue and assign each lead to a Business Development owner.",
      "Route the day's Export Inquiries to the Business Development desk best placed to answer.",
      "Open unread Contact Messages and forward each to the team that should respond.",
      "Correct or publish any product, category or download that is out of date on the public site.",
      "Check Gallery and Video entries added since yesterday for correct titles and placement.",
      "Confirm nothing is left sitting unassigned in the RFQ or Export queues overnight."
    ],
    "bestPractices": [
      "Match each lead to the Business Development user whose country or product coverage is strongest, rather than whoever is free first.",
      "Pass across the full context with each lead so the owner can act without coming back to you.",
      "Write product, category and download copy in British spelling to match the rest of the console.",
      "Make content changes in small, checked edits so the public site never shows a half-finished entry.",
      "Treat the User Management view as reference only, and raise any staff or access change with whoever owns permissions."
    ],
    "important": [
      "User Management is view-only for you: you can see staff but cannot create or amend accounts, and Roles & Responsibilities stays closed to you.",
      "You cannot edit the SOP and Help documentation; ask whoever owns it to make a correction rather than working around the limit.",
      "Every action you take is logged against your account, so work signed in as yourself and keep each change deliberate.",
      "Product, category, Gallery, Video and Download edits publish straight to the public website, so a wrong entry stays visible to customers until you fix it.",
      "Job Applications are view-only because HR owns hiring, so do not action or reply to an applicant."
    ],
    "quickTips": [
      "Assign leads the same day they arrive so Business Development can respond while interest is fresh.",
      "Keep the RFQ, Export and Contact queues near empty; a growing queue usually means a lead is stuck.",
      "After a content change, open the public page and confirm it shows what you expect."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "contacts",
      "products",
      "users",
      "applications"
    ]
  },
  "BUSINESS_DEVELOPMENT": {
    "title": "Business Development SOP",
    "department": "Business Development",
    "purpose": "You own the sales pipeline for the leads routed to your desk. RFQ requests, export enquiries and contact messages all arrive in your queue, and you carry each opportunity from first contact through to a Won or Lost decision. How promptly and accurately you work these leads decides whether buyer interest becomes an order.",
    "workflow": [
      "New",
      "Contacted",
      "Quotation Sent",
      "Negotiation",
      "Won / Lost",
      "Closed"
    ],
    "responsibilities": [
      "Stay accountable for every lead assigned to you until it reaches a final outcome.",
      "Qualify each enquiry and decide whether it merits a quotation.",
      "Prepare quotations using specifications drawn from the product catalogue.",
      "Keep every lead's stage current so the pipeline shows its true position.",
      "Follow up on quotations you have sent so active deals do not stall."
    ],
    "checklist": [
      "Open the leads newly assigned to you and read the buyer's request.",
      "Make first contact on each New lead, then set it to Contacted.",
      "Send the quotation and move the lead to Quotation Sent.",
      "Carry active deals through Negotiation as terms are discussed.",
      "Record the result of each concluded deal as Won or Lost.",
      "Close the lead once the outcome is final and nothing remains open."
    ],
    "bestPractices": [
      "Log the outcome of every buyer contact straight away, while the detail is fresh.",
      "Check specifications in the catalogue before you commit to a price.",
      "Write the Lost reason so a colleague could understand the decision months later.",
      "Work the oldest untouched lead first, before newer arrivals take your attention.",
      "Agree a clear next step and timeframe on each call so a deal keeps moving."
    ],
    "important": [
      "Statuses move in order; you cannot skip a stage.",
      "A Lost outcome will not save until you record a reason.",
      "Products, product categories, gallery and videos are view-only to you; the catalogue you quote from cannot be edited from your desk.",
      "Every action you take is recorded against your account."
    ],
    "quickTips": [
      "Your queue fills automatically from the countries and product categories assigned to you.",
      "A genuine buying enquiry in Contact Messages can be converted into a tracked RFQ.",
      "Ask a Super Admin or Senior Admin to change the countries or categories routed to you."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "contacts",
      "products",
      "reports"
    ]
  },
  "HR": {
    "title": "HR SOP",
    "department": "HR",
    "purpose": "You own the hiring pipeline for KEAA and move every job applicant from first application through to a final outcome. The status you record is the single, authoritative version of each candidate's progress, and the rest of the team works from it.",
    "workflow": [
      "New",
      "Shortlisted",
      "Interview",
      "Offer",
      "Hired / Rejected"
    ],
    "responsibilities": [
      "Own the hiring pipeline across every open role at KEAA.",
      "Set each application's status as the candidate progresses through the stages.",
      "Record the reason behind every rejection.",
      "Reference staff details in User Management when a hiring decision needs them.",
      "Carry every application through to a clear decision of hired or rejected."
    ],
    "checklist": [
      "Screen each application at New and move genuine prospects to Shortlisted.",
      "Book interviews for shortlisted candidates, then move them to Interview.",
      "Advance a candidate to Offer after a successful interview.",
      "Set a candidate to Hired once they accept the offer.",
      "Enter the reason first, then set an unsuccessful application to Rejected."
    ],
    "bestPractices": [
      "Update a candidate's status the same day their stage changes.",
      "Keep every rejection reason factual and tied to the role's requirements.",
      "Cross-check a candidate against staff records before you extend an offer.",
      "Work the oldest applications first so none is left waiting on you."
    ],
    "important": [
      "Only you can edit an application's status; other admin tiers can view applications but cannot change them, so the pipeline's accuracy rests with you.",
      "Every status change is logged, so make each move deliberately.",
      "A rejection saved without a reason breaks the fair, auditable trail the process depends on.",
      "Your User Management access is read-only: you can see staff details but cannot edit them."
    ],
    "quickTips": [
      "Filter applications by stage to surface candidates who have stalled.",
      "Write each rejection reason as if the candidate may one day read it."
    ],
    "related": [
      "applications",
      "users",
      "roles",
      "reports"
    ]
  },
  "EMPLOYEE": {
    "title": "Employee SOP",
    "department": "General",
    "purpose": "The Employee role gives you read-only visibility into the KEAA admin console dashboard so you can stay informed on the state of the business without changing any record. It matters because staff who watch the console closely notice issues early and route them to the right desk lead before they reach a customer or the public site.",
    "responsibilities": [
      "Watch the dashboard for changes that affect your team's work.",
      "Keep an eye on your notifications and open them as they arrive.",
      "Report anything that needs action to your desk lead without delay.",
      "Maintain your profile so colleagues have your correct details.",
      "Stay aware of the console's state while leaving every record untouched."
    ],
    "checklist": [
      "Open the dashboard and scan for anything that has changed since your last visit.",
      "Check your notifications for anything that concerns your team.",
      "Confirm your profile shows the correct name, role and contact details.",
      "Flag any item that looks stalled, incorrect or urgent to your desk lead.",
      "Log out when you step away so no one can use your open session."
    ],
    "bestPractices": [
      "Route questions through your desk lead rather than contacting a customer or enquiry directly.",
      "State exactly what you saw and where you saw it whenever you escalate.",
      "Set a fixed point each day for your console check so nothing waits unseen.",
      "Learn which desk owns which work so each item reaches the right lead first time."
    ],
    "important": [
      "Your access covers the dashboard, your profile and your notifications; every other module stays closed to you by design.",
      "You cannot create, edit or delete any record, so a fix you spot has to be made by someone else.",
      "Your notifications reflect only data your role can open, so the panel often shows an all-caught-up state.",
      "Treat what you see on the dashboard and in your notifications as confidential, and share it only with people who need it.",
      "Do not work through another person's login to reach data your role withholds; raise the item with your desk lead instead."
    ],
    "quickTips": [
      "If you are unsure whether something matters, tell your desk lead anyway.",
      "Bookmark the dashboard so your daily check starts in one click.",
      "A clear, specific note reaches the right desk faster than a vague one."
    ]
  }
};

export const PAGE_GUIDES = {
  "rfq": {
    "title": "RFQ Requests",
    "department": "Business Development",
    "purpose": "RFQ Requests is the central pipeline for sales leads that arrive through the public site's Request-a-Quote form. You use it to carry each enquiry from first contact to a won, lost, or closed outcome, so no genuine buyer is left without a reply.",
    "workflow": [
      "New",
      "Contacted",
      "Quotation Sent",
      "Negotiation",
      "Won / Lost",
      "Closed"
    ],
    "responsibilities": [
      "Work the leads assigned to you and keep each one moving through its current stage.",
      "Respond to new enquiries quickly, aiming to make first contact within about a day of arrival.",
      "Move each lead forward one stage at a time, in step with real progress on the deal.",
      "Record what happens on each deal so the notes and stage stay accurate for anyone reviewing the pipeline.",
      "Bring every lead to a correct final outcome of won, lost, or closed rather than leaving it open."
    ],
    "checklist": [
      "Review the New queue and match each enquiry to your assigned countries and product categories.",
      "Advance a lead to Contacted as soon as you have reached the buyer.",
      "Move every lead you have quoted into Quotation Sent.",
      "Log the outcome of each call and email against its record.",
      "Flag any lead outside your territory for an Admin to reassign.",
      "Set the final status on any deal that concluded during the day."
    ],
    "bestPractices": [
      "Let each stage change mirror the true state of the deal rather than the outcome you are hoping for.",
      "Make each Lost reason specific enough to inform future pricing, for example cost, lead time, or a specification gap.",
      "Capture the next step and any agreed date on every record so follow-up never relies on memory.",
      "Confirm scope and quantities early so the quotation you send matches what the buyer actually needs.",
      "Review your active leads regularly so none stall unnoticed in Negotiation."
    ],
    "important": [
      "Stages follow a fixed order and cannot be skipped, which keeps the pipeline readable for everyone who relies on it.",
      "A lead cannot be marked Lost until a reason is recorded against it.",
      "Every stage change and note is logged and attributed to you, so treat each entry as part of the permanent record.",
      "Super Admin and Senior Admin hold view-only oversight here; only an Admin assigns an unassigned lead to a Business Development user.",
      "Each enquiry comes from a real buyer waiting after using the public site, so a slow first response reflects on the company."
    ],
    "quickTips": [
      "Work the New queue first each morning; those buyers have waited longest.",
      "A short, honest note written now saves a long reconstruction later.",
      "When a lead's fit is unclear, raise it with an Admin before investing hours in it."
    ],
    "related": [
      "export-inquiries",
      "contacts",
      "products",
      "reports"
    ]
  },
  "export-inquiries": {
    "title": "Export Inquiries",
    "department": "Business Development",
    "purpose": "Export Inquiries is where you take an enquiry from an overseas buyer through to a quotation and a firm won or lost decision. Apply the same commercial discipline you would to an RFQ, so your margin holds and the export paperwork stays correct.",
    "workflow": [
      "New",
      "Contacted",
      "Quotation Sent",
      "Negotiation",
      "Won / Lost",
      "Closed"
    ],
    "responsibilities": [
      "Advance each enquiry through the pipeline as your conversation with the buyer progresses.",
      "Verify the destination country, destination port and shipping terms before any price leaves the console.",
      "Record a clear reason on every enquiry you close as Lost.",
      "Keep buyer requirements, quantities and contact details current on the record.",
      "Escalate to an admin tier when an enquiry needs oversight or a decision above your authority."
    ],
    "checklist": [
      "Open every enquiry sitting in New and move it to Contacted once you have reached the buyer.",
      "Send any quotation that is ready and set the record to Quotation Sent.",
      "Work through the Negotiation stage and log the buyer's latest position on each record.",
      "Close out any decided enquiry as Won or Lost.",
      "Confirm every open record still shows the stage that matches its true position before you finish."
    ],
    "bestPractices": [
      "Quote against quantities and a specification the buyer has confirmed, never against an assumption.",
      "Change a record's stage as soon as the real position moves, so the pipeline stays honest for the admin tiers watching it.",
      "Write Lost reasons in plain, specific language, so patterns in price, lead time or specification surface over time.",
      "Put the agreed shipping terms on the quotation itself, which forecloses a later dispute over who carries which cost.",
      "Note the substance of each buyer exchange while it is fresh, so the record reflects the deal rather than your memory."
    ],
    "important": [
      "A Lost close will not save without a reason. The field is required.",
      "Every action on this screen is logged, so the record stands as the audit trail for the deal.",
      "Pricing before the country, port and terms are settled risks the wrong figure and the wrong export documents.",
      "Business Development works these enquiries and any admin tier can review them, so keep every record fit to be read."
    ],
    "quickTips": [
      "Sort the queue by stage to surface what needs the next action.",
      "Scroll a record's own history to recall what was last agreed before you reply to the buyer.",
      "Escalate early rather than late when a decision sits above your authority, so the buyer is not kept waiting."
    ],
    "related": [
      "rfq",
      "contacts",
      "products"
    ]
  },
  "contacts": {
    "title": "Contact Messages",
    "department": "Business Development",
    "purpose": "Contact Messages is where you handle general enquiries submitted through the public Contact page. Working this queue promptly keeps first-contact response times low and ensures genuine buying interest reaches the sales pipeline rather than being lost.",
    "workflow": [
      "Unread",
      "Read",
      "Replied",
      "Closed"
    ],
    "responsibilities": [
      "Own the Contact Messages queue and work each message as it lands",
      "Judge whether an enquiry is a general question or a genuine buying signal",
      "Hand qualified buying enquiries to the RFQ process so the sales team can pursue them",
      "Keep each conversation's status current so colleagues can see what is in hand",
      "Keep the working view free of spam and misdirected messages"
    ],
    "checklist": [
      "Open every Unread message and set it to Read",
      "Reply to enquiries awaiting a response, then move them to Replied",
      "Convert any buying enquiry into an RFQ before you take any other action on it",
      "Close resolved messages that need no further follow-up",
      "Report spam or misdirected messages so the working queue stays clean"
    ],
    "bestPractices": [
      "Reply while the enquiry is still fresh, since a same-day response reads as attentive",
      "Read the full message before deciding whether it is a question or an order",
      "Work the oldest Unread messages first so none waits longer than it should",
      "Keep each reply specific to what the sender asked, not a generic acknowledgement",
      "Confirm a message is genuinely spam before you report it, since real enquiries can be short"
    ],
    "important": [
      "Only Business Development and admin tiers can action this queue; other roles have no access",
      "A buying enquiry closed here never reaches the sales pipeline, so convert it to an RFQ before you close it",
      "Because status is visible to the whole team, an inaccurate state misleads whoever handles the message next",
      "These enquiries come from the public Contact page, so a slow or missing reply is felt directly by prospects"
    ],
    "quickTips": [
      "If you are unsure whether it is a sale, convert to RFQ and let the pipeline requalify it",
      "Use Closed only for finished conversations, never to park a live enquiry",
      "Set Read the moment you open a message so a colleague does not answer it in parallel"
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "reports"
    ]
  },
  "applications": {
    "title": "Job Applications",
    "department": "HR",
    "purpose": "Job Applications is the recruitment queue fed by the public Careers page. Every candidate submission lands here in one place, so you can assess applicants and move them through the hiring pipeline from a single screen.",
    "workflow": [
      "New",
      "Shortlisted",
      "Interview",
      "Offer",
      "Hired or Rejected"
    ],
    "responsibilities": [
      "Review each submission as it lands in New and decide whether to take it forward.",
      "Progress suitable candidates through Shortlisted, Interview and Offer as they clear each step.",
      "Close every candidate out to Hired or Rejected once the decision is final.",
      "Confirm interview and offer outcomes with the hiring team, then update the stage to match."
    ],
    "checklist": [
      "Open the New stage and read every application received since your last visit.",
      "Shortlist the strongest applicants and move them out of New.",
      "Update the Interview and Offer stages to match any outcomes decided today.",
      "Close finished candidates into Hired or Rejected so they leave the active pipeline.",
      "Scan the whole queue for any stage that no longer matches reality and correct it."
    ],
    "bestPractices": [
      "Base each shortlisting decision on genuine fit with the role, so your standard stays consistent across the queue.",
      "Keep candidates moving; anyone left in one stage too long usually signals a decision that is overdue.",
      "Set a regular rhythm for working the queue rather than dipping in only when a submission arrives.",
      "Agree with the hiring team what each stage means, so New, Shortlisted and Interview read the same to everyone."
    ],
    "important": [
      "Only HR can change an application's status; other admin tiers can view the queue but cannot edit it.",
      "Because the wider team reads this screen to see where a candidate stands, a stage left out of date misleads everyone who checks it.",
      "A rejection closed without a documented reason leaves no record of why the decision was made."
    ],
    "quickTips": [
      "Clear the New stage before anything else; those applicants are the most likely to take work elsewhere while they wait.",
      "Update a stage the moment a decision is final, rather than saving changes for one batch at the end of the day."
    ],
    "related": [
      "users",
      "roles"
    ]
  },
  "users": {
    "title": "User Management",
    "department": "Administration",
    "purpose": "User Management is where you create team members, assign each person's role and territory, and set whether an account is active or deactivated. The choices here carry weight: a role determines which modules a colleague can open and whether their access is manage or view-only.",
    "workflow": [
      "Create the record for the new team member.",
      "Assign the role that matches their job, which sets the modules they can open.",
      "For a Business Development user, define the territory by selecting the relevant countries and product categories.",
      "Activate the account to grant access, then deactivate it to withdraw access when the person no longer needs it."
    ],
    "responsibilities": [
      "Keep each person's role aligned with their current job so module access stays correct.",
      "Maintain Business Development territories so the assigned countries and product categories reflect current ownership.",
      "Withdraw access without delay when a colleague leaves or moves to different duties.",
      "Review on a regular cadence who holds manage-level access, and confirm each grant is still warranted.",
      "Prepare new joiners with the right role before their first day on the console."
    ],
    "checklist": [
      "Confirm every active account belongs to a current team member.",
      "Check that each Business Development user has countries and product categories set.",
      "Close any account left open for someone who has since left.",
      "Verify no account carries access wider than its holder's duties require.",
      "Add any new joiner still waiting for access."
    ],
    "bestPractices": [
      "Grant the narrowest role that still lets the person do their work.",
      "Prefer deactivation over deletion so the account and its audit history remain intact.",
      "Confirm a joiner's role with their manager before you activate their access.",
      "Give each colleague their own account rather than a shared one, so activity and access stay tied to a single person.",
      "Fold account setup and deactivation into your joiner and leaver routine so access never lags a personnel change."
    ],
    "important": [
      "Only Super Admin and Senior Admin can create or change users; Admin and HR see this screen as view-only.",
      "A role change takes effect immediately and can widen or remove access, so check the impact before you save.",
      "Access remains live until an account is deactivated, since there is no automatic expiry when someone leaves.",
      "Every change on this screen is recorded, so each action stays attributable to the person who made it.",
      "A Business Development user with no territory set receives no auto-routed enquiries."
    ],
    "quickTips": [
      "Give people who need visibility without control a view-only Admin or HR account.",
      "Set a Business Development user's territory before you activate them so routing works from day one.",
      "Deactivating keeps the record, so a returning colleague can have access restored rather than rebuilt."
    ],
    "related": [
      "roles",
      "rfq",
      "export-inquiries",
      "reports"
    ]
  },
  "roles": {
    "title": "Roles & Responsibilities",
    "department": "Administration",
    "purpose": "Roles & Responsibilities is the at-a-glance map of the console's whole access model, showing for every module whether each role holds manage, view-only, or no access, alongside the SOP & Help Management centre in one place. Use it to confirm who holds which permissions before you change anything, and to keep the guidance your team relies on accurate.",
    "responsibilities": [
      "Keep the access matrix aligned with each person's current role, so what a role can reach reflects the work it actually does.",
      "Confirm that a role's level in a module, whether manage, view-only, or no access, matches what that desk is expected to do.",
      "Own the SOP & Help Management centre as the place every desk turns to for how a task is done.",
      "Publish guide edits so the on-screen instructions track how the work is actually carried out.",
      "Revisit the matrix whenever a module is added or a responsibility moves between desks."
    ],
    "checklist": [
      "Open the access matrix and review whether any role still holds access it no longer uses.",
      "Cross-check a recent permission change against what that person actually does day to day.",
      "Read the current SOP & Help Management entries for the modules your team touches.",
      "Correct any guide that no longer matches how the task is carried out.",
      "Note which permission edits are still waiting on the affected user's next sign-in."
    ],
    "bestPractices": [
      "Grant the lowest access level that lets a role finish its work, and widen it only on a demonstrated need.",
      "Change one permission at a time and record why, so the matrix stays straightforward to audit.",
      "Record a new or changed procedure in the SOP & Help Management centre promptly, rather than leaving it in informal notes.",
      "Review view-only assignments periodically, as a desk's needs shift while the catalogue and pipeline grow.",
      "Keep each guide short and specific so the person doing the job can act on it without interpretation."
    ],
    "important": [
      "Only Super Admin and Senior Admin can open this screen; no other role can view or alter the access model.",
      "A permission change takes effect the next time the affected user signs in, not the moment you save it, so plan around that gap.",
      "The matrix mirrors exactly what the backend enforces, so it is a true picture of access rather than a cosmetic setting.",
      "Edits made in the SOP & Help Management tab publish live across the console, so the whole team sees them at once.",
      "Documentation there is version-controlled, so every edit is attributable; make each change deliberately."
    ],
    "quickTips": [
      "Read across a module's row to compare every role's access level for it at a glance.",
      "If an access level looks wrong on the matrix, correct it here rather than working around it elsewhere.",
      "When a permission change must apply now, ask the affected user to sign out and back in."
    ],
    "related": [
      "users",
      "products",
      "reports"
    ]
  },
  "products": {
    "title": "Products",
    "department": "Website",
    "purpose": "Products is the public catalogue manager for the website. Keep the range that visitors and buyers see accurate, current, and clearly organised into categories, so buyers can find and identify the right equipment.",
    "responsibilities": [
      "Add new lines as they come to market and retire any that are no longer sold, so the catalogue matches what the company currently offers.",
      "Record every item code exactly, since customers read it and quote against it.",
      "Assign each product to the correct category so it appears in the right public menu.",
      "Check names, descriptions, and specifications for accuracy before they reach visitors and buyers.",
      "Own the accuracy of the whole catalogue, not only the entries you added, because Business Development quotes from what you publish here."
    ],
    "checklist": [
      "Cross-check the item codes on newly added products against your source records.",
      "Verify that every product carries a category, with none left uncategorised.",
      "Open the live site and confirm your latest saves appear as intended.",
      "Retire or correct any listing for a line that is no longer available.",
      "Look over the products others added today and confirm their details before buyers rely on them."
    ],
    "bestPractices": [
      "Group related products consistently so the public menus stay predictable for buyers.",
      "Work in small, checked batches rather than broad sweeps that are hard to review.",
      "Keep names and descriptions factual and specific, using the terms buyers actually search for.",
      "Coordinate catalogue changes with Business Development so their quotes and the live listings stay aligned."
    ],
    "important": [
      "Every save publishes straight to the public site, so treat the catalogue as live at all times.",
      "An incorrect item code travels with the customer into their enquiry and quote, so getting it right is not optional.",
      "Business Development has read-only access and cannot correct a listing, so any error you leave stays live until you fix it.",
      "Leave a product uncategorised, or in the wrong category, and it sits misplaced or hidden in the public menus."
    ],
    "quickTips": [
      "Fix an error the moment you spot it, since a buyer may already be viewing that listing.",
      "Work through the catalogue one category at a time to catch anything filed in the wrong group.",
      "Keep your source records to hand while editing so each code check takes seconds."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "roles",
      "reports"
    ]
  },
  "reports": {
    "title": "Reports",
    "department": "Administration",
    "purpose": "Reports is the cross-department performance view for the admin tiers, drawing RFQ and export pipeline volume, Won versus Lost conversion, lead response speed, contact-message throughput, and the hiring funnel into one surface. You read it to see where a desk is falling behind its queue and where leads are slipping away, then act in the module that owns the record.",
    "responsibilities": [
      "Track RFQ and export pipeline volume and its Won versus Lost split across departments.",
      "Watch how quickly new leads move to first contact so a slow queue surfaces early.",
      "Monitor contact-message throughput to confirm enquiries are being cleared rather than accumulating unanswered.",
      "Follow the hiring funnel to see where candidates progress and where they stall.",
      "Compare desks against one another to find the team drifting behind its workload."
    ],
    "checklist": [
      "Open Reports and scan the Won versus Lost split for any desk sliding towards Lost.",
      "Check lead response times and flag any queue that is slow to first contact.",
      "Review contact-message throughput against normal volume to catch a backlog forming.",
      "Read the hiring funnel for a stage where candidates are stuck.",
      "Where a figure looks wrong, open the source module to inspect the records behind it.",
      "Note the desks trending down and raise them with the responsible tier lead."
    ],
    "bestPractices": [
      "Read Reports on a set cadence so a trend is caught while it can still be corrected.",
      "Treat a falling conversion rate as a reason to inspect the desk, not a verdict on its own.",
      "Verify a suspect figure before you escalate, so you raise a real problem and not a logging gap.",
      "Judge lead response speed alongside volume, since a busy queue and a neglected one read differently.",
      "Concentrate on the outliers, the desks and stages that break from the usual pattern."
    ],
    "important": [
      "Reports displays data, it does not edit it. Corrections are made in the originating module, whether RFQ Requests, Export Inquiries, Contact Messages, or Job Applications.",
      "The figures are only as reliable as the source records. A skipped or stale update will distort the pipeline and response numbers.",
      "Access is confined to the admin tiers. Handle desk-level performance figures as internal and do not expose them outside that group."
    ],
    "quickTips": [
      "A rising Lost count on one desk usually traces back to slow first contact, so start there.",
      "Quick first contact with few wins means the leads are being worked but not closed.",
      "Flat or empty throughput can mean nothing is being logged upstream, not that nothing arrived."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "contacts",
      "applications"
    ]
  }
};

/** Shown by the Help button on any page without its own guide (should be rare — the Help button
 *  only appears on modules that have one). */
export const DEFAULT_GUIDE = {
  title: 'Help',
  purpose: 'A quick guide to this screen.',
  important: ['Use the SOP card on your dashboard for your day-to-day checklist.'],
};

/** A flat, manager-friendly list of every guide as a row (scope + refKey + fields), used by the
 *  SOP & Help manager as a read-only fallback when the API returns no rows. The negative ids mark
 *  these as static (not database-backed), so the manager can tell them apart. */
export const FALLBACK_GUIDE_ROWS = [
  {
    "id": -1,
    "scope": "role",
    "refKey": "SUPER_ADMIN",
    "title": "Super Admin SOP",
    "department": "Administration",
    "purpose": "Super Admin is the ultimate owner of the KEAA admin console and every record it holds. You hold full manage access to all modules and are one of only two roles that can create accounts, shape the access matrix, and maintain this documentation, so the integrity of the whole console rests on how carefully you use that reach.",
    "responsibilities": [
      "Own every module in the console, from Products and the catalogue through RFQ Requests, Contact Messages, Export Inquiries, Job Applications and Reports.",
      "Maintain user accounts alongside Senior Admin, opening access when people join and closing it when they change role or leave.",
      "Set each Business Development user's territory, the assigned countries and product categories that decide where new enquiries route.",
      "Keep the Roles & Responsibilities definitions and the access matrix aligned with how the team actually works.",
      "Curate the SOP and Help documentation so every role works from current, accurate guidance."
    ],
    "checklist": [
      "Confirm each active account still needs its current access, and revoke anything stale.",
      "Check that every Business Development user has a territory set, so no enquiry lands unrouted.",
      "Open Reports and scan for a backlog building in RFQ Requests or Export Inquiries.",
      "Verify the access matrix matches the responsibilities people actually hold this week.",
      "Read one Help guide end to end and correct anything now out of date.",
      "Skim recent log entries for any edit or deletion you did not expect."
    ],
    "bestPractices": [
      "Grant the narrowest access that lets a person do their job, then widen it only on a clear need.",
      "Coordinate account and matrix changes with Senior Admin so neither of you overwrites the other.",
      "Treat the access matrix as the single source of truth, and update it before granting access, not after.",
      "Test a territory change against a sample enquiry to confirm it routes where you intend.",
      "Keep documentation edits small and frequent so guidance never drifts far from practice."
    ],
    "important": [
      "Every create, edit and delete across the console is recorded against your account, so treat each action as one you can be asked to explain.",
      "User accounts, the access matrix, and this documentation can be changed only by you and Senior Admin, so misuse here reaches every role downstream.",
      "A Business Development user left without a territory receives none of the auto-routed enquiries, and those records sit unassigned until someone intervenes.",
      "A published guide edit reaches every reader at once, so a mistake stays live until you or Senior Admin restore the previous version.",
      "A delete removes a record that live workflows may still rely on, so confirm the impact before removing anything in use."
    ],
    "quickTips": [
      "Adjust territories one at a time, so any shift in where enquiries land is easy to trace.",
      "Keep a running note of who holds which role, so access reviews move quickly.",
      "After editing a guide, reopen it as an ordinary reader to confirm it still reads clearly."
    ],
    "related": [
      "users",
      "roles",
      "reports",
      "rfq",
      "export-inquiries",
      "contacts",
      "applications",
      "products"
    ]
  },
  {
    "id": -2,
    "scope": "role",
    "refKey": "SENIOR_ADMIN",
    "title": "Senior Admin SOP",
    "department": "Administration",
    "purpose": "Senior Admin is the deputy administrator and operational lead for the KEAA console. You hold the same tooling as Super Admin, own daily administration across every desk and all website content, and step back only on the most structural or security-sensitive changes.",
    "responsibilities": [
      "Run day-to-day administration across every desk and keep the platform stable and current.",
      "Manage user accounts: create operators, edit their details, and adjust the access each one holds.",
      "Maintain Roles & Responsibilities and the access matrix so permissions stay correct for every role.",
      "Edit and publish SOP & Help documentation, and restore a previous version when an edit needs reverting.",
      "Oversee all website content and the desks that produce it, resolving issues before they reach customers."
    ],
    "checklist": [
      "Review new and pending user accounts and confirm each holds the access its role requires.",
      "Check the access matrix for permissions that no longer match a person's current duties.",
      "Publish any SOP or Help edits that are ready, then read the live version to confirm it is correct.",
      "Scan the activity log for actions that look unexpected or out of pattern.",
      "Walk each desk to confirm content and work queues are moving cleanly.",
      "Restore a superseded document version where a recent publish introduced an error."
    ],
    "bestPractices": [
      "Record a clear reason with each account or permission change so the log stays meaningful to whoever reads it later.",
      "Make one change at a time on the access matrix and confirm the effect before the next.",
      "Draft SOP edits fully, then publish once, rather than pushing repeated small corrections to the live copy.",
      "Note the previous version before you replace a document, so a restore stays straightforward.",
      "Keep the access matrix readable by editing an existing role rather than adding an overlapping one."
    ],
    "important": [
      "Creating other top-tier admins and making wide permission changes belong to Super Admin; raise these rather than acting on your own.",
      "Every action is logged and attributed to you, so treat the log as a permanent record of what you changed and why.",
      "Publishing SOP or Help content replaces what your colleagues see, so confirm accuracy before it goes live.",
      "Edits to website content are public-facing, so a mistake is visible to anyone who visits the site."
    ],
    "quickTips": [
      "Batch a person's account edits into one pass so their access is never left half-applied.",
      "Prefer the restore action over retyping a known-good version, since retyping risks a new error.",
      "Begin your desk walk at the desk carrying the most work, so a stalled queue surfaces before it backs up."
    ],
    "related": [
      "users",
      "roles",
      "reports",
      "products",
      "rfq",
      "export-inquiries",
      "contacts",
      "applications"
    ]
  },
  {
    "id": -3,
    "scope": "role",
    "refKey": "ADMIN",
    "title": "Admin SOP",
    "department": "Administration",
    "purpose": "You are the operational owner of the KEAA desks and the public website content. You keep the catalogue, media and downloads accurate, and you route incoming enquiries to the right people, without managing staff accounts or permissions.",
    "workflow": [
      "A new RFQ Request or Export Inquiry lands in its queue.",
      "You open the lead and read what the buyer is asking for.",
      "You assign it to the Business Development user who covers that country or product line.",
      "Business Development takes ownership and works the lead through to a close."
    ],
    "responsibilities": [
      "Keep the product catalogue accurate, with each product and Product Category correctly named and placed.",
      "Maintain Gallery, Videos and Downloads so the public site carries current media and files.",
      "Triage incoming RFQ Requests and Export Inquiries, then hand each lead to the right Business Development user.",
      "Monitor Contact Messages so every enquiry reaches the desk responsible for the reply.",
      "Stay aware of team coverage through the read-only User Management and Job Applications views."
    ],
    "checklist": [
      "Clear the new RFQ Requests queue and assign each lead to a Business Development owner.",
      "Route the day's Export Inquiries to the Business Development desk best placed to answer.",
      "Open unread Contact Messages and forward each to the team that should respond.",
      "Correct or publish any product, category or download that is out of date on the public site.",
      "Check Gallery and Video entries added since yesterday for correct titles and placement.",
      "Confirm nothing is left sitting unassigned in the RFQ or Export queues overnight."
    ],
    "bestPractices": [
      "Match each lead to the Business Development user whose country or product coverage is strongest, rather than whoever is free first.",
      "Pass across the full context with each lead so the owner can act without coming back to you.",
      "Write product, category and download copy in British spelling to match the rest of the console.",
      "Make content changes in small, checked edits so the public site never shows a half-finished entry.",
      "Treat the User Management view as reference only, and raise any staff or access change with whoever owns permissions."
    ],
    "important": [
      "User Management is view-only for you: you can see staff but cannot create or amend accounts, and Roles & Responsibilities stays closed to you.",
      "You cannot edit the SOP and Help documentation; ask whoever owns it to make a correction rather than working around the limit.",
      "Every action you take is logged against your account, so work signed in as yourself and keep each change deliberate.",
      "Product, category, Gallery, Video and Download edits publish straight to the public website, so a wrong entry stays visible to customers until you fix it.",
      "Job Applications are view-only because HR owns hiring, so do not action or reply to an applicant."
    ],
    "quickTips": [
      "Assign leads the same day they arrive so Business Development can respond while interest is fresh.",
      "Keep the RFQ, Export and Contact queues near empty; a growing queue usually means a lead is stuck.",
      "After a content change, open the public page and confirm it shows what you expect."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "contacts",
      "products",
      "users",
      "applications"
    ]
  },
  {
    "id": -4,
    "scope": "role",
    "refKey": "BUSINESS_DEVELOPMENT",
    "title": "Business Development SOP",
    "department": "Business Development",
    "purpose": "You own the sales pipeline for the leads routed to your desk. RFQ requests, export enquiries and contact messages all arrive in your queue, and you carry each opportunity from first contact through to a Won or Lost decision. How promptly and accurately you work these leads decides whether buyer interest becomes an order.",
    "workflow": [
      "New",
      "Contacted",
      "Quotation Sent",
      "Negotiation",
      "Won / Lost",
      "Closed"
    ],
    "responsibilities": [
      "Stay accountable for every lead assigned to you until it reaches a final outcome.",
      "Qualify each enquiry and decide whether it merits a quotation.",
      "Prepare quotations using specifications drawn from the product catalogue.",
      "Keep every lead's stage current so the pipeline shows its true position.",
      "Follow up on quotations you have sent so active deals do not stall."
    ],
    "checklist": [
      "Open the leads newly assigned to you and read the buyer's request.",
      "Make first contact on each New lead, then set it to Contacted.",
      "Send the quotation and move the lead to Quotation Sent.",
      "Carry active deals through Negotiation as terms are discussed.",
      "Record the result of each concluded deal as Won or Lost.",
      "Close the lead once the outcome is final and nothing remains open."
    ],
    "bestPractices": [
      "Log the outcome of every buyer contact straight away, while the detail is fresh.",
      "Check specifications in the catalogue before you commit to a price.",
      "Write the Lost reason so a colleague could understand the decision months later.",
      "Work the oldest untouched lead first, before newer arrivals take your attention.",
      "Agree a clear next step and timeframe on each call so a deal keeps moving."
    ],
    "important": [
      "Statuses move in order; you cannot skip a stage.",
      "A Lost outcome will not save until you record a reason.",
      "Products, product categories, gallery and videos are view-only to you; the catalogue you quote from cannot be edited from your desk.",
      "Every action you take is recorded against your account."
    ],
    "quickTips": [
      "Your queue fills automatically from the countries and product categories assigned to you.",
      "A genuine buying enquiry in Contact Messages can be converted into a tracked RFQ.",
      "Ask a Super Admin or Senior Admin to change the countries or categories routed to you."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "contacts",
      "products",
      "reports"
    ]
  },
  {
    "id": -5,
    "scope": "role",
    "refKey": "HR",
    "title": "HR SOP",
    "department": "HR",
    "purpose": "You own the hiring pipeline for KEAA and move every job applicant from first application through to a final outcome. The status you record is the single, authoritative version of each candidate's progress, and the rest of the team works from it.",
    "workflow": [
      "New",
      "Shortlisted",
      "Interview",
      "Offer",
      "Hired / Rejected"
    ],
    "responsibilities": [
      "Own the hiring pipeline across every open role at KEAA.",
      "Set each application's status as the candidate progresses through the stages.",
      "Record the reason behind every rejection.",
      "Reference staff details in User Management when a hiring decision needs them.",
      "Carry every application through to a clear decision of hired or rejected."
    ],
    "checklist": [
      "Screen each application at New and move genuine prospects to Shortlisted.",
      "Book interviews for shortlisted candidates, then move them to Interview.",
      "Advance a candidate to Offer after a successful interview.",
      "Set a candidate to Hired once they accept the offer.",
      "Enter the reason first, then set an unsuccessful application to Rejected."
    ],
    "bestPractices": [
      "Update a candidate's status the same day their stage changes.",
      "Keep every rejection reason factual and tied to the role's requirements.",
      "Cross-check a candidate against staff records before you extend an offer.",
      "Work the oldest applications first so none is left waiting on you."
    ],
    "important": [
      "Only you can edit an application's status; other admin tiers can view applications but cannot change them, so the pipeline's accuracy rests with you.",
      "Every status change is logged, so make each move deliberately.",
      "A rejection saved without a reason breaks the fair, auditable trail the process depends on.",
      "Your User Management access is read-only: you can see staff details but cannot edit them."
    ],
    "quickTips": [
      "Filter applications by stage to surface candidates who have stalled.",
      "Write each rejection reason as if the candidate may one day read it."
    ],
    "related": [
      "applications",
      "users",
      "roles",
      "reports"
    ]
  },
  {
    "id": -6,
    "scope": "role",
    "refKey": "EMPLOYEE",
    "title": "Employee SOP",
    "department": "General",
    "purpose": "The Employee role gives you read-only visibility into the KEAA admin console dashboard so you can stay informed on the state of the business without changing any record. It matters because staff who watch the console closely notice issues early and route them to the right desk lead before they reach a customer or the public site.",
    "responsibilities": [
      "Watch the dashboard for changes that affect your team's work.",
      "Keep an eye on your notifications and open them as they arrive.",
      "Report anything that needs action to your desk lead without delay.",
      "Maintain your profile so colleagues have your correct details.",
      "Stay aware of the console's state while leaving every record untouched."
    ],
    "checklist": [
      "Open the dashboard and scan for anything that has changed since your last visit.",
      "Check your notifications for anything that concerns your team.",
      "Confirm your profile shows the correct name, role and contact details.",
      "Flag any item that looks stalled, incorrect or urgent to your desk lead.",
      "Log out when you step away so no one can use your open session."
    ],
    "bestPractices": [
      "Route questions through your desk lead rather than contacting a customer or enquiry directly.",
      "State exactly what you saw and where you saw it whenever you escalate.",
      "Set a fixed point each day for your console check so nothing waits unseen.",
      "Learn which desk owns which work so each item reaches the right lead first time."
    ],
    "important": [
      "Your access covers the dashboard, your profile and your notifications; every other module stays closed to you by design.",
      "You cannot create, edit or delete any record, so a fix you spot has to be made by someone else.",
      "Your notifications reflect only data your role can open, so the panel often shows an all-caught-up state.",
      "Treat what you see on the dashboard and in your notifications as confidential, and share it only with people who need it.",
      "Do not work through another person's login to reach data your role withholds; raise the item with your desk lead instead."
    ],
    "quickTips": [
      "If you are unsure whether something matters, tell your desk lead anyway.",
      "Bookmark the dashboard so your daily check starts in one click.",
      "A clear, specific note reaches the right desk faster than a vague one."
    ]
  },
  {
    "id": -7,
    "scope": "page",
    "refKey": "rfq",
    "title": "RFQ Requests",
    "department": "Business Development",
    "purpose": "RFQ Requests is the central pipeline for sales leads that arrive through the public site's Request-a-Quote form. You use it to carry each enquiry from first contact to a won, lost, or closed outcome, so no genuine buyer is left without a reply.",
    "workflow": [
      "New",
      "Contacted",
      "Quotation Sent",
      "Negotiation",
      "Won / Lost",
      "Closed"
    ],
    "responsibilities": [
      "Work the leads assigned to you and keep each one moving through its current stage.",
      "Respond to new enquiries quickly, aiming to make first contact within about a day of arrival.",
      "Move each lead forward one stage at a time, in step with real progress on the deal.",
      "Record what happens on each deal so the notes and stage stay accurate for anyone reviewing the pipeline.",
      "Bring every lead to a correct final outcome of won, lost, or closed rather than leaving it open."
    ],
    "checklist": [
      "Review the New queue and match each enquiry to your assigned countries and product categories.",
      "Advance a lead to Contacted as soon as you have reached the buyer.",
      "Move every lead you have quoted into Quotation Sent.",
      "Log the outcome of each call and email against its record.",
      "Flag any lead outside your territory for an Admin to reassign.",
      "Set the final status on any deal that concluded during the day."
    ],
    "bestPractices": [
      "Let each stage change mirror the true state of the deal rather than the outcome you are hoping for.",
      "Make each Lost reason specific enough to inform future pricing, for example cost, lead time, or a specification gap.",
      "Capture the next step and any agreed date on every record so follow-up never relies on memory.",
      "Confirm scope and quantities early so the quotation you send matches what the buyer actually needs.",
      "Review your active leads regularly so none stall unnoticed in Negotiation."
    ],
    "important": [
      "Stages follow a fixed order and cannot be skipped, which keeps the pipeline readable for everyone who relies on it.",
      "A lead cannot be marked Lost until a reason is recorded against it.",
      "Every stage change and note is logged and attributed to you, so treat each entry as part of the permanent record.",
      "Super Admin and Senior Admin hold view-only oversight here; only an Admin assigns an unassigned lead to a Business Development user.",
      "Each enquiry comes from a real buyer waiting after using the public site, so a slow first response reflects on the company."
    ],
    "quickTips": [
      "Work the New queue first each morning; those buyers have waited longest.",
      "A short, honest note written now saves a long reconstruction later.",
      "When a lead's fit is unclear, raise it with an Admin before investing hours in it."
    ],
    "related": [
      "export-inquiries",
      "contacts",
      "products",
      "reports"
    ]
  },
  {
    "id": -8,
    "scope": "page",
    "refKey": "export-inquiries",
    "title": "Export Inquiries",
    "department": "Business Development",
    "purpose": "Export Inquiries is where you take an enquiry from an overseas buyer through to a quotation and a firm won or lost decision. Apply the same commercial discipline you would to an RFQ, so your margin holds and the export paperwork stays correct.",
    "workflow": [
      "New",
      "Contacted",
      "Quotation Sent",
      "Negotiation",
      "Won / Lost",
      "Closed"
    ],
    "responsibilities": [
      "Advance each enquiry through the pipeline as your conversation with the buyer progresses.",
      "Verify the destination country, destination port and shipping terms before any price leaves the console.",
      "Record a clear reason on every enquiry you close as Lost.",
      "Keep buyer requirements, quantities and contact details current on the record.",
      "Escalate to an admin tier when an enquiry needs oversight or a decision above your authority."
    ],
    "checklist": [
      "Open every enquiry sitting in New and move it to Contacted once you have reached the buyer.",
      "Send any quotation that is ready and set the record to Quotation Sent.",
      "Work through the Negotiation stage and log the buyer's latest position on each record.",
      "Close out any decided enquiry as Won or Lost.",
      "Confirm every open record still shows the stage that matches its true position before you finish."
    ],
    "bestPractices": [
      "Quote against quantities and a specification the buyer has confirmed, never against an assumption.",
      "Change a record's stage as soon as the real position moves, so the pipeline stays honest for the admin tiers watching it.",
      "Write Lost reasons in plain, specific language, so patterns in price, lead time or specification surface over time.",
      "Put the agreed shipping terms on the quotation itself, which forecloses a later dispute over who carries which cost.",
      "Note the substance of each buyer exchange while it is fresh, so the record reflects the deal rather than your memory."
    ],
    "important": [
      "A Lost close will not save without a reason. The field is required.",
      "Every action on this screen is logged, so the record stands as the audit trail for the deal.",
      "Pricing before the country, port and terms are settled risks the wrong figure and the wrong export documents.",
      "Business Development works these enquiries and any admin tier can review them, so keep every record fit to be read."
    ],
    "quickTips": [
      "Sort the queue by stage to surface what needs the next action.",
      "Scroll a record's own history to recall what was last agreed before you reply to the buyer.",
      "Escalate early rather than late when a decision sits above your authority, so the buyer is not kept waiting."
    ],
    "related": [
      "rfq",
      "contacts",
      "products"
    ]
  },
  {
    "id": -9,
    "scope": "page",
    "refKey": "contacts",
    "title": "Contact Messages",
    "department": "Business Development",
    "purpose": "Contact Messages is where you handle general enquiries submitted through the public Contact page. Working this queue promptly keeps first-contact response times low and ensures genuine buying interest reaches the sales pipeline rather than being lost.",
    "workflow": [
      "Unread",
      "Read",
      "Replied",
      "Closed"
    ],
    "responsibilities": [
      "Own the Contact Messages queue and work each message as it lands",
      "Judge whether an enquiry is a general question or a genuine buying signal",
      "Hand qualified buying enquiries to the RFQ process so the sales team can pursue them",
      "Keep each conversation's status current so colleagues can see what is in hand",
      "Keep the working view free of spam and misdirected messages"
    ],
    "checklist": [
      "Open every Unread message and set it to Read",
      "Reply to enquiries awaiting a response, then move them to Replied",
      "Convert any buying enquiry into an RFQ before you take any other action on it",
      "Close resolved messages that need no further follow-up",
      "Report spam or misdirected messages so the working queue stays clean"
    ],
    "bestPractices": [
      "Reply while the enquiry is still fresh, since a same-day response reads as attentive",
      "Read the full message before deciding whether it is a question or an order",
      "Work the oldest Unread messages first so none waits longer than it should",
      "Keep each reply specific to what the sender asked, not a generic acknowledgement",
      "Confirm a message is genuinely spam before you report it, since real enquiries can be short"
    ],
    "important": [
      "Only Business Development and admin tiers can action this queue; other roles have no access",
      "A buying enquiry closed here never reaches the sales pipeline, so convert it to an RFQ before you close it",
      "Because status is visible to the whole team, an inaccurate state misleads whoever handles the message next",
      "These enquiries come from the public Contact page, so a slow or missing reply is felt directly by prospects"
    ],
    "quickTips": [
      "If you are unsure whether it is a sale, convert to RFQ and let the pipeline requalify it",
      "Use Closed only for finished conversations, never to park a live enquiry",
      "Set Read the moment you open a message so a colleague does not answer it in parallel"
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "reports"
    ]
  },
  {
    "id": -10,
    "scope": "page",
    "refKey": "applications",
    "title": "Job Applications",
    "department": "HR",
    "purpose": "Job Applications is the recruitment queue fed by the public Careers page. Every candidate submission lands here in one place, so you can assess applicants and move them through the hiring pipeline from a single screen.",
    "workflow": [
      "New",
      "Shortlisted",
      "Interview",
      "Offer",
      "Hired or Rejected"
    ],
    "responsibilities": [
      "Review each submission as it lands in New and decide whether to take it forward.",
      "Progress suitable candidates through Shortlisted, Interview and Offer as they clear each step.",
      "Close every candidate out to Hired or Rejected once the decision is final.",
      "Confirm interview and offer outcomes with the hiring team, then update the stage to match."
    ],
    "checklist": [
      "Open the New stage and read every application received since your last visit.",
      "Shortlist the strongest applicants and move them out of New.",
      "Update the Interview and Offer stages to match any outcomes decided today.",
      "Close finished candidates into Hired or Rejected so they leave the active pipeline.",
      "Scan the whole queue for any stage that no longer matches reality and correct it."
    ],
    "bestPractices": [
      "Base each shortlisting decision on genuine fit with the role, so your standard stays consistent across the queue.",
      "Keep candidates moving; anyone left in one stage too long usually signals a decision that is overdue.",
      "Set a regular rhythm for working the queue rather than dipping in only when a submission arrives.",
      "Agree with the hiring team what each stage means, so New, Shortlisted and Interview read the same to everyone."
    ],
    "important": [
      "Only HR can change an application's status; other admin tiers can view the queue but cannot edit it.",
      "Because the wider team reads this screen to see where a candidate stands, a stage left out of date misleads everyone who checks it.",
      "A rejection closed without a documented reason leaves no record of why the decision was made."
    ],
    "quickTips": [
      "Clear the New stage before anything else; those applicants are the most likely to take work elsewhere while they wait.",
      "Update a stage the moment a decision is final, rather than saving changes for one batch at the end of the day."
    ],
    "related": [
      "users",
      "roles"
    ]
  },
  {
    "id": -11,
    "scope": "page",
    "refKey": "users",
    "title": "User Management",
    "department": "Administration",
    "purpose": "User Management is where you create team members, assign each person's role and territory, and set whether an account is active or deactivated. The choices here carry weight: a role determines which modules a colleague can open and whether their access is manage or view-only.",
    "workflow": [
      "Create the record for the new team member.",
      "Assign the role that matches their job, which sets the modules they can open.",
      "For a Business Development user, define the territory by selecting the relevant countries and product categories.",
      "Activate the account to grant access, then deactivate it to withdraw access when the person no longer needs it."
    ],
    "responsibilities": [
      "Keep each person's role aligned with their current job so module access stays correct.",
      "Maintain Business Development territories so the assigned countries and product categories reflect current ownership.",
      "Withdraw access without delay when a colleague leaves or moves to different duties.",
      "Review on a regular cadence who holds manage-level access, and confirm each grant is still warranted.",
      "Prepare new joiners with the right role before their first day on the console."
    ],
    "checklist": [
      "Confirm every active account belongs to a current team member.",
      "Check that each Business Development user has countries and product categories set.",
      "Close any account left open for someone who has since left.",
      "Verify no account carries access wider than its holder's duties require.",
      "Add any new joiner still waiting for access."
    ],
    "bestPractices": [
      "Grant the narrowest role that still lets the person do their work.",
      "Prefer deactivation over deletion so the account and its audit history remain intact.",
      "Confirm a joiner's role with their manager before you activate their access.",
      "Give each colleague their own account rather than a shared one, so activity and access stay tied to a single person.",
      "Fold account setup and deactivation into your joiner and leaver routine so access never lags a personnel change."
    ],
    "important": [
      "Only Super Admin and Senior Admin can create or change users; Admin and HR see this screen as view-only.",
      "A role change takes effect immediately and can widen or remove access, so check the impact before you save.",
      "Access remains live until an account is deactivated, since there is no automatic expiry when someone leaves.",
      "Every change on this screen is recorded, so each action stays attributable to the person who made it.",
      "A Business Development user with no territory set receives no auto-routed enquiries."
    ],
    "quickTips": [
      "Give people who need visibility without control a view-only Admin or HR account.",
      "Set a Business Development user's territory before you activate them so routing works from day one.",
      "Deactivating keeps the record, so a returning colleague can have access restored rather than rebuilt."
    ],
    "related": [
      "roles",
      "rfq",
      "export-inquiries",
      "reports"
    ]
  },
  {
    "id": -12,
    "scope": "page",
    "refKey": "roles",
    "title": "Roles & Responsibilities",
    "department": "Administration",
    "purpose": "Roles & Responsibilities is the at-a-glance map of the console's whole access model, showing for every module whether each role holds manage, view-only, or no access, alongside the SOP & Help Management centre in one place. Use it to confirm who holds which permissions before you change anything, and to keep the guidance your team relies on accurate.",
    "responsibilities": [
      "Keep the access matrix aligned with each person's current role, so what a role can reach reflects the work it actually does.",
      "Confirm that a role's level in a module, whether manage, view-only, or no access, matches what that desk is expected to do.",
      "Own the SOP & Help Management centre as the place every desk turns to for how a task is done.",
      "Publish guide edits so the on-screen instructions track how the work is actually carried out.",
      "Revisit the matrix whenever a module is added or a responsibility moves between desks."
    ],
    "checklist": [
      "Open the access matrix and review whether any role still holds access it no longer uses.",
      "Cross-check a recent permission change against what that person actually does day to day.",
      "Read the current SOP & Help Management entries for the modules your team touches.",
      "Correct any guide that no longer matches how the task is carried out.",
      "Note which permission edits are still waiting on the affected user's next sign-in."
    ],
    "bestPractices": [
      "Grant the lowest access level that lets a role finish its work, and widen it only on a demonstrated need.",
      "Change one permission at a time and record why, so the matrix stays straightforward to audit.",
      "Record a new or changed procedure in the SOP & Help Management centre promptly, rather than leaving it in informal notes.",
      "Review view-only assignments periodically, as a desk's needs shift while the catalogue and pipeline grow.",
      "Keep each guide short and specific so the person doing the job can act on it without interpretation."
    ],
    "important": [
      "Only Super Admin and Senior Admin can open this screen; no other role can view or alter the access model.",
      "A permission change takes effect the next time the affected user signs in, not the moment you save it, so plan around that gap.",
      "The matrix mirrors exactly what the backend enforces, so it is a true picture of access rather than a cosmetic setting.",
      "Edits made in the SOP & Help Management tab publish live across the console, so the whole team sees them at once.",
      "Documentation there is version-controlled, so every edit is attributable; make each change deliberately."
    ],
    "quickTips": [
      "Read across a module's row to compare every role's access level for it at a glance.",
      "If an access level looks wrong on the matrix, correct it here rather than working around it elsewhere.",
      "When a permission change must apply now, ask the affected user to sign out and back in."
    ],
    "related": [
      "users",
      "products",
      "reports"
    ]
  },
  {
    "id": -13,
    "scope": "page",
    "refKey": "products",
    "title": "Products",
    "department": "Website",
    "purpose": "Products is the public catalogue manager for the website. Keep the range that visitors and buyers see accurate, current, and clearly organised into categories, so buyers can find and identify the right equipment.",
    "responsibilities": [
      "Add new lines as they come to market and retire any that are no longer sold, so the catalogue matches what the company currently offers.",
      "Record every item code exactly, since customers read it and quote against it.",
      "Assign each product to the correct category so it appears in the right public menu.",
      "Check names, descriptions, and specifications for accuracy before they reach visitors and buyers.",
      "Own the accuracy of the whole catalogue, not only the entries you added, because Business Development quotes from what you publish here."
    ],
    "checklist": [
      "Cross-check the item codes on newly added products against your source records.",
      "Verify that every product carries a category, with none left uncategorised.",
      "Open the live site and confirm your latest saves appear as intended.",
      "Retire or correct any listing for a line that is no longer available.",
      "Look over the products others added today and confirm their details before buyers rely on them."
    ],
    "bestPractices": [
      "Group related products consistently so the public menus stay predictable for buyers.",
      "Work in small, checked batches rather than broad sweeps that are hard to review.",
      "Keep names and descriptions factual and specific, using the terms buyers actually search for.",
      "Coordinate catalogue changes with Business Development so their quotes and the live listings stay aligned."
    ],
    "important": [
      "Every save publishes straight to the public site, so treat the catalogue as live at all times.",
      "An incorrect item code travels with the customer into their enquiry and quote, so getting it right is not optional.",
      "Business Development has read-only access and cannot correct a listing, so any error you leave stays live until you fix it.",
      "Leave a product uncategorised, or in the wrong category, and it sits misplaced or hidden in the public menus."
    ],
    "quickTips": [
      "Fix an error the moment you spot it, since a buyer may already be viewing that listing.",
      "Work through the catalogue one category at a time to catch anything filed in the wrong group.",
      "Keep your source records to hand while editing so each code check takes seconds."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "roles",
      "reports"
    ]
  },
  {
    "id": -14,
    "scope": "page",
    "refKey": "reports",
    "title": "Reports",
    "department": "Administration",
    "purpose": "Reports is the cross-department performance view for the admin tiers, drawing RFQ and export pipeline volume, Won versus Lost conversion, lead response speed, contact-message throughput, and the hiring funnel into one surface. You read it to see where a desk is falling behind its queue and where leads are slipping away, then act in the module that owns the record.",
    "responsibilities": [
      "Track RFQ and export pipeline volume and its Won versus Lost split across departments.",
      "Watch how quickly new leads move to first contact so a slow queue surfaces early.",
      "Monitor contact-message throughput to confirm enquiries are being cleared rather than accumulating unanswered.",
      "Follow the hiring funnel to see where candidates progress and where they stall.",
      "Compare desks against one another to find the team drifting behind its workload."
    ],
    "checklist": [
      "Open Reports and scan the Won versus Lost split for any desk sliding towards Lost.",
      "Check lead response times and flag any queue that is slow to first contact.",
      "Review contact-message throughput against normal volume to catch a backlog forming.",
      "Read the hiring funnel for a stage where candidates are stuck.",
      "Where a figure looks wrong, open the source module to inspect the records behind it.",
      "Note the desks trending down and raise them with the responsible tier lead."
    ],
    "bestPractices": [
      "Read Reports on a set cadence so a trend is caught while it can still be corrected.",
      "Treat a falling conversion rate as a reason to inspect the desk, not a verdict on its own.",
      "Verify a suspect figure before you escalate, so you raise a real problem and not a logging gap.",
      "Judge lead response speed alongside volume, since a busy queue and a neglected one read differently.",
      "Concentrate on the outliers, the desks and stages that break from the usual pattern."
    ],
    "important": [
      "Reports displays data, it does not edit it. Corrections are made in the originating module, whether RFQ Requests, Export Inquiries, Contact Messages, or Job Applications.",
      "The figures are only as reliable as the source records. A skipped or stale update will distort the pipeline and response numbers.",
      "Access is confined to the admin tiers. Handle desk-level performance figures as internal and do not expose them outside that group."
    ],
    "quickTips": [
      "A rising Lost count on one desk usually traces back to slow first contact, so start there.",
      "Quick first contact with few wins means the leads are being worked but not closed.",
      "Flat or empty throughput can mean nothing is being logged upstream, not that nothing arrived."
    ],
    "related": [
      "rfq",
      "export-inquiries",
      "contacts",
      "applications"
    ]
  }
];
