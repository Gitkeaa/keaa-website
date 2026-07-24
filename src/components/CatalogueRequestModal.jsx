import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from './ui/Button';
import CountrySelect from './ui/CountrySelect';
import PhoneField from './ui/PhoneField';
import EmailField from './ui/EmailField';
import { defaultCountry } from '../data/countriesData';
import { submitPublicForm } from '../data/adminApi';

/**
 * The catalogue download gate.
 *
 * A visitor asks for a catalogue, fills five fields, and only then is the file handed over.
 * The submission POSTs to /api/catalogue-requests, where it becomes a CATALOGUE inquiry:
 * stored, auto-assigned by country and product line, emailed to the desk, and visible in the
 * admin console alongside every other lead.
 *
 * Two deliberate decisions:
 *
 *  - THE DOWNLOAD IS NEVER HELD HOSTAGE TO OUR BACKEND. If the POST fails (API down, a
 *    visitor offline mid-submit), the file still opens and the error is swallowed. Losing a
 *    lead is a bad day for sales; blocking a customer from a catalogue they asked for is a
 *    bad day for the customer, and the second is worse.
 *  - THE FILE OPENS FROM THE VISITOR'S OWN CLICK, on the confirm button, not from a promise
 *    callback afterwards. A popup blocker kills `window.open` that is not tied to a gesture,
 *    so the request is fired and the tab is opened in the same handler.
 *
 * Rendered only while open, so the prerenderer never bakes a dead dialog into the HTML.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldCls =
  'mt-1.5 w-full rounded-card border border-navy-100 px-3.5 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function CatalogueRequestModal({ item, onClose }) {
  const reduce = useReducedMotion();
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' });
  const [country, setCountry] = useState(defaultCountry);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === 'string' ? v : v.target.value }));

  // Escape closes, and the page behind must not scroll while the dialog is up.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Please tell us your name.');
    if (!EMAIL_RE.test(form.email.trim())) return setError('Please enter a valid email address.');
    setError('');

    // Fire and forget — see the note above on why the download never waits for this.
    submitPublicForm('/api/catalogue-requests', {
      name: form.name.trim(),
      company: form.company.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() ? `${country?.dial || ''} ${form.phone.trim()}`.trim() : '',
      country: country?.name || '',
      category: item.category || '',
      catalogue: item.title,
    }).catch(() => {});

    // Same user gesture as the submit click, so this survives popup blockers.
    window.open(item.url, '_blank', 'noopener,noreferrer');
    setDone(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalogue-gate-title"
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white shadow-cardHover"
        >
          {done ? (
            <div className="p-8 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-6 w-6 text-primary-dark" strokeWidth={2.5} />
              </span>
              <h2 id="catalogue-gate-title" className="mt-4 font-display text-xl font-bold text-text">
                Your catalogue is opening
              </h2>
              <p className="mt-2 text-body-compact text-ink">
                {item.title} has opened in a new tab. If your browser blocked it,{' '}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary-dark underline"
                >
                  open it here
                </a>
                . Our team will be in touch if you would like pricing or samples.
              </p>
              <Button onClick={onClose} variant="outlineNavy" size="sm" className="mt-6">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                Download catalogue
              </p>
              <h2 id="catalogue-gate-title" className="mt-1 font-display text-xl font-bold text-text">
                {item.title}
              </h2>
              <p className="mt-2 text-body-compact text-ink">
                Tell us who you are and the catalogue opens straight away. We use this only to
                answer your enquiry, never to sell your details on.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="cg-name" className="text-sm font-medium text-navy-800">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cg-name"
                    value={form.name}
                    onChange={set('name')}
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className={fieldCls}
                  />
                </div>

                <div>
                  <label htmlFor="cg-company" className="text-sm font-medium text-navy-800">
                    Company
                  </label>
                  <input
                    id="cg-company"
                    value={form.company}
                    onChange={set('company')}
                    autoComplete="organization"
                    placeholder="Company name"
                    className={fieldCls}
                  />
                </div>

                <EmailField id="cg-email" value={form.email} onChange={set('email')} required />

                <div className="grid gap-4 sm:grid-cols-2">
                  <CountrySelect id="cg-country" value={country} onChange={setCountry} />
                  <PhoneField id="cg-phone" country={country} value={form.phone} onChange={set('phone')} />
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-card bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <Button type="button" onClick={onClose} variant="outlineNavy" size="sm">
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Get the catalogue
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
