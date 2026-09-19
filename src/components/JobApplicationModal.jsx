import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, UploadCloud, Copy } from 'lucide-react';
import Button from './ui/Button';
import CountrySelect, { useCountryName } from './ui/CountrySelect';
import PhoneField from './ui/PhoneField';
import EmailField from './ui/EmailField';
import { defaultCountry } from '../data/countriesData';
import { submitPublicForm, submitPublicFormWithFile } from '../data/adminApi';
import { track, EVENTS } from '../lib/analytics';
import { EASE } from '../lib/motion';
import { EMAIL_RE, fieldCls } from '../lib/forms';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useLT } from '../i18n/LocaleContext';

/*
 * Full-screen, multi-step job application — an enterprise recruitment journey (Personal →
 * Qualification → Professional → Resume → Questions → Review) with a progress bar, per-step
 * validation and a redesigned confirmation that shows a real Application ID.
 *
 * Rendered inside the parent's <AnimatePresence>, keyed by the role, with { job, onClose }.
 * Backend-compatible: the six first-class columns go in `base`; every extra field (title,
 * alternate contacts, the full education history, designation, gap, the questions) is appended
 * to the `notes` blob as a stable "Label: value" line (the admin ATS parses these back out).
 */
const TITLES = ['Mr', 'Miss', 'Prefer not to say'];
const EXPERIENCE = ['Fresher (0–1 yr)', '1–3 years', '3–5 years', '5–10 years', '10+ years'];
const NOTICE = ['Immediate', 'Within 15 days', '1 month', '2 months', 'Currently serving notice'];
const HSC_STREAMS = ['Science', 'Commerce', 'Arts / Humanities', 'Vocational', 'Other'];
const DIPLOMA_BRANCHES = ['Mechanical', 'Civil', 'Electrical', 'Electronics', 'Computer', 'Production / Industrial', 'Other'];
const QUALIFICATIONS = [
  '10th / High School', '12th / Higher Secondary', 'ITI', 'Diploma',
  "Bachelor's Degree (B.E. / B.Tech)", "Bachelor's Degree (Other)",
  "Master's Degree (M.E. / M.Tech)", "Master's Degree (Other)", 'MBA', 'Doctorate / PhD', 'Other',
];
const MAX_RESUME_MB = 5;

// EMAIL_RE lives in lib/forms (shared with CatalogueRequestModal); phone is digits-only.
const phoneDigits = (v) => (v || '').replace(/\D/g, '');

const STEP_TITLE = ['Personal Information', 'Qualification Details', 'Professional Information', 'Resume & Links', 'A Few Questions', 'Review & Submit'];
const STEP_NAME = ['Personal', 'Qualification', 'Professional', 'Resume', 'Questions', 'Review'];
const STEP_DESC = [
  'Tell us who you are and how to reach you.',
  'Your education history and highest qualification.',
  'Your experience and current role.',
  'Attach your CV and share your links.',
  'A few questions to help us know you better.',
  'Check everything, then submit your application.',
];
const STEP_COUNT = STEP_TITLE.length;

/**
 * The KEAA cube, faint and oversized in the bottom-right corner, so the otherwise blank white
 * application fills with the brand instead of empty space.
 *
 * It is the modal's own SVG cube (see layout/Logo.jsx) at ~5% opacity, `aria-hidden` and
 * `pointer-events-none` so it is invisible to assistive tech and never intercepts a click. The
 * parent clips it (`overflow-hidden`) so the off-corner overhang adds no scrollbars, and the
 * form sits ABOVE it on its own `z-10` layer — the watermark can never land behind a field's
 * text. The three tonal-blue facets survive faintly at this opacity, which keeps it reading as
 * the real logo rather than a flat blob.
 */
function BrandWatermark() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        className="absolute -bottom-16 -right-16 h-[clamp(320px,42vw,560px)] w-[clamp(320px,42vw,560px)] opacity-[0.05]"
      >
        <defs>
          <mask id="apply-cube-gap-mask">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <line x1="50" y1="50" x2="5" y2="50" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
            <line x1="50" y1="50" x2="73" y2="10" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
            <line x1="50" y1="50" x2="73" y2="90" stroke="black" strokeWidth="5.5" strokeLinecap="butt" />
          </mask>
        </defs>
        <g mask="url(#apply-cube-gap-mask)">
          <polygon points="10,50 30,15.36 70,15.36 50,50" fill="#79c7f9" />
          <polygon points="10,50 50,50 70,84.64 30,84.64" fill="#2b84da" />
          <polygon points="50,50 70,15.36 90,50 70,84.64" fill="#2065be" />
        </g>
      </svg>
    </div>
  );
}

