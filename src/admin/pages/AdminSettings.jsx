import { useEffect, useState } from 'react';
import { Check, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useApi } from '../api/useApi';
import { api } from '../api/client';

/**
 * Website Settings — the single site-settings row (/api/settings). These are the company
 * details and social links the public site currently hard-codes; editing them here stores
 * them server-side so they can change without a deploy once the public site is wired to read
 * from this endpoint. SUPER_ADMIN only (enforced by the backend + the route guard).
 *
 * Multi-value fields (phones, landlines, emails) are plain textareas, one value per line —
 * the same newline shape the backend stores and the site will split on.
 */
const FIELDS = [
  { section: 'Company', items: [
    { key: 'companyName', label: 'Company name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'description', label: 'Description', type: 'textarea' },
  ]},
  { section: 'Address', items: [
    { key: 'addressLine1', label: 'Address line 1' },
    { key: 'addressLine2', label: 'Address line 2' },
    { key: 'fax', label: 'Fax' },
  ]},
  { section: 'Contact (one per line)', items: [
    { key: 'phones', label: 'Mobile numbers', type: 'textarea' },
    { key: 'landlines', label: 'Telephone / landline', type: 'textarea' },
    { key: 'emails', label: 'Emails', type: 'textarea' },
  ]},
  { section: 'Social links', items: [
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'x', label: 'X (Twitter)' },
  ]},
];

export default function AdminSettings() {
  const { data, loading, error } = useApi('/api/settings');
  const [form, setForm] = useState(null);
  const [state, setState] = useState({ saving: false, error: '', done: false });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '', done: false });
    try {
      const saved = await api.put('/api/settings', form);
      setForm(saved);
      setState({ saving: false, error: '', done: true });
    } catch (err) {
      setState({ saving: false, error: err.message || 'Could not save settings.', done: false });
    }
  };

  const field =
    'mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <>
      <PageHeader
        title="Website Settings"
        subtitle="Global company details and social links used across the public site."
        actions={
          <button
            type="submit"
            form="settings-form"
            disabled={state.saving || !form}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-darker disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {state.saving ? 'Saving…' : 'Save changes'}
          </button>
        }
      />

      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {state.error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>}
      {state.done && (
        <p className="mb-4 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Settings saved.
        </p>
      )}

      {loading || !form ? (
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      ) : (
        <form id="settings-form" onSubmit={save} className="grid gap-6 lg:grid-cols-2">
          {FIELDS.map((group) => (
            <div key={group.section} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-base font-bold text-navy-900">{group.section}</h2>
              <div className="mt-4 space-y-4">
                {group.items.map((it) => (
                  <div key={it.key}>
                    <label htmlFor={it.key} className="text-sm font-medium text-navy-800">{it.label}</label>
                    {it.type === 'textarea' ? (
                      <textarea id={it.key} rows={3} value={form[it.key] || ''} onChange={set(it.key)} className={field} />
                    ) : (
                      <input id={it.key} type="text" value={form[it.key] || ''} onChange={set(it.key)} className={field} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </form>
      )}
    </>
  );
}
