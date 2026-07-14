import { useState } from 'react';
import { Building2 } from 'lucide-react';

/**
 * Renders a real photo (premium, curated) with a subtle hover zoom, a skeleton
 * shimmer while loading, and a soft gradient overlay for legibility. Falls
 * back to a styled placeholder block when no `src` is supplied -- kept so any
 * slot can be wired to a photo later without touching layout code.
 */
export default function ImagePlaceholder({
  label,
  icon: Icon = Building2,
  className = '',
  tone = 'navy',
  ratio = 'aspect-[4/3]',
  src,
  srcSet,
  sizes,
  alt,
  overlay = false,
  zoom = true,
  caption,
}) {
  const [loaded, setLoaded] = useState(false);
  const tones = {
    navy: 'from-navy-800 via-navy-700 to-navy-600',
    light: 'from-navy-100 via-navy-50 to-white',
  };

  const textTone = tone === 'light' ? 'text-navy-400' : 'text-white/70';

  if (src) {
    return (
      <div className={`group relative overflow-hidden rounded-xl ${ratio} ${className}`}>
        {!loaded && <div className="absolute inset-0 animate-pulse bg-navy-100" />}
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt || label || ''}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${zoom ? 'group-hover:scale-110' : ''}`}
          style={{ transitionProperty: 'opacity, transform', transitionDuration: '500ms, 700ms' }}
        />
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/10 to-transparent" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${ratio} bg-gradient-to-br ${tones[tone]} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 14px)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
        <Icon className={`h-7 w-7 ${textTone}`} strokeWidth={1.5} />
        {label && <span className={`text-xs font-medium leading-tight ${textTone}`}>{label}</span>}
        {caption && (
          <span className={`text-[10px] font-medium uppercase tracking-wide ${textTone} opacity-70`}>
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
