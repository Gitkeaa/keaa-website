import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, MapPin, Clock, CheckCircle2, UploadCloud } from 'lucide-react';
import Button from './ui/Button';
import CountrySelect from './ui/CountrySelect';
import PhoneField from './ui/PhoneField';
import EmailField from './ui/EmailField';
import WordLimitTextarea from './ui/WordLimitTextarea';
import { defaultCountry } from '../data/countriesData';
import { submitPublicForm } from '../data/adminApi';

const EXPERIENCE = ['Fresher (0–1 yr)', '1–3 years', '3–5 years', '5–10 years', '10+ years'];
const NOTICE = ['Immediate', 'Within 15 days', '1 month', '2 months', 'Currently serving notice'];
const MAX_RESUME_MB = 5;

const inputCls =
  'mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary';

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
  const [resumeError, setResumeError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const val = (id) => form.querySelector('#' + id)?.value?.trim() || '';
    // The applicant's message + all the extra fields the entity doesn't have its own column
    // for (LinkedIn, qualification, notice, employer, resume filename) go into `notes` so
    // nothing is lost. The actual resume FILE isn't uploaded yet — that needs server-side
    // file storage, a follow-up.
    const notes = [
      message && `Message: ${message}`,
      val('app-qual') && `Qualification: ${val('app-qual')}`,
      val('app-notice') && `Notice: ${val('app-notice')}`,
      val('app-company') && `Current employer: ${val('app-company')}`,
      val('app-linkedin') && `LinkedIn/Portfolio: ${val('app-linkedin')}`,
      resumeName && `Resume file: ${resumeName} (not uploaded — request from applicant)`,
    ]
      .filter(Boolean)
      .join('\n');

    setSending(true);
    setSendError('');
    try {
      await submitPublicForm('/api/careers', {
        name: val('app-name'),
        email,
        phone: `${country?.dial || ''} ${phone || ''}`.trim(),
        position: job.title,
        experience: val('app-exp'),
        location: val('app-city'),
        resumeUrl: val('app-linkedin'),
        notes,
      });
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
      return;
    }
    if (file.size > MAX_RESUME_MB * 1024 * 1024) {
      setResumeError(`File is larger than ${MAX_RESUME_MB} MB. Please upload a smaller file.`);
      e.target.value = '';
      setResumeName('');
      return;
    }
    setResumeError('');
    setResumeName(file.name);
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
          className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-7 shadow-2xl"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-navy-50 hover:text-navy-700"
          >
            <X className="h-4 w-4" />
          </button>

          <span className="eyebrow text-primary-darker">Job Application</span>
          <h3 className="mt-1 pr-8 font-display text-xl font-bold text-navy-800">{job.title}</h3>
          <div className="mt-1.5 flex items-center gap-4 text-xs text-ink/55">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {job.type}
            </span>
          </div>

          {submitted ? (
            <div className="mt-8 flex flex-col items-center rounded-xl bg-navy-50 p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <p className="mt-4 font-display text-lg font-semibold text-navy-800">
                Application Submitted
              </p>
              <p className="mt-1.5 text-sm text-ink/60">
                Thank you for applying for <span className="font-medium">{job.title}</span>. Our HR
                team will review your profile and reach out if it&rsquo;s a match.
              </p>
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
              <Field label="Highest Qualification" id="app-qual" placeholder="e.g. B.Tech Mechanical" />
              <SelectField label="Notice Period / Availability" id="app-notice" required options={NOTICE} />
              <Field label="LinkedIn / Portfolio" id="app-linkedin" type="url" placeholder="Profile or portfolio URL" />

              {/* Resume upload */}
              <div className="sm:col-span-2">
                <span className="text-sm font-medium text-navy-800">
                  Resume / CV <span className="text-red-500">*</span>
                </span>
                <label
                  htmlFor="app-resume"
                  className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-navy-200 bg-navy-50/40 px-4 py-4 transition-colors hover:border-primary/60 hover:bg-primary/[0.05]"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-primary-darker shadow-sm">
                    <UploadCloud className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-800">
                      {resumeName || 'Click to upload your resume'}
                    </p>
                    <p className="text-xs text-ink/45">PDF, DOC or DOCX · Max {MAX_RESUME_MB} MB</p>
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

              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-ink/60 sm:col-span-2">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-navy-200 text-primary-dark focus:ring-primary"
                />
                <span>
                  I confirm the information provided is accurate and consent to KEAA International
                  storing and processing my data for recruitment purposes.
                </span>
              </label>

              <div className="sm:col-span-2">
                {sendError && (
                  <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    {sendError}
                  </p>
                )}
                <Button type="submit" icon={Send} disabled={sending}>
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
