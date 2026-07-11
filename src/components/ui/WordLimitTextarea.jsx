/*
 * Textarea with a live word-count tracker and a hard word limit. The counter
 * below turns red as it reaches the cap; typing beyond the limit is blocked
 * (deleting always works). Used for message / requirement-details fields.
 */
export default function WordLimitTextarea({
  id,
  label,
  value,
  onChange,
  maxWords = 250,
  rows = 5,
  required = false,
  placeholder = '',
  className = '',
}) {
  const words = value.trim() ? value.trim().split(/\s+/) : [];
  const count = words.length;
  const atLimit = count >= maxWords;

  const handle = (e) => {
    const val = e.target.value;
    const n = val.trim() ? val.trim().split(/\s+/).length : 0;
    // accept while within the limit, or whenever the text is getting shorter
    if (n <= maxWords || val.length < value.length) onChange(val);
  };

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-navy-800">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        required={required}
        value={value}
        onChange={handle}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-navy-100 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-primary"
      />
      <div className="mt-1 flex justify-end">
        <span className={`text-xs ${atLimit ? 'font-semibold text-red-500' : 'text-ink/45'}`}>
          {count} / {maxWords} words
        </span>
      </div>
    </div>
  );
}
