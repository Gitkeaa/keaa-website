import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from './ui/Button';
import CountrySelect from './ui/CountrySelect';
import PhoneField from './ui/PhoneField';
import EmailField from './ui/EmailField';
import WordLimitTextarea from './ui/WordLimitTextarea';
import { defaultCountry } from '../data/countriesData';
import { submitPublicForm, submitPublicFormWithFile } from '../data/adminApi';

const EXPERIENCE = ['Fresher (0–1 yr)', '1–3 years', '3–5 years', '5–10 years', '10+ years'];
const NOTICE = ['Immediate', 'Within 15 days', '1 month', '2 months', 'Currently serving notice'];
const QUALIFICATIONS = [
  '10th / High School',
  '12th / Higher Secondary',
  'ITI',
  'Diploma',
  "Bachelor's Degree (B.E. / B.Tech)",
  "Bachelor's Degree (Other)",
  "Master's Degree (M.E. / M.Tech)",
  "Master's Degree (Other)",
  'MBA',
  'Doctorate / PhD',
  'Other',
];
const MAX_RESUME_MB = 5;

const inputCls =
  'mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary';

function Field({ label, id, type = 'text', required = false, placeholder = '', className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input id={id} type={type} required={required} placeholder={placeholder} className={inputCls} />
    </div>
  );
}

