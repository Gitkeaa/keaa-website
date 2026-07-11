export default function SectionHeading({
  eyebrow,
  title,
  desc,
  align = 'center',
  light = false,
  line = false,
  className = '',
}) {
  const alignment =
    align === 'center' ? 'text-center mx-auto' : align === 'right' ? 'text-right ml-auto' : 'text-left';

  return (
    <div className={`max-w-2xl ${alignment} ${className}`}>
      {eyebrow && (
        <span className={`eyebrow ${light ? 'text-primary-light' : 'text-primary-darker'}`}>
          {line && <span className="h-px w-5 bg-current" />}
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-3 font-display text-3xl sm:text-4xl font-bold leading-tight ${
          light ? 'text-white' : 'text-navy-800'
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p className={`mt-4 text-base leading-relaxed ${light ? 'text-white/70' : 'text-ink/70'}`}>
          {desc}
        </p>
      )}
    </div>
  );
}
