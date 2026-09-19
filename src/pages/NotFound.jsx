import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import useSEO from '../hooks/useSEO';
import { useLT } from '../i18n/LocaleContext';
import { getAllCategories } from '../data/categories';

/**
 * 404 page: shown for any URL that matches no other route.
 *
 * It is rendered two ways, and both matter.
 *
 *   In the app, on the wildcard route, when a visitor follows a dead internal link.
 *   As dist/404.html, which Vercel serves with a real 404 status for any address that
 *   matches no file. scripts/make-404.mjs copies the prerendered /404 page there.
 *
 * WHY IT LISTS THE CATEGORIES. A 404 that offers only "Back to Home" sends the visitor to
 * the top of the site to start again, and sends a crawler nowhere. The old URLs still in
 * Google are product and category addresses, so the people landing here were looking for a
 * product. The category list and the enquiry link give them, and any crawler that follows
 * them, somewhere useful to go.
 *
 * noindex because the prerendered copy is a real file at /404: without it that address is
 * indexable in its own right, which is the opposite of the point.
 */
export default function NotFound() {
  const lt = useLT('notFound');
  const categories = getAllCategories();

  useSEO({
    title: lt('seo.title', 'Page not found'),
    description: lt('seo.description', 'This page does not exist or has moved. Browse the product range or ask us directly.'),
    noindex: true,
  });

  return (
    <section className="section-pad">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow text-primary-darker">404</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-text sm:text-4xl">
            {lt('title', 'We could not find that page')}
          </h1>
          <p className="body-copy mx-auto mt-4 text-center">
            {lt('message', 'The page you’re looking for doesn’t exist or has moved.')}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button to="/products">{lt('browse', 'Browse all products')}</Button>
            <Button to="/contact?tab=rfq" variant="secondary">
              {lt('ask', 'Ask us what you need')}
            </Button>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mx-auto mt-14 max-w-4xl">
            <h2 className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">
              {lt('categories', 'Product categories')}
            </h2>
            <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/products/${c.slug}`}
                    className="inline-flex rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-semibold text-navy-800 transition-colors hover:border-primary/60 hover:text-primary-dark"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