function SelectField({ label, id, required = false, options, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select id={id} required={required} defaultValue="" className={inputCls}>
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

/*
 * Full job-application dialog, styled like a professional careers portal.
 * Rendered inside the parent's <AnimatePresence> and keyed by the role, so each
 * opening gets a fresh form. The outer wrapper (not the card) scrolls, which
 * keeps the searchable Country dropdown from being clipped. No backend — submit
 * shows a confirmation, matching the rest of the site's forms.
 */
export default function JobApplicationModal({ job, onClose }) {
  const [country, setCountry] = useState(defaultCountry);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState('');
  /* Whether the CV actually reached the server. Drives what the success screen promises —
     telling an applicant "we have your CV" when the backend dropped it would be a lie. */
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (id) => form.querySelector('#' + id)?.value?.trim() || '';
    // Extra fields the entity has no column for (LinkedIn, qualification, notice, employer)
    // go into `notes` so nothing the applicant typed is lost.
    const notes = (fileDelivered) =>
      [
        message && `Message: ${message}`,
        val('app-qual') && `Qualification: ${val('app-qual')}`,
        val('app-notice') && `Notice: ${val('app-notice')}`,
        val('app-company') && `Current employer: ${val('app-company')}`,
        val('app-linkedin') && `LinkedIn/Portfolio: ${val('app-linkedin')}`,
        // Only claim the file is missing when it genuinely is.
        resumeName && !fileDelivered && `Resume file: ${resumeName} (not received, request from applicant)`,
      ]
        .filter(Boolean)
        .join('\n');

    const base = {
      name: val('app-name'),
      email,
      phone: `${country?.dial || ''} ${phone || ''}`.trim(),
      position: job.title,
      experience: val('app-exp'),
      location: val('app-city'),
      // `resumeUrl` is for the stored CV, which only the server can produce. It used to be
      // filled with the LinkedIn URL, which meant the admin console's "resume" link opened
      // a profile page — misleading for whoever was screening applications. LinkedIn is in
      // `notes` where it belongs.
      resumeUrl: '',
    };

    setSending(true);
    setSendError('');
    try {
      if (resumeFile) {
        const { uploaded } = await submitPublicFormWithFile(
          '/api/careers',
          { ...base, notes: notes(true) },
          resumeFile,
          // Replayed only if the server cannot take multipart at all — see adminApi.js.
          () => submitPublicForm('/api/careers', { ...base, notes: notes(false) })
        );
        setResumeUploaded(uploaded);
      } else {
        await submitPublicForm('/api/careers', { ...base, notes: notes(false) });
        setResumeUploaded(false);
      }
      setSubmitted(true);
    } catch {
      setSendError('Could not submit your application. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setResumeName('');
      setResumeFile(null);
      return;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setResumeError(`File is larger than ${MAX_RESUME_MB} MB. Please upload a smaller file.`);
      e.target.value = '';
      setResumeName('');
      setResumeFile(null);
      return;
    }
    /*
      Type is checked here as well as by `accept` on the input, because `accept` is only a
      file-picker filter — it is trivially bypassed by drag-and-drop or by choosing "all
      files". Extension AND mime are both allowed to satisfy it: some systems report an
      empty mime for .doc, so requiring mime alone would reject valid CVs.
    */
    const okExt = /\.(pdf|docx?)$/i.test(file.name);
    const okMime = /pdf|msword|officedocument\.wordprocessingml/i.test(file.type || '');
    if (!okExt && !okMime) {
      setResumeError('Please upload a PDF, DOC or DOCX file.');
      e.target.value = '';
      setResumeName('');
      setResumeFile(null);
      return;
    }
    setResumeError('');
    setResumeName(file.name);
    // The FILE itself is kept now, not just its name — the name alone was all that ever
    // reached the server, so nobody's CV was actually being delivered.
    setResumeFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Apply for ${job.title}`}
    >
      <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-3xl rounded-card bg-white p-7 shadow-2xl"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-[13px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-navy-700"
          >
            Close
          </button>

          <span className="eyebrow text-primary-darker">Job Application</span>
          <h3 className="mt-1 pr-24 font-display text-xl font-bold text-text">{job.title}</h3>
          <div className="mt-3 flex flex-wrap gap-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                Location
              </p>
              <p className="mt-0.5 text-xs text-ink">{job.location}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                Type
              </p>
              <p className="mt-0.5 text-xs text-ink">{job.type}</p>
            </div>
          </div>

          {submitted ? (
            <div className="mt-8 flex flex-col items-center rounded-card bg-navy-50 p-8 text-center">
              <p className="font-display text-lg font-semibold text-text">
                Application Submitted
              </p>
              <p className="mt-1.5 text-body-compact text-ink">
                Thank you for applying for <span className="font-medium">{job.title}</span>. Our HR
                team will review your profile and reach out if it&rsquo;s a match.
              </p>
              {/* The applicant is told what actually happened to their file. If the server
                  could not take it, saying nothing would leave them believing we have a CV
                  we do not — and they would never think to send it. */}
              {resumeName && (
                <p className="mt-2 text-xs text-muted">
                  {resumeUploaded ? (
                    <>
                      Your CV <span className="font-medium">{resumeName}</span> was received.
                    </>
                  ) : (
                    <>
                      We could not attach <span className="font-medium">{resumeName}</span>, so
                      our team will email you to request it.
                    </>
                  )}
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-5 text-sm font-semibold text-primary-darker hover:text-primary-deep"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" id="app-name" required />
              <EmailField id="app-email" value={email} onChange={setEmail} required />
              <CountrySelect id="app-country" value={country} onChange={setCountry} required />
              <PhoneField id="app-phone" country={country} value={phone} onChange={setPhone} required />
              <Field label="Current Location (City)" id="app-city" placeholder="e.g. Ludhiana" />
              <SelectField label="Total Experience" id="app-exp" required options={EXPERIENCE} />
              <Field label="Current / Recent Employer" id="app-company" placeholder="Company name" />
              <SelectField label="Highest Qualification" id="app-qual" required options={QUALIFICATIONS} />
              <SelectField label="Notice Period / Availability" id="app-notice" required options={NOTICE} />
              <Field label="LinkedIn / Portfolio" id="app-linkedin" type="url" placeholder="Profile or portfolio URL" />

              {/* Resume upload */}
              <div className="sm:col-span-2">
                <span className="text-sm font-medium text-navy-800">
                  Resume / CV <span className="text-red-500">*</span>
                </span>
                <label
                  htmlFor="app-resume"
                  className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-card border-2 border-dashed border-navy-200 bg-navy-50/40 px-4 py-4 transition-colors hover:border-primary/60 hover:bg-primary/[0.05]"
                >
                  <span className="flex-shrink-0 text-[13px] font-bold uppercase tracking-[0.12em] text-primary-darker">
                    Upload
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-body-compact font-medium text-text">
                      {resumeName || 'Click to upload your resume'}
                    </p>
                    <p className="text-xs text-muted">PDF, DOC or DOCX · Max {MAX_RESUME_MB} MB</p>
                  </div>
                  <input
                    id="app-resume"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword"
                    required
                    onChange={onFile}
                    className="sr-only"
                  />
                </label>
                {resumeError && <p className="mt-1 text-xs font-medium text-red-500">{resumeError}</p>}
              </div>

              <WordLimitTextarea
                className="sm:col-span-2"
                id="app-message"
                label="Cover Message"
                value={message}
                onChange={setMessage}
                maxWords={200}
                rows={4}
                placeholder="Tell us why you're a great fit for this role…"
              />

              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink sm:col-span-2">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-card border-navy-200 text-primary-dark focus:ring-primary"
                />
                <span>
                  I confirm the information provided is accurate and consent to KEAA International
                  storing and processing my data for recruitment purposes.
                </span>
              </label>

              <div className="sm:col-span-2">
                {sendError && (
                  <p role="alert" className="mb-3 rounded-card bg-red-50 px-3 py-2 text-body-compact text-red-700">
                    {sendError}
                  </p>
                )}
                <Button type="submit" disabled={sending}>
                  {sending ? 'Submitting…' : 'Submit Application'}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
