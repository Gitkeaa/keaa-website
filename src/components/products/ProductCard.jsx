import { Link } from 'react-router-dom';
import { Package, CircleDot, ArrowUpRight } from 'lucide-react';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import Badge from '../ui/Badge';
import { productImage, productSrcSet } from '../../data/productHelpers';

// Card widths across the grid's breakpoints (2/3/4/5 columns), so the browser fetches a
// right-sized WebP/AVIF instead of one fixed file.
const CARD_SIZES = '(min-width:1280px) 18vw, (min-width:1024px) 22vw, (min-width:640px) 30vw, 46vw';

/**
 * One product in the catalog grid — real Cloudinary image (f_auto,q_auto + a responsive
 * srcSet), name, item code, the derived tube Ø and finish tag. Products with no scraped
 * image fall back to a branded "Image coming soon" placeholder via ImagePlaceholder's
 * no-src branch, so a card is never blank and the product is never dropped from the list.
 * The whole card links to the product detail page.
 */
export default function ProductCard({ product }) {
  const src = productImage(product, { w: 600, h: 450, crop: 'fill' });
  const srcSet = productSrcSet(product, [240, 360, 480, 600, 900]);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-black bg-white shadow-card outline-none transition-shadow duration-300 hover:shadow-cardHover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden bg-navy-50">
        <ImagePlaceholder
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? CARD_SIZES : undefined}
          label={product.name}
          alt={product.name}
          icon={Package}
          tone="light"
          ratio="aspect-[4/3]"
          className="!rounded-none"
          caption={product.hasImage ? undefined : 'Image coming soon'}
        />
        <span className="pointer-events-none absolute right-2 top-2 flex h-7 w-7 translate-y-1 items-center justify-center rounded-full bg-white/95 text-primary-dark opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-sm font-semibold text-navy-800 transition-colors group-hover:text-primary-dark">
          {product.name}
        </h3>
        {product.itemCode && (
          <p className="mt-1 font-mono text-xs font-medium text-primary-dark">{product.itemCode}</p>
        )}
        {product.diameter && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
            <CircleDot className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
            {product.diameter}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {product.finish ? (
            <Badge tone="gold" className="!px-2 !py-0.5 !text-[11px]">
              {product.finish}
            </Badge>
          ) : (
            <span className="text-[11px] text-text-muted">{product.subcategory}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
