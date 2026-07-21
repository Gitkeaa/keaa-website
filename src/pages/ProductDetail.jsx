import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/products/ProductCard';
import CtaBand from '../components/CtaBand';
import useSEO, { absoluteUrl } from '../hooks/useSEO';
import { getProductById, getRelatedProducts, publicIdFromCloudinaryUrl } from '../data/productHelpers';
import { cldImage } from '../data/cloudinary';

const optimized = (url, opts) => {
  const pid = publicIdFromCloudinaryUrl(url);
  return pid ? cldImage(pid, opts) : null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);
  const [active, setActive] = useState(0);

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
        { label: 'Home', to: '/' },
        { label: 'Products', to: '/products' },
        { label: product.category, to: `/products/${product.catSlug}` },
        { label: product.subcategory, to: `/products/${product.catSlug}/${product.subSlug}` },
        { label: product.name },
      ]
    : undefined;

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        url: absoluteUrl(`/product/${product.id}`),
        ...(product.description ? { description: product.description } : {}),
        ...(product.itemCode ? { sku: product.itemCode, mpn: product.itemCode } : {}),
        ...(product.cloudinaryImages?.length
          ? { image: product.cloudinaryImages.slice(0, 6) }
          : {}),
        category: `${product.category} > ${product.subcategory}`,
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

  useSEO({
    title: product ? product.name : 'Product',
    description: product?.description || product?.subcategory,
    breadcrumbs,
    schema: productSchema,
  });

  if (!product) {
    return (
      <section className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-text">Product not found</h1>
        <p className="body-copy mx-auto text-center mt-2">This product may have been moved or removed.</p>
        <Button to="/products" className="mt-6">Back to Products</Button>
      </section>
    );
  }

  const images = product.cloudinaryImages || [];
  const mainSrc = images.length
    ? optimized(images[active], { w: 900, h: 900, crop: 'pad', extra: 'b_white' })
    : null;
  const related = getRelatedProducts(product, 5);
  const hasSpecs = product.specs && product.specs.length > 0;

  const facts = [
    product.itemCode && { label: 'Item Code', value: product.itemCode },
    product.diameter && { label: 'Tube Size', value: product.diameter },
    product.finish && { label: 'Finish', value: product.finish },
    { label: 'Category', value: product.subcategory },
  ].filter(Boolean);

  return (
    <>
      <section className="border-b border-navy-100 bg-surface">
        <div className="container-page py-8 lg:py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-text-strong">
            <Link to="/" className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">Home</Link>
            <span aria-hidden className="text-primary">/</span>
            <Link to="/products" className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">Products</Link>
            <span aria-hidden className="text-primary">/</span>
            <Link to={`/products/${product.catSlug}`} className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{product.category}</Link>
            <span aria-hidden className="text-primary">/</span>
            <Link to={`/products/${product.catSlug}/${product.subSlug}`} className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{product.subcategory}</Link>
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
                  className="!rounded-none"
                  caption={mainSrc ? undefined : 'Image coming soon'}
                />
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {images.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`h-16 w-16 overflow-hidden rounded-card border-2 transition-colors ${
                        i === active ? 'border-primary-dark' : 'border-navy-100 hover:border-navy-300'
                      }`}
                    >
                      <img src={optimized(url, { w: 120, h: 120, crop: 'fill' })} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="navy">{product.category}</Badge>
                {product.finish && <Badge tone="gold">{product.finish}</Badge>}
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold text-text">{product.name}</h1>
              {product.itemCode && (
                <p className="mt-1.5 font-mono text-body-compact text-primary-dark">Item Code: {product.itemCode}</p>
              )}

              {product.description ? (
                <p className="body-copy mt-5">{product.description}</p>
              ) : (
                <p className="mt-5 rounded-card border-l-2 border-primary/40 bg-navy-50 px-4 py-3 text-body-compact text-text-muted">
                  Full product description available on request, contact our team for details.
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
                <Button to="/rfq">Request a Quote</Button>
                <Button to="/contact" variant="outlineNavy">Talk to an Expert</Button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-text">Specifications</h2>
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
                Detailed specifications for this product are being added. Contact our team for the full datasheet.
              </p>
            )}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-text">Related Products</h2>
                <Link
                  to={`/products/${product.catSlug}/${product.subSlug}`}
                  className="border-b border-transparent pb-0.5 text-sm font-medium text-primary-dark transition-colors hover:border-primary hover:text-primary-darker"
                >
                  View all
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
        title="Interested in This"
        accent="Product?"
        desc="Request a quote or talk to our team about specifications, pricing and bulk orders."
        cta={{ label: 'Request a Quote', to: '/rfq' }}
      />
    </>
  );
}