const EMPTY = {
  // Personal
  title: '', name: '', email: '', altEmail: '', phone: '', altPhone: '', city: '',
  // Qualification — 10th and Highest are required; 12th and Diploma are filled whichever applies.
  sscSchool: '', sscPercent: '',
  hscStream: '', hscSchool: '', hscPercent: '',
  diplomaBranch: '', diplomaInstitute: '', diplomaPercent: '',
  highestQualification: '', highestInstitute: '', highestSpecialization: '', highestPercent: '',
  eduGap: '', eduGapReason: '',
  // Professional
  experience: '', designation: '', company: '', notice: '', expectedSalary: '', currentCtc: '', expectedCtc: '',
  // Resume & links
  linkedin: '', portfolio: '', github: '', certificates: '',
  // Questions
  whyKeaa: '', whyRole: '', relocate: '', passport: '', travel: '', languages: '',
};

/* ---------------- small controlled field primitives ---------------- */
function TextField({ label, value, onChange, type = 'text', required, placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-navy-800">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={fieldCls} />
    </div>
  );
}
function Select({ label, value, onChange, options, required, className = '' }) {
  const lt = useLT('careers');
  return (
    <div className={className}>
      <label className="text-sm font-medium text-navy-800">{label}{required && <span className="text-red-500"> *</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls}>
        <option value="" disabled>{lt('apply.form.select', 'Select…')}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Textarea({ label, value, onChange, rows = 3, placeholder, className = '' }) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-navy-800">{label}</label>
      <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={fieldCls} />
    </div>
  );
}
/* A segmented pill control — one highlighted choice from a short list. Used for the title and the
 * yes/no questions, so those read as a single toggle rather than a pair of full-width buttons.
 * `fill` spreads the options to equal widths (right for a two-way Yes/No); off, they take their
 * natural width and wrap (right for the longer title options). */
