import { Link } from 'react-router-dom';
import ImagePlaceholder from '../ui/ImagePlaceholder';
import Badge from '../ui/Badge';
import { productImage, productSrcSet } from '../../data/productHelpers';
import { useLT, useProductL10n } from '../../i18n/LocaleContext';
import { productPath } from '../../data/productPaths';

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
  const lt = useLT('catalog');
  const { lp } = useProductL10n();
  // Name and finish in the active language; id, code and images come from the original.
  const p = lp(product);
  const src = productImage(product, { w: 600, h: 450, crop: 'fill' });
  const srcSet = productSrcSet(product, [240, 360, 480, 600, 900]);

  return (
    <Link
      to={productPath(product.id) || `/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-navy-100 bg-white shadow-card outline-none transition-shadow duration-300 hover:shadow-cardHover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative overflow-hidden bg-navy-50">
        <ImagePlaceholder
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? CARD_SIZES : undefined}
          label={p.name}
          alt={p.name}
          tone="light"
          ratio="aspect-[4/3]"
          className="!rounded-none"
          caption={product.hasImage ? undefined : lt('card.imageSoon', 'Image coming soon')}
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 border-b border-transparent pb-0.5 font-display text-sm font-semibold text-text transition-colors group-hover:border-primary group-hover:text-primary-dark">
          {p.name}
        </h3>
        {product.itemCode && (
          <p className="mt-1 font-mono text-xs font-medium text-primary-dark">{product.itemCode}</p>
        )}
        {product.diameter && (
          <div className="mt-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
              {lt('card.diameter', 'Diameter')}
            </p>
            <p className="mt-0.5 text-xs leading-tight text-text-muted">{product.diameter}</p>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {p.finish ? (
            <Badge tone="gold" className="!px-2 !py-0.5 !text-[11px]">
              {p.finish}
            </Badge>
          ) : (
            <span className="text-[11px] text-text-muted">{lt(`sub.${product.subSlug}.name`, product.subcategory)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
