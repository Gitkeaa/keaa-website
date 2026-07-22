import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Modal from '../components/Modal';
import { STATUS_FORMS, statusMeta } from './atsConfig';

/**
 * Collects the mandatory fields a target status demands (see STATUS_FORMS) and validates them
 * before the move commits. Statuses without a form skip this modal entirely.
 */
export default function StatusChangeModal({ open, target, onClose, onConfirm }) {
  const form = target ? STATUS_FORMS[target] : null;
  const [values, setValues] = useState({});
  const [err, setErr] = useState('');

  // Reset the form whenever the target status changes so fields never bleed between candidates.
  useEffect(() => {
    setValues({});
    setErr('');
  }, [target]);

  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const submit = () => {
    for (const f of form.fields) {
      if (f.required && !String(values[f.name] ?? '').trim()) {
        setErr(`${f.label} is required.`);
        return;
      }
    }
    onConfirm(values);
  };
  const close = () => {
    setValues({});
    setErr('');
    onClose();
  };

  return (
    <Modal open={open && Boolean(form)} onClose={close} title={form?.title || 'Update status'} maxWidth="max-w-lg">
      {form && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Moving to <span className="font-semibold text-navy-800">{statusMeta(target).label}</span>. Complete the details below.
          </p>
          {form.fields.map((f) => (
            <Field key={f.name} f={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
          ))}
          {err && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={close} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={submit} className="rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white hover:bg-primary-darker">Confirm</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Field({ f, value, onChange }) {
  const base = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';
  const Label = (
    <label className="mb-1 block text-sm font-medium text-navy-800">
      {f.label}
      {f.required && <span className="text-red-500"> *</span>}
    </label>
  );
  if (f.type === 'select') {
    return (
      <div>{Label}
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">Select...</option>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (f.type === 'textarea') {
    return <div>{Label}<textarea rows={3} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={base} /></div>;
  }
  if (f.type === 'rating') {
    return <div>{Label}<StarInput value={Number(value) || 0} onChange={(n) => onChange(n)} /></div>;
  }
  if (f.type === 'file') {
    return (
      <div>{Label}
        <input type="file" onChange={(e) => onChange(e.target.files?.[0]?.name || '')} className={`${base} file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs`} />
        <p className="mt-1 text-xs text-slate-400">Recorded by name locally; the file itself uploads once the backend supports it.</p>
      </div>
    );
  }
  return <div>{Label}<input type={f.type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={base} /></div>;
}

/** A 1..5 star control. Read-only when no `onChange` is passed. */
export function StarInput({ value, onChange, readOnly }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange && onChange(n)}
          className={readOnly ? 'cursor-default' : 'transition-transform hover:scale-110'}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star className={`h-5 w-5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        </button>
      ))}
    </div>
  );
}
