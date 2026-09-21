import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/products/ProductCard';
import CtaBand from '../components/CtaBand';
import useSEO, { absoluteUrl } from '../hooks/useSEO';
import { productTitle, productDescription } from '../data/seoKeywords';
import { getProductById, getRelatedProducts, publicIdFromCloudinaryUrl } from '../data/productHelpers';
import { productPath, productIdFromSlug } from '../data/productPaths';
import { landingPageForSubcategory } from '../data/landingPages';
import { cldImage } from '../data/cloudinary';
import { useLT, useProductL10n } from '../i18n/LocaleContext';

/**
 * Product detail page: image gallery, key facts, specifications and related products for a single
 * catalogue item, plus the Product and BreadcrumbList structured data that earns rich results.
 *
 * Lazy-loaded in App.jsx as the `product/:id` route, resolving the id via getProductById. Edit the
 * page layout here; product content lives in src/data/productHelpers and the schema in the block below.
 */
const optimized = (url, opts) => {
  const pid = publicIdFromCloudinaryUrl(url);
  return pid ? cldImage(pid, opts) : null;
};

export default function ProductDetail() {
  const lt = useLT('product');
  const ltc = useLT('catalog');
  const { lp } = useProductL10n();
  /**
   * Two URL shapes reach this page.
   *
   * The readable one, /products/<category>/<subcategory>/<slug>, is what everything links to
   * and what the sitemap carries. The numeric one, /product/136, is the old shape: middleware
   * 301s it at the edge before React loads, so a visitor or a crawler only sees it if they
   * navigate inside the app. Resolving both here means an in-app link that missed the
   * migration still lands on the right product rather than a not-found page.
   */
  const { id: numericId, categorySlug, subSlug, productSlug } = useParams();
  const id = productSlug ? String(productIdFromSlug(categorySlug, subSlug, productSlug) ?? '') : numericId;
  // The catalogue entry, with its name, description and specification rows in the active
  // language (the same object when nothing is translated, see localizeProduct.js).
  const product = lp(getProductById(id));
  const [active, setActive] = useState(0);
  // Category and subcategory names share the catalogue page's dictionary keys.
  const catName = product ? ltc(`cat.${product.catSlug}.name`, product.category) : '';
  const subName = product ? ltc(`sub.${product.subSlug}.name`, product.subcategory) : '';

  // Reset the gallery selection during render (before paint) when the product changes,
  // so navigating between products never flashes the previous product's active image.
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setActive(0);
  }

  /**
   * Product + BreadcrumbList structured data. This is the page that earns rich results
   * (product name, image and SKU in the SERP), so the schema mirrors the visible
   * breadcrumb above the title exactly.
   *
   * No `offers` block: the catalogue publishes no prices, and inventing one — or emitting
   * an empty/zero offer — is exactly what trips Google's structured-data spam checks.
   * Add it here if pricing ever ships.
   */
  const breadcrumbs = product
    ? [
        { label: lt('breadcrumb.home', 'Home'), to: '/' },
        { label: lt('breadcrumb.products', 'Products'), to: '/products' },
        { label: catName, to: `/products/${product.catSlug}` },
        { label: subName, to: `/products/${product.catSlug}/${product.subSlug}` },
        { label: product.name },
      ]
    : undefined;

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        url: absoluteUrl(productPath(product.id) || `/product/${product.id}`),
        ...(product.description ? { description: product.description } : {}),
        ...(product.itemCode ? { sku: product.itemCode, mpn: product.itemCode } : {}),
        ...(product.cloudinaryImages?.length
          ? { image: product.cloudinaryImages.slice(0, 6) }
          : {}),
        category: `${catName} > ${subName}`,
        brand: { '@type': 'Brand', name: 'KEAA International' },
        manufacturer: {
          '@type': 'Organization',
          name: 'KEAA International Pvt. Ltd.',
          url: absoluteUrl('/'),
        },
        ...(product.diameter || product.finish
          ? {
              additionalProperty: [
                product.diameter && {
                  '@type': 'PropertyValue',
                  name: 'Tube Size',
                  value: product.diameter,
                },
                product.finish && {
                  '@type': 'PropertyValue',
                  name: 'Finish',
                  value: product.finish,
                },
              ].filter(Boolean),
            }
          : {}),
      }
    : undefined;

  /**
   * The title used to be the bare product name, so 355 pages competed for phrases like
   * "Accessories" and "Ledger" with nothing to say what they were. The description was
   * the raw `description` field, which on many products is a spec string such as
   * "Powder Coated / Hot Dip Galvanized as per DIN EN 1461": true, and useless as the one
   * line a buyer reads in a search result.
   *
   * Both are now composed from the product data and its range keyword. See
   * data/seoKeywords.js for the templates and the length budgets.
   *
   * Translated titles are deliberately NOT used here. The keyword is the English phrase
   * buyers search, and a localised page still wants to be found for it.
   */
  useSEO({
    title: product ? productTitle(product) : lt('seo.title', 'Product'),
    description: product ? productDescription(product) : subName,
    appendSiteName: !product,
    breadcrumbs,
    schema: productSchema,
  });

  if (!product) {
    return (
      <section className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-text">{lt('notFound.title', 'Product not found')}</h1>
        <p className="body-copy mx-auto text-center mt-2">{lt('notFound.body', 'This product may have been moved or removed.')}</p>
        <Button to="/products" className="mt-6">{lt('notFound.back', 'Back to Products')}</Button>
      </section>
    );
  }

  const images = product.cloudinaryImages || [];
  const mainSrc = images.length
    ? optimized(images[active], { w: 900, h: 900, crop: 'pad', extra: 'b_white' })
    : null;
  const related = getRelatedProducts(product, 5);
  const hasSpecs = product.specs && product.specs.length > 0;
  const landingPage = landingPageForSubcategory(product.subSlug);

  const facts = [
    product.itemCode && { label: lt('facts.itemCode', 'Item Code'), value: product.itemCode },
    product.diameter && { label: lt('facts.tubeSize', 'Tube Size'), value: product.diameter },
    product.finish && { label: lt('facts.finish', 'Finish'), value: product.finish },
    { label: lt('facts.category', 'Category'), value: subName },
  ].filter(Boolean);

  return (
    <>
      <section className="border-b border-navy-100 bg-surface">
        <div className="container-page py-8 lg:py-10">
          {/* Breadcrumb */}
          <nav aria-label={lt('breadcrumb.label', 'Breadcrumb')} className="flex flex-wrap items-center gap-1.5 text-xs text-text-strong">
            <Link to="/" className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{lt('breadcrumb.home', 'Home')}</Link>
            <span aria-hidden className="text-primary">/</span>
            <Link to="/products" className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{lt('breadcrumb.products', 'Products')}</Link>
            <span aria-hidden className="text-primary">/</span>
            <Link to={`/products/${product.catSlug}`} className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{catName}</Link>
            <span aria-hidden className="text-primary">/</span>
            <Link to={`/products/${product.catSlug}/${product.subSlug}`} className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{subName}</Link>
            <span aria-hidden className="text-primary">/</span>
            <span className="font-medium text-text" aria-current="page">{product.name}</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery */}
            <div>
              <div className="overflow-hidden rounded-card border border-navy-100 bg-white shadow-card">
                <ImagePlaceholder
                  src={mainSrc}
                  label={product.name}
                  alt={product.name}
                  tone="light"
                  ratio="aspect-square"
                  zoom={false}
                  /* This is the product page's LCP element. See the note on `priority` in
                     ui/ImagePlaceholder.jsx: it was lazy, which is the one place lazy costs
                     rather than saves. */
                  priority
                  className="!rounded-none"
                  caption={mainSrc ? undefined : lt('gallery.comingSoon', 'Image coming soon')}
                />
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {images.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={lt('gallery.viewImage', 'View image {n}', { n: i + 1 })}
                      className={`h-16 w-16 overflow-hidden rounded-card border-2 transition-colors ${
                        i === active ? 'border-primary-dark' : 'border-navy-100 hover:border-navy-300'
                      }`}
                    >
                      <img src={optimized(url, { w: 120, h: 120, crop: 'fill' })} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="navy">{catName}</Badge>
                {product.finish && <Badge tone="gold">{product.finish}</Badge>}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold text-text">{product.name}</h1>
              {product.itemCode && (
                <p className="mt-1.5 font-mono text-body-compact text-primary-dark">{lt('info.itemCode', 'Item Code: {code}', { code: product.itemCode })}</p>
              )}

              {product.description ? (
                <p className="body-copy mt-5">{product.description}</p>
              ) : (
                <p className="mt-5 rounded-card border-l-2 border-primary/40 bg-navy-50 px-4 py-3 text-body-compact text-text-muted">
                  {lt('info.noDescription', 'Full product description available on request, contact our team for details.')}
                </p>
              )}

              {/* Key facts */}
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-card border border-navy-100 bg-white p-3.5 shadow-card">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
                      {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-navy-800">{f.value}</dd>
                  </div>
                ))}
              </dl>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button to="/contact?tab=rfq">{lt('cta.requestQuote', 'Request a Quote')}</Button>
                <Button to="/contact" variant="outlineNavy">{lt('cta.talkToExpert', 'Talk to an Expert')}</Button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-text">{lt('specs.title', 'Specifications')}</h2>
            {hasSpecs ? (
              <div className="mt-4 overflow-hidden rounded-card border border-navy-100 bg-white shadow-card">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-navy-50">
                    {product.specs.map((s, i) => (
                      <tr key={i} className={i % 2 ? 'bg-navy-50/40' : ''}>
                        <th scope="row" className="w-1/3 px-5 py-3 align-top font-medium text-navy-800">{s.label}</th>
                        <td className="px-5 py-3 text-ink">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 rounded-card border border-dashed border-navy-200 border-l-2 border-l-primary/40 bg-navy-50/40 px-5 py-6 text-body-compact text-text-muted">
                {lt('specs.pending', 'Detailed specifications for this product are being added. Contact our team for the full datasheet.')}
              </p>
            )}

            {/* One line back to the keyword landing page for this range.
                Landing pages linked into the catalogue but nothing linked back, so the pages
                carrying the phrases the site is trying to rank for had no internal links from
                the 355 pages most closely related to them. The anchor text is the landing
                page's own keyword rather than "click here" or the product name, because anchor
                text is one of the few signals a link carries about what it points at.
                Renders nothing for ranges with no landing page yet. */}
            {landingPage && (
              <p className="mt-4 text-body-compact text-text-muted">
                {lt('specs.partOf', 'Part of our')}{' '}
                <Link
                  to={landingPage.to}
                  className="font-semibold text-primary-dark underline-offset-2 hover:underline"
                >
                  {landingPage.keyword}
                </Link>{' '}
                {lt('specs.partOfRange', 'range')}
              </p>
            )}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-text">{lt('related.title', 'Related Products')}</h2>
                <Link
                  to={`/products/${product.catSlug}/${product.subSlug}`}
                  className="border-b border-transparent pb-0.5 text-sm font-medium text-primary-dark transition-colors hover:border-primary hover:text-primary-darker"
                >
                  {lt('related.viewAll', 'View all')}
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CtaBand
        title={lt('band.title', 'Interested in This')}
        accent={lt('band.accent', 'Product?')}
        desc={lt('band.desc', 'Request a quote or talk to our team about specifications, pricing and bulk orders.')}
        cta={{ label: lt('cta.requestQuote', 'Request a Quote'), to: '/contact?tab=rfq' }}
      />
    </>
  );
}
