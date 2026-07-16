import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  FileText,
  ShieldCheck,
  Ruler,
  Layers3,
  ArrowRight,
  Headphones,
  PackageSearch,
  Info,
} from 'lucide-react';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/products/ProductCard';
import CtaBand from '../components/CtaBand';
import useSEO from '../hooks/useSEO';
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

  useSEO({
    title: product ? product.name : 'Product',
    description: product?.description || product?.subcategory,
  });

  if (!product) {
    return (
      <section className="container-page py-24 text-center">
        <PackageSearch className="mx-auto h-12 w-12 text-ink/30" />
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-800">Product not found</h1>
        <p className="mt-2 text-sm text-text-muted">This product may have been moved or removed.</p>
        <Button to="/products" className="mt-6" icon={ArrowRight}>Back to Products</Button>
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
    product.itemCode && { icon: FileText, label: 'Item Code', value: product.itemCode },
    product.diameter && { icon: Ruler, label: 'Tube Size', value: product.diameter },
    product.finish && { icon: ShieldCheck, label: 'Finish', value: product.finish },
    { icon: Layers3, label: 'Category', value: product.subcategory },
  ].filter(Boolean);

  return (
    <>
      <section className="border-b border-navy-100 bg-surface">
        <div className="container-page py-8 lg:py-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-text-strong">
            <Link to="/" className="hover:text-primary-darker">Home</Link>
            <ChevronRight className="h-3 w-3 text-primary" />
            <Link to="/products" className="hover:text-primary-darker">Products</Link>
            <ChevronRight className="h-3 w-3 text-primary" />
            <Link to={`/products/${product.catSlug}`} className="hover:text-primary-darker">{product.category}</Link>
            <ChevronRight className="h-3 w-3 text-primary" />
            <Link to={`/products/${product.catSlug}/${product.subSlug}`} className="hover:text-primary-darker">{product.subcategory}</Link>
            <ChevronRight className="h-3 w-3 text-primary" />
            <span className="font-medium text-text" aria-current="page">{product.name}</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Gallery */}
            <div>
              <div className="overflow-hidden rounded-2xl border border-black bg-white shadow-card">
                <ImagePlaceholder
                  src={mainSrc}
                  label={product.name}
                  alt={product.name}
                  icon={PackageSearch}
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
                      className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-colors ${
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
              <h1 className="mt-3 font-display text-3xl font-bold text-navy-800">{product.name}</h1>
              {product.itemCode && (
                <p className="mt-1.5 font-mono text-sm text-primary-dark">Item Code: {product.itemCode}</p>
              )}

              {product.description ? (
                <p className="mt-5 text-sm leading-relaxed text-ink/70">{product.description}</p>
              ) : (
                <p className="mt-5 flex items-start gap-2 rounded-lg bg-navy-50 px-4 py-3 text-sm text-text-muted">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  Full product description available on request — contact our team for details.
                </p>
              )}

              {/* Key facts */}
              <dl className="mt-6 grid grid-cols-2 gap-4">
                {facts.map((f) => (
                  <div key={f.label} className="rounded-xl border border-black bg-white p-3.5 shadow-card">
                    <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-muted">
                      <f.icon className="h-3.5 w-3.5 text-primary" /> {f.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-navy-800">{f.value}</dd>
                  </div>
                ))}
              </dl>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button to="/rfq" icon={ArrowRight}>Request a Quote</Button>
                <Button to="/contact" variant="outlineNavy" icon={Headphones}>Talk to an Expert</Button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-12">
            <h2 className="font-display text-xl font-bold text-navy-800">Specifications</h2>
            {hasSpecs ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-black bg-white shadow-card">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-navy-50">
                    {product.specs.map((s, i) => (
                      <tr key={i} className={i % 2 ? 'bg-navy-50/40' : ''}>
                        <th scope="row" className="w-1/3 px-5 py-3 align-top font-medium text-navy-800">{s.label}</th>
                        <td className="px-5 py-3 text-ink/70">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-navy-200 bg-navy-50/40 px-5 py-6 text-sm text-text-muted">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                Detailed specifications for this product are being added. Contact our team for the full datasheet.
              </p>
            )}
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-navy-800">Related Products</h2>
                <Link
                  to={`/products/${product.catSlug}/${product.subSlug}`}
                  className="flex items-center gap-1 text-sm font-medium text-primary-dark hover:text-primary-darker"
                >
                  View all <ChevronRight className="h-4 w-4" />
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
        cta={{ label: 'Request a Quote', to: '/rfq', icon: ArrowRight }}
      />
    </>
  );
}
