export default function SectionHeading({
  eyebrow,
  title,
  desc,
  align = 'center',
  light = false,
  className = '',
}) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <span className={`eyebrow ${light ? 'text-primary-light' : 'text-primary-darker'}`}>
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight ${
          light ? 'text-white' : 'text-text'
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          /* `text-body` carries both the 16px size and the 1.6 leading from the shared
             tokens, so this section lead can never drift from the site's body copy. */
          className={`mt-4 text-body ${light ? 'text-white/85' : 'text-text-body'}`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}
