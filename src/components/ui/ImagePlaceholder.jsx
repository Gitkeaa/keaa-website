import { useState } from 'react';
import { imgSrcSet } from '../../data/images';

/**
 * Renders a real photo (premium, curated) with a subtle hover zoom, a skeleton
 * shimmer while loading, and a soft gradient overlay for legibility. Falls
 * back to a styled placeholder block when no `src` is supplied -- kept so any
 * slot can be wired to a photo later without touching layout code.
 *
 * It also falls back to that placeholder when the image FAILS to load (onError) --
 * e.g. if the CDN is unreachable or an asset has been removed -- so a broken URL shows
 * the branded "coming soon" block instead of a permanent grey shimmer or a broken-image
 * icon. When the CDN recovers, the images load normally again with no code change.
 */
export default function ImagePlaceholder({
  label,
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
  /**
   * For the one image on a page that is its Largest Contentful Paint.
   *
   * The default treatment is right for the many photos that sit below the fold: lazy, and
   * faded in over half a second once decoded. Applied to the image the page is MEASURED
   * on, it is doubly wrong. Lazy loading tells the browser it may wait, and an image held
   * at opacity 0 has not been painted, so the fade postpones the very moment LCP records.
   * On a product page that image is the main product photograph.
   *
   * Set this on exactly one image per page. Setting it on several is the same as setting
   * it on none, because it works by telling the browser what to fetch FIRST.
   */
  priority = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Right-size on delivery. Every `img.*` source is built at 1920px; in a half-width slot
  // that ships ~4x the pixels the layout ever shows. When no explicit srcSet is passed,
  // generate a responsive one so the browser fetches an appropriately sized file.
  //
  // The test is for a Cloudinary FETCH url carrying a `w_` transform — that is the shape
  // `img.*` now produces (stock photography proxied through Cloudinary rather than loaded
  // straight from Unsplash; see src/data/images.js). Local files (/images/*) and plain
  // Cloudinary upload URLs have no `,w_` transform and are left untouched.
  const autoSrcSet =
    !srcSet && src && src.includes('/image/fetch/') && /,w_\d+/.test(src)
      ? imgSrcSet(src)
      : undefined;
  const resolvedSrcSet = srcSet || autoSrcSet;
  const resolvedSizes = sizes || (resolvedSrcSet ? '(min-width: 1024px) 55vw, 100vw' : undefined);

  const tones = {
    navy: 'from-navy-800 via-navy-700 to-navy-600',
    light: 'from-navy-100 via-navy-50 to-white',
  };

  const textTone = tone === 'light' ? 'text-navy-400' : 'text-white/70';

  if (src && !errored) {
    return (
      <div className={`group relative overflow-hidden rounded-card ${ratio} ${className}`}>
        {!loaded && <div className="absolute inset-0 animate-pulse bg-navy-100" />}
        <img
          src={src}
          srcSet={resolvedSrcSet}
          sizes={resolvedSizes}
          alt={alt || label || ''}
          loading={priority ? 'eager' : 'lazy'}
          // Lowercase on purpose: React 18.3 does not recognise the camelCase spelling
          // and drops it with a warning. Same reasoning as layout/Logo.jsx.
          fetchpriority={priority ? 'high' : undefined}
          decoding={priority ? 'sync' : 'async'}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          // A priority image is painted the moment it arrives. The fade is a nicety for
          // photos that stream in below the fold; on the LCP element it is only a delay.
          className={`h-full w-full object-cover ${
            priority
              ? ''
              : `transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`
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
      className={`relative overflow-hidden rounded-card ${ratio} bg-gradient-to-br ${tones[tone]} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 14px)',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
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
