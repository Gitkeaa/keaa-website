/*
 * Phone number field with an automatic STD/ISD dialling-code prefix. The prefix
 * (flag + code) is driven by the country selected elsewhere in the form, so
 * picking a country instantly sets the right code here.
 */
import { useLT } from '../../i18n/LocaleContext';

export default function PhoneField({
  country,
  value,
  onChange,
  id = 'phone',
  label,
  required = false,
}) {
  const lt = useLT('common');
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label ?? lt('phoneField.label', 'Phone Number')} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="mt-1.5 flex overflow-hidden rounded-card border border-navy-100 transition-colors focus-within:border-primary">
        <span className="flex flex-shrink-0 items-center border-r border-navy-100 bg-navy-50/60 px-3 text-sm font-medium text-navy-700">
          {country?.dial}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          value={value}
          onChange={(e) => onChange?.(e.target.value.replace(/[^\d\s-]/g, ''))}
          required={required}
          placeholder="98765 43210"
          className="w-full px-3.5 py-2.5 text-sm outline-none"
        />
      </div>
    </div>
  );
}
