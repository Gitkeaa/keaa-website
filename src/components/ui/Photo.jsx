import { localPhoto, localPhotoSrcSet } from '../../data/images';

/**
 * One of the site's own photographs, delivered at the size the layout actually shows.
 *
 * WHY THIS EXISTS
 * ---------------
 * public/images holds unprocessed camera JPEGs, and every one of them used to be served raw
 * and full size to every device. A team portrait on the contact page was 2.2 MB, another was
 * 1.5 MB, and that page measured a Largest Contentful Paint of 11.2 seconds on a phone. The
 * same portrait through the proxy, at the 640px a phone can actually show, is 46 KB. The
 * pictures were never the problem; sending a 2.2 MB original to a 360px-wide screen was.
 *
 * Takes the same `/images/...` path the data already holds, so nothing in company.js or
 * content.js has to change and a photograph is still swapped by dropping a file in place.
 *
 * `sizes` is the one thing worth getting right per usage: it tells the browser how wide the
 * picture will be BEFORE layout, which is how it picks from the srcset. The default assumes
 * a full-width image; pass something narrower for a thumbnail or a portrait in a grid, or the
 * browser will fetch a bigger rendition than it needs.
 */
export default function Photo({
  src,
  alt = '',
  width = 1200,
  sizes = '100vw',
  className = '',
  loading = 'lazy',
  fetchPriority,
  ...rest
}) {
  if (!src) return null;

  // An absolute URL is already someone else's to optimise (Cloudinary, an uploaded avatar),
  // so it passes straight through rather than being proxied a second time.
  const isLocal = src.startsWith('/');

  return (
    <img
      src={isLocal ? localPhoto(src, width) : src}
      srcSet={isLocal ? localPhotoSrcSet(src) : undefined}
      sizes={isLocal ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      className={className}
      {...rest}
    />
  );
}