function Segmented({ label, value, onChange, options, required, fill = true, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="text-sm font-medium text-navy-800">{label}{required && <span className="text-red-500"> *</span>}</label>}
      <div className={`${label ? 'mt-1.5' : ''} flex flex-wrap gap-1 rounded-card border border-navy-100 bg-navy-50/50 p-1`}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={value === o}
            className={`${fill ? 'flex-1' : ''} rounded-[0.55rem] px-3 py-1.5 text-sm font-medium transition-colors ${value === o ? 'bg-primary-dark text-white shadow-sm' : 'text-navy-700 hover:text-navy-900'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- steps ---------------- */
function PersonalStep({ form, set, country, setCountry }) {
  const lt = useLT('careers');
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Segmented className="sm:col-span-2" label={lt('apply.personal.title', 'Title')} value={form.title} onChange={(v) => set('title', v)} options={TITLES} fill={false} />
      <TextField label={lt('apply.personal.fullName', 'Full Name')} value={form.name} onChange={(v) => set('name', v)} required placeholder={lt('apply.personal.fullNamePh', 'Your full name')} />
      <CountrySelect id="app-country" value={country} onChange={setCountry} required />
      <PhoneField id="app-phone" country={country} value={form.phone} onChange={(v) => set('phone', v)} required />
      <PhoneField id="app-alt-phone" label={lt('apply.personal.altPhone', 'Alternate Contact No.')} country={country} value={form.altPhone} onChange={(v) => set('altPhone', v)} />
      <EmailField id="app-email" value={form.email} onChange={(v) => set('email', v)} required />
      <EmailField id="app-alt-email" label={lt('apply.personal.altEmail', 'Alternate Email')} value={form.altEmail} onChange={(v) => set('altEmail', v)} />
      <TextField className="sm:col-span-2" label={lt('apply.personal.city', 'Current Location (City)')} value={form.city} onChange={(v) => set('city', v)} placeholder={lt('apply.personal.cityPh', 'e.g. Ludhiana')} />
    </div>
  );
}
function QualificationStep({ form, set }) {
  const lt = useLT('careers');
  return (
    <div className="space-y-7">
      {/* 10th — required. Every applicant has this, so it is the one education row we insist on. */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-navy-900">{lt('apply.qual.ssc', '10th / High School')} <span className="text-red-500">*</span></legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label={lt('apply.qual.school', 'School / Board')} value={form.sscSchool} onChange={(v) => set('sscSchool', v)} required placeholder={lt('apply.qual.schoolPh', 'School and board')} />
          <TextField label={lt('apply.qual.percent', 'Percentage / CGPA')} value={form.sscPercent} onChange={(v) => set('sscPercent', v)} required placeholder={lt('apply.qual.sscPercentPh', 'e.g. 82%')} />
        </div>
      </fieldset>

      {/* 12th — with a stream option. Optional: many candidates take a diploma after 10th instead. */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-navy-900">{lt('apply.qual.hsc', '12th / Higher Secondary')}</legend>
        <div className="grid gap-5 sm:grid-cols-3">
          <Select label={lt('apply.qual.stream', 'Stream')} value={form.hscStream} onChange={(v) => set('hscStream', v)} options={HSC_STREAMS} />
          <TextField label={lt('apply.qual.school', 'School / Board')} value={form.hscSchool} onChange={(v) => set('hscSchool', v)} placeholder={lt('apply.qual.schoolPh', 'School and board')} />
          <TextField label={lt('apply.qual.percent', 'Percentage / CGPA')} value={form.hscPercent} onChange={(v) => set('hscPercent', v)} placeholder={lt('apply.qual.hscPercentPh', 'e.g. 76%')} />
        </div>
      </fieldset>

      {/* Diploma — with a branch option. Optional, for the polytechnic / ITI-then-diploma route. */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-navy-900">{lt('apply.qual.diploma', 'Diploma')}</legend>
        <div className="grid gap-5 sm:grid-cols-3">
          <Select label={lt('apply.qual.branch', 'Branch')} value={form.diplomaBranch} onChange={(v) => set('diplomaBranch', v)} options={DIPLOMA_BRANCHES} />
          <TextField label={lt('apply.qual.institute', 'Institute')} value={form.diplomaInstitute} onChange={(v) => set('diplomaInstitute', v)} placeholder={lt('apply.qual.institutePh', 'Institute name')} />
          <TextField label={lt('apply.qual.percent', 'Percentage / CGPA')} value={form.diplomaPercent} onChange={(v) => set('diplomaPercent', v)} placeholder={lt('apply.qual.diplomaPercentPh', 'e.g. 71%')} />
        </div>
      </fieldset>

      {/* The applicant's own pick of their highest / most recent qualification, plus its detail. */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-bold text-navy-900">{lt('apply.qual.highest', 'Highest / Most Recent Qualification')} <span className="text-red-500">*</span></legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Select label={lt('apply.qual.qualification', 'Qualification')} value={form.highestQualification} onChange={(v) => set('highestQualification', v)} options={QUALIFICATIONS} required />
          <TextField label={lt('apply.qual.percent', 'Percentage / CGPA')} value={form.highestPercent} onChange={(v) => set('highestPercent', v)} required placeholder={lt('apply.qual.highestPercentPh', 'e.g. 8.1 CGPA')} />
          <TextField label={lt('apply.qual.university', 'University / Institute')} value={form.highestInstitute} onChange={(v) => set('highestInstitute', v)} placeholder={lt('apply.qual.universityPh', 'Where you studied')} />
          <TextField label={lt('apply.qual.specialization', 'Specialization')} value={form.highestSpecialization} onChange={(v) => set('highestSpecialization', v)} placeholder={lt('apply.qual.specializationPh', 'e.g. Mechanical Engineering')} />
        </div>
      </fieldset>

      {/* Any break between two education stages, with the reason surfaced only when it applies. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Segmented label={lt('apply.qual.gap', 'Any gap in education?')} value={form.eduGap} onChange={(v) => set('eduGap', v)} options={['Yes', 'No']} />
        {form.eduGap === 'Yes' && (
          <TextField label={lt('apply.qual.gapReason', 'Reason for the gap')} value={form.eduGapReason} onChange={(v) => set('eduGapReason', v)} required placeholder={lt('apply.qual.gapReasonPh', 'Briefly explain the gap')} />
        )}
      </div>
    </div>
  );
}
function ProfessionalStep({ form, set }) {
  const lt = useLT('careers');
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select label={lt('apply.pro.experience', 'Total Experience')} value={form.experience} onChange={(v) => set('experience', v)} options={EXPERIENCE} required />
      <TextField label={lt('apply.pro.designation', 'Current / Last Designation')} value={form.designation} onChange={(v) => set('designation', v)} placeholder={lt('apply.pro.designationPh', 'e.g. Production Engineer')} />
      <TextField label={lt('apply.pro.employer', 'Current / Recent Employer')} value={form.company} onChange={(v) => set('company', v)} placeholder={lt('apply.pro.employerPh', 'Company name')} />
      <Select label={lt('apply.pro.notice', 'Notice Period / Availability')} value={form.notice} onChange={(v) => set('notice', v)} options={NOTICE} required />
      <TextField label={lt('apply.pro.expectedSalary', 'Expected Salary')} value={form.expectedSalary} onChange={(v) => set('expectedSalary', v)} placeholder={lt('apply.pro.expectedSalaryPh', 'e.g. 8,00,000 / year')} />
      <TextField label={lt('apply.pro.currentCtc', 'Current CTC')} value={form.currentCtc} onChange={(v) => set('currentCtc', v)} placeholder={lt('apply.pro.currentCtcPh', 'Annual, if any')} />
      <TextField className="sm:col-span-2" label={lt('apply.pro.expectedCtc', 'Expected CTC')} value={form.expectedCtc} onChange={(v) => set('expectedCtc', v)} placeholder={lt('apply.pro.expectedCtcPh', 'Annual')} />
    </div>
  );
}
function ResumeStep({ form, set, resumeName, resumeError, acceptFile, dragOver, setDragOver }) {
  const lt = useLT('careers');
  return (
    <div className="grid gap-5">
      <div>
        <span className="text-sm font-medium text-navy-800">{lt('apply.resume.label', 'Resume / CV')} <span className="text-red-500">*</span></span>
        <label htmlFor="app-resume"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer.files?.[0]); }}
          className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-card border-2 border-dashed px-4 py-9 text-center transition-colors ${dragOver ? 'border-primary bg-primary/[0.07]' : 'border-navy-200 bg-navy-50/40 hover:border-primary/60 hover:bg-primary/[0.04]'}`}>
          <UploadCloud className="h-7 w-7 text-primary-darker" />
          <p className="text-body-compact font-medium text-text">{resumeName || lt('apply.resume.drop', 'Drag and drop your resume here, or click to browse')}</p>
          <p className="text-xs text-muted">{lt('apply.resume.hint', 'PDF, DOC or DOCX · Max {mb} MB', { mb: MAX_RESUME_MB })}</p>
          <input id="app-resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => acceptFile(e.target.files?.[0])} className="sr-only" />
        </label>
        {resumeError && <p className="mt-1 text-xs font-medium text-red-500">{resumeError}</p>}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="LinkedIn" value={form.linkedin} onChange={(v) => set('linkedin', v)} type="url" placeholder="linkedin.com/in/…" />
        <TextField label={lt('apply.resume.portfolio', 'Portfolio')} value={form.portfolio} onChange={(v) => set('portfolio', v)} type="url" placeholder={lt('apply.resume.portfolioPh', 'Your portfolio URL')} />
        <TextField label="Github" value={form.github} onChange={(v) => set('github', v)} type="url" placeholder="github.com/…" />
        <TextField label={lt('apply.resume.certificates', 'Certificates')} value={form.certificates} onChange={(v) => set('certificates', v)} placeholder={lt('apply.resume.certificatesPh', 'List any certifications')} />
      </div>
    </div>
  );
}
function QuestionsStep({ form, set }) {
  const lt = useLT('careers');
  return (
    <div className="grid gap-5">
      <Textarea label={lt('apply.q.whyKeaa', 'Why do you want to work at KEAA?')} value={form.whyKeaa} onChange={(v) => set('whyKeaa', v)} rows={3} placeholder={lt('apply.q.linesPh', 'A few lines…')} />
      <Textarea label={lt('apply.q.whyRole', 'Why are you a fit for this role?')} value={form.whyRole} onChange={(v) => set('whyRole', v)} rows={3} placeholder={lt('apply.q.linesPh', 'A few lines…')} />
      <div className="grid gap-5 sm:grid-cols-3">
        <Segmented label={lt('apply.q.relocate', 'Willing to relocate?')} value={form.relocate} onChange={(v) => set('relocate', v)} options={['Yes', 'No']} />
        <Segmented label={lt('apply.q.passport', 'Do you hold a passport?')} value={form.passport} onChange={(v) => set('passport', v)} options={['Yes', 'No']} />
        <Segmented label={lt('apply.q.travel', 'Open to travel?')} value={form.travel} onChange={(v) => set('travel', v)} options={['Yes', 'No']} />
      </div>
      <TextField label={lt('apply.q.languages', 'Languages Known')} value={form.languages} onChange={(v) => set('languages', v)} placeholder={lt('apply.q.languagesPh', 'e.g. English, Hindi, Punjabi')} />
    </div>
  );
}
function ReviewSection({ title, step, goTo, rows, reduce }) {
  const lt = useLT('careers');
  const [open, setOpen] = useState(true);
  const shown = rows.filter(([, v]) => v);
  return (
    <div className="rounded-card border border-navy-100 transition-shadow hover:shadow-card">
      <div className="flex items-center justify-between px-4 py-3">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-sm font-bold text-navy-900">
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} /> {title}
        </button>
        <button type="button" onClick={() => goTo(step)} className="text-xs font-semibold text-primary-darker hover:text-primary-deep">{lt('apply.review.edit', 'Edit')}</button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: EASE }} className="overflow-hidden">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 px-4 pb-4 text-sm sm:grid-cols-2">
              {shown.length === 0 ? (
                <p className="text-slate-400 sm:col-span-2">{lt('apply.review.none', 'Nothing entered.')}</p>
              ) : shown.map(([k, v]) => (
                <div key={k}><dt className="text-xs text-slate-400">{k}</dt><dd className="break-words font-medium text-navy-800">{v}</dd></div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function ReviewStep({ form, country, resumeName, goTo, consent, setConsent, reduce }) {
  const lt = useLT('careers');
  const countryName = useCountryName();
  const phone = `${country?.dial || ''} ${form.phone || ''}`.trim();
  const altPhone = form.altPhone ? `${country?.dial || ''} ${form.altPhone}`.trim() : '';
  return (
    <div className="space-y-4">
      <ReviewSection title={lt('apply.review.personal', 'Personal')} step={1} goTo={goTo} reduce={reduce}
        rows={[[lt('apply.review.rows.title', 'Title'), form.title], [lt('apply.review.rows.name', 'Name'), form.name], [lt('apply.review.rows.email', 'Email'), form.email], [lt('apply.review.rows.altEmail', 'Alternate email'), form.altEmail], [lt('apply.review.rows.phone', 'Phone'), phone], [lt('apply.review.rows.altContact', 'Alternate contact'), altPhone], [lt('apply.review.rows.country', 'Country'), countryName(country)], [lt('apply.review.rows.city', 'City'), form.city]]} />
      <ReviewSection title={lt('apply.review.qualification', 'Qualification')} step={2} goTo={goTo} reduce={reduce}
        rows={[
          [lt('apply.review.rows.sscSchool', '10th school / board'), form.sscSchool], [lt('apply.review.rows.sscPercent', '10th %'), form.sscPercent],
          [lt('apply.review.rows.hscStream', '12th stream'), form.hscStream], [lt('apply.review.rows.hscSchool', '12th school'), form.hscSchool], [lt('apply.review.rows.hscPercent', '12th %'), form.hscPercent],
          [lt('apply.review.rows.diplomaBranch', 'Diploma branch'), form.diplomaBranch], [lt('apply.review.rows.diplomaInstitute', 'Diploma institute'), form.diplomaInstitute], [lt('apply.review.rows.diplomaPercent', 'Diploma %'), form.diplomaPercent],
          [lt('apply.review.rows.highestQualification', 'Highest qualification'), form.highestQualification], [lt('apply.review.rows.highestPercent', 'Highest %'), form.highestPercent], [lt('apply.review.rows.institute', 'Institute'), form.highestInstitute], [lt('apply.review.rows.specialization', 'Specialization'), form.highestSpecialization],
          [lt('apply.review.rows.eduGap', 'Education gap'), form.eduGap], [lt('apply.review.rows.gapReason', 'Gap reason'), form.eduGapReason],
        ]} />
      <ReviewSection title={lt('apply.review.professional', 'Professional')} step={3} goTo={goTo} reduce={reduce}
        rows={[[lt('apply.review.rows.experience', 'Experience'), form.experience], [lt('apply.review.rows.designation', 'Designation'), form.designation], [lt('apply.review.rows.employer', 'Employer'), form.company], [lt('apply.review.rows.noticePeriod', 'Notice period'), form.notice], [lt('apply.review.rows.expectedSalary', 'Expected salary'), form.expectedSalary], [lt('apply.review.rows.currentCtc', 'Current CTC'), form.currentCtc], [lt('apply.review.rows.expectedCtc', 'Expected CTC'), form.expectedCtc]]} />
      <ReviewSection title={lt('apply.review.resumeLinks', 'Resume & Links')} step={4} goTo={goTo} reduce={reduce}
        rows={[[lt('apply.review.rows.resume', 'Resume'), resumeName || lt('apply.review.rows.notAttached', 'Not attached')], ['LinkedIn', form.linkedin], [lt('apply.review.rows.portfolio', 'Portfolio'), form.portfolio], ['Github', form.github], [lt('apply.review.rows.certificates', 'Certificates'), form.certificates]]} />
      <ReviewSection title={lt('apply.review.questions', 'Questions')} step={5} goTo={goTo} reduce={reduce}
        rows={[[lt('apply.review.rows.whyKeaa', 'Why KEAA'), form.whyKeaa], [lt('apply.review.rows.whyRole', 'Why this role'), form.whyRole], [lt('apply.review.rows.relocate', 'Relocate'), form.relocate], [lt('apply.review.rows.passport', 'Passport'), form.passport], [lt('apply.review.rows.travelReady', 'Travel ready'), form.travel], [lt('apply.review.rows.languages', 'Languages'), form.languages]]} />
      <label className="flex items-start gap-2.5 rounded-card bg-navy-50 p-4 text-xs leading-relaxed text-ink">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-card border-navy-200 text-primary-dark focus:ring-primary" />
        <span>{lt('apply.review.consent', 'I confirm the information provided is accurate and consent to KEAA International storing and processing my data for recruitment purposes.')}</span>
      </label>
    </div>
  );
}

/* ---------------- success ---------------- */
function SuccessScreen({ appId, job, resumeName, resumeUploaded, onClose, reduce }) {
  const lt = useLT('careers');
  const [copied, setCopied] = useState(false);
  const copy = () => { if (appId) { navigator.clipboard?.writeText(appId).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1800); } };
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-lg py-6 text-center">
      <motion.span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
        initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.05 }}>
        <Check className="h-8 w-8 text-emerald-600" strokeWidth={2.5} />
      </motion.span>
      <h2 className="mt-5 font-display text-2xl font-bold text-text">{lt('apply.success.title', 'Congratulations!')}</h2>
      <p className="mt-2 text-body-compact text-ink">
        {lt('apply.success.p1a', 'Your application for ')}<span className="font-semibold">{job.title}</span>{lt('apply.success.p1b', ' has been received.')}
      </p>

      {appId && (
        <div className="mt-5 inline-flex items-center gap-3 rounded-card border border-navy-100 bg-navy-50 px-4 py-2.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{lt('apply.success.idLabel', 'Application ID')}</span>
          <span className="font-mono text-sm font-bold text-primary-darker">{appId}</span>
          <button type="button" onClick={copy} title={lt('apply.success.copyTitle', 'Copy')} aria-label={lt('apply.success.copyAria', 'Copy application ID')} className="text-slate-400 transition-colors hover:text-primary-darker">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
      <p className="mt-3 text-xs text-muted">{lt('apply.success.saveNote', 'Save this ID. Our HR team will reach out at each stage of the process.')}</p>

      {resumeName && (
        <p className="mt-2 text-xs text-muted">
          {resumeUploaded ? <>{lt('apply.success.cvA', 'Your CV ')}<span className="font-medium">{resumeName}</span>{lt('apply.success.cvB', ' was received.')}</>
            : <>{lt('apply.success.cvFailA', 'We could not attach ')}<span className="font-medium">{resumeName}</span>{lt('apply.success.cvFailB', ', so our team will email you to request it.')}</>}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={onClose}>{lt('apply.success.back', 'Back to Careers')}</Button>
        <button type="button" onClick={copy} className="rounded-card border border-navy-100 px-5 py-2.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-slate-50">
          {copied ? lt('apply.success.copied', 'ID Copied') : lt('apply.success.copy', 'Copy Application ID')}
        </button>
      </div>
    </motion.div>
  );
}

/* ---------------- shell ---------------- */
export default function JobApplicationModal({ job, onClose }) {
  const lt = useLT('careers');
  const reduce = useReducedMotion();
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState(defaultCountry);
  const [form, setForm] = useState(EMPTY);
  const [resumeName, setResumeName] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [consent, setConsent] = useState(false);
  const [stepError, setStepError] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [appId, setAppId] = useState('');

  // Full-screen dialog: keep the page behind it from scrolling while it is open, so a mobile
  // visitor's swipes move the form's own scroll area, not the careers page underneath it.
  useBodyScrollLock(true);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const acceptFile = (file) => {
    if (!file) return;
    if (file.size > MAX_RESUME_MB * 1024 * 1024) { setResumeError(lt('apply.err.fileSize', 'File is larger than {mb} MB. Please upload a smaller file.', { mb: MAX_RESUME_MB })); return; }
    const okExt = /\.(pdf|docx?)$/i.test(file.name);
    const okMime = /pdf|msword|officedocument\.wordprocessingml/i.test(file.type || '');
    if (!okExt && !okMime) { setResumeError(lt('apply.err.fileType', 'Please upload a PDF, DOC or DOCX file.')); return; }
    setResumeError(''); setResumeName(file.name); setResumeFile(file);
  };

  const validate = () => {
    if (step === 1) {
      if (!form.name.trim()) return lt('apply.err.name', 'Please enter your full name.');
      if (!form.email.trim()) return lt('apply.err.email', 'Please enter your email address.');
      if (!EMAIL_RE.test(form.email.trim())) return lt('apply.err.emailInvalid', 'Please enter a valid email address.');
      if (form.altEmail.trim() && !EMAIL_RE.test(form.altEmail.trim())) return lt('apply.err.altEmail', 'Please enter a valid alternate email, or leave it blank.');
      if (!country) return lt('apply.err.country', 'Please select your country.');
      if (!form.phone.trim()) return lt('apply.err.phone', 'Please enter your phone number.');
      if (phoneDigits(form.phone).length < 6) return lt('apply.err.phoneInvalid', 'Please enter a valid phone number.');
      if (form.altPhone.trim() && phoneDigits(form.altPhone).length < 6) return lt('apply.err.altPhone', 'Please enter a valid alternate contact number, or leave it blank.');
    }
    if (step === 2) {
      if (!form.sscSchool.trim()) return lt('apply.err.sscSchool', 'Please enter your 10th school / board.');
      if (!form.sscPercent.trim()) return lt('apply.err.sscPercent', 'Please enter your 10th percentage or CGPA.');
      if (!form.highestQualification) return lt('apply.err.highest', 'Please select your highest qualification.');
      if (!form.highestPercent.trim()) return lt('apply.err.highestPercent', 'Please enter the percentage / CGPA of your highest qualification.');
      if (form.eduGap === 'Yes' && !form.eduGapReason.trim()) return lt('apply.err.gapReason', 'Please add the reason for your education gap.');
    }
    if (step === 3) {
      if (!form.experience) return lt('apply.err.experience', 'Please select your total experience.');
      if (!form.notice) return lt('apply.err.notice', 'Please select your notice period.');
    }
    if (step === 4 && !resumeFile) return lt('apply.err.resume', 'Please attach your resume (PDF, DOC or DOCX).');
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setStepError(err); return; }
    setStepError('');
    setStep((s) => Math.min(STEP_COUNT, s + 1));
  };
  const back = () => { setStepError(''); setStep((s) => Math.max(1, s - 1)); };
  const goTo = (n) => { setStepError(''); setStep(n); };

  const buildNotes = (fileDelivered) => [
    form.title && `Title: ${form.title}`,
    form.altEmail && `Alternate email: ${form.altEmail}`,
    form.altPhone && `Alternate contact: ${country?.dial || ''} ${form.altPhone}`.trim(),
    // Education history
    (form.sscSchool || form.sscPercent) && `10th: ${[form.sscSchool, form.sscPercent].filter(Boolean).join(', ')}`,
    (form.hscStream || form.hscSchool || form.hscPercent) && `12th: ${[form.hscStream, form.hscSchool, form.hscPercent].filter(Boolean).join(', ')}`,
    (form.diplomaBranch || form.diplomaInstitute || form.diplomaPercent) && `Diploma: ${[form.diplomaBranch, form.diplomaInstitute, form.diplomaPercent].filter(Boolean).join(', ')}`,
    form.highestQualification && `Highest qualification: ${[form.highestQualification, form.highestSpecialization, form.highestInstitute, form.highestPercent].filter(Boolean).join(', ')}`,
    form.eduGap && `Education gap: ${form.eduGap}${form.eduGap === 'Yes' && form.eduGapReason ? ` (reason: ${form.eduGapReason})` : ''}`,
    // Professional
    form.designation && `Designation: ${form.designation}`,
    form.company && `Current employer: ${form.company}`,
    form.notice && `Notice: ${form.notice}`,
    form.expectedSalary && `Expected salary: ${form.expectedSalary}`,
    form.currentCtc && `Current CTC: ${form.currentCtc}`,
    form.expectedCtc && `Expected CTC: ${form.expectedCtc}`,
    // Links
    form.linkedin && `LinkedIn: ${form.linkedin}`,
    form.portfolio && `Portfolio: ${form.portfolio}`,
    form.github && `Github: ${form.github}`,
    form.certificates && `Certificates: ${form.certificates}`,
    // Questions
    form.whyKeaa && `Why KEAA: ${form.whyKeaa}`,
    form.whyRole && `Why this role: ${form.whyRole}`,
    form.relocate && `Relocate: ${form.relocate}`,
    form.passport && `Passport: ${form.passport}`,
    form.travel && `Travel ready: ${form.travel}`,
    form.languages && `Languages: ${form.languages}`,
    resumeName && !fileDelivered && `Resume file: ${resumeName} (not received, request from applicant)`,
  ].filter(Boolean).join('\n');

  const submit = async () => {
    if (!consent) { setStepError(lt('apply.err.consent', 'Please confirm the consent checkbox to submit.')); return; }
    const base = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: `${country?.dial || ''} ${form.phone || ''}`.trim(),
      position: job.title,
      experience: form.experience,
      location: form.city.trim(),
      resumeUrl: '',
    };
    setSending(true); setSendError('');
    try {
      let created;
      if (resumeFile) {
        const res = await submitPublicFormWithFile(
          '/api/careers',
          { ...base, notes: buildNotes(true) },
          resumeFile,
          () => submitPublicForm('/api/careers', { ...base, notes: buildNotes(false) })
        );
        setResumeUploaded(res.uploaded);
        created = res.data;
      } else {
        created = await submitPublicForm('/api/careers', { ...base, notes: buildNotes(false) });
        setResumeUploaded(false);
      }
      const id = created && created.id;
      setAppId(id ? `APP-${new Date().getFullYear()}-${String(id).padStart(5, '0')}` : `APP-${new Date().getFullYear()}`);
      track(EVENTS.jobApplication, { position: job.title });
      setSubmitted(true);
    } catch {
      setSendError(lt('apply.err.submit', 'Could not submit your application. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const pct = (step / STEP_COUNT) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label={lt('apply.dialogLabel', 'Apply for {role}', { role: job.title })}>
      {/* Faint KEAA cube filling the empty background. Behind everything (z-0); the sections
          below carry `relative z-10` so it never sits over a field. */}
      <BrandWatermark />

      {/* Header */}
      <header className="relative z-10 border-b border-navy-100 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-start justify-between gap-4">
          <div>
            <span className="eyebrow text-primary-darker">{lt('apply.eyebrow', 'Application')}</span>
            <h1 className="font-display text-lg font-bold text-text">{job.title}</h1>
            <p className="text-xs text-muted">{job.location} · {job.type}</p>
          </div>
          <button onClick={onClose} aria-label={lt('apply.close', 'Close')} className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-navy-700">{lt('apply.close', 'Close')}</button>
        </div>
        {!submitted && (
          <div className="mx-auto mt-4 max-w-2xl">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-navy-900">{lt('apply.progress', 'Step {n} of {total} · {name}', { n: step, total: STEP_COUNT, name: lt(`apply.steps.${step - 1}.name`, STEP_NAME[step - 1]) })}</span>
              <span className="text-slate-400">{Math.round(pct)}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-navy-100">
              <motion.div className="h-full rounded-full bg-primary-dark" initial={false} animate={{ width: `${pct}%` }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 20 }} />
            </div>
          </div>
        )}
      </header>

      {/* Scrollable content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          {submitted ? (
            <SuccessScreen appId={appId} job={job} resumeName={resumeName} resumeUploaded={resumeUploaded} onClose={onClose} reduce={reduce} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={reduce ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, x: -14 }}
                transition={{ duration: 0.25, ease: EASE }}>
                <h2 className="font-display text-xl font-bold text-text">{lt(`apply.steps.${step - 1}.title`, STEP_TITLE[step - 1])}</h2>
                <p className="mb-6 mt-1 text-sm text-muted">{lt(`apply.steps.${step - 1}.desc`, STEP_DESC[step - 1])}</p>
                {step === 1 && <PersonalStep form={form} set={set} country={country} setCountry={setCountry} />}
                {step === 2 && <QualificationStep form={form} set={set} />}
                {step === 3 && <ProfessionalStep form={form} set={set} />}
                {step === 4 && <ResumeStep form={form} set={set} resumeName={resumeName} resumeError={resumeError} acceptFile={acceptFile} dragOver={dragOver} setDragOver={setDragOver} />}
                {step === 5 && <QuestionsStep form={form} set={set} />}
                {step === 6 && <ReviewStep form={form} country={country} resumeName={resumeName} goTo={goTo} consent={consent} setConsent={setConsent} reduce={reduce} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Sticky footer nav */}
      {!submitted && (
        <footer className="relative z-10 border-t border-navy-100 bg-white px-4 py-4 sm:px-6">
          <div className="mx-auto max-w-2xl">
            {(stepError || sendError) && <p role="alert" className="mb-2 text-sm font-medium text-red-600">{sendError || stepError}</p>}
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={back} disabled={step === 1}
                className="rounded-card border border-navy-100 px-5 py-2.5 text-sm font-semibold text-navy-700 transition-colors hover:bg-slate-50 disabled:opacity-40">{lt('apply.back', 'Back')}</button>
              {step < STEP_COUNT ? (
                <button type="button" onClick={next} className="rounded-card bg-primary-dark px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker">{lt('apply.next', 'Next')}</button>
              ) : (
                <button type="button" onClick={submit} disabled={sending || !consent}
                  className="rounded-card bg-primary-dark px-7 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:cursor-not-allowed disabled:opacity-50">
                  {sending ? lt('apply.submitting', 'Submitting…') : lt('apply.submit', 'Submit Application')}
                </button>
              )}
            </div>
          </div>
        </footer>
      )}
    </motion.div>
  );
}
