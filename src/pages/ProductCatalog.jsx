import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CatalogSidebar from '../components/products/CatalogSidebar';
import ProductCard from '../components/products/ProductCard';
import CtaBand from '../components/CtaBand';
import CategoryPillar from '../components/products/CategoryPillar';
import { getCategoryPillar } from '../data/categoryPillars';
import { getSubcategoryPillar } from '../data/subcategoryPillars';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import useSEO, { absoluteUrl } from '../hooks/useSEO';
import { subcategoryTitle, subcategoryDescription } from '../data/seoKeywords';
import { useLT, useProductL10n } from '../i18n/LocaleContext';
import { productPath } from '../data/productPaths';
import {
  getCategory,
  getProductsByCategory,
  getProductsBySubcategory,
  getFacets,
  applyFilters,
  searchProducts,
  productImage,
  SORTS,
} from '../data/productHelpers';

/**
 * Product listing page for a category and optional subcategory: sidebar filters, search,
 * sort, pagination, and the Gallery, Overview, and Downloads tabs.
 *
 * Rendered by the `products/:categorySlug` and `products/:categorySlug/:subSlug` routes in
 * App.jsx. Product data and filtering come from data/productHelpers; change behaviour there.
 */
const PER_PAGE_OPTIONS = [12, 20, 40, 60];
const TABS = [
  { key: 'gallery', label: 'Gallery' },
  { key: 'overview', label: 'Overview' },
  { key: 'downloads', label: 'Downloads' },
];

export default function ProductCatalog() {
  const lt = useLT('catalog');
  const { categorySlug, subSlug } = useParams();
  const category = useMemo(() => getCategory(categorySlug), [categorySlug]);

  const [activeFilters, setActiveFilters] = useState({});
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('name-asc');
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');
  const [tab, setTab] = useState('gallery');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const gridTopRef = useRef(null);

  const activeSub = category?.subcategories.find((s) => s.slug === subSlug) || null;

  // Category and subcategory names in the active language, for the crumbs, the schema and
  // the page title. Every other heading below calls the same keys inline.
  const catName = category ? lt(`cat.${category.slug}.name`, category.name) : '';
  const subName = activeSub ? lt(`sub.${activeSub.slug}.name`, activeSub.name) : '';
  const { lp } = useProductL10n();

  // Reset transient state when the route changes — during render (before paint) so the
  // previous route's filters never flash against the new product list.
  const routeKey = `${categorySlug}/${subSlug || ''}`;
  const [prevKey, setPrevKey] = useState(routeKey);
  if (routeKey !== prevKey) {
    setPrevKey(routeKey);
    setActiveFilters({});
    setQuery('');
    setPage(1);
    setTab('gallery');
    setMobileNavOpen(false);
  }

  const baseList = useMemo(() => {
    if (!category) return [];
    return subSlug
      ? getProductsBySubcategory(categorySlug, subSlug)
      : getProductsByCategory(categorySlug);
  }, [category, categorySlug, subSlug]);

  const facets = useMemo(() => getFacets(baseList), [baseList]);

  const visible = useMemo(() => {
    // Facets and filters work on the English data (their values are the derived English
    // terms); search matches both languages and sorting compares the names the visitor sees.
    const searched = searchProducts(baseList, query, lp);
    const filtered = applyFilters(searched, activeFilters);
    const sorted = [...filtered].sort((a, b) => SORTS[sort].fn(lp(a), lp(b)));
    return sorted;
  }, [baseList, query, activeFilters, sort, lp]);

  const activeFilterCount = Object.values(activeFilters).reduce((n, s) => n + (s?.size || 0), 0);

  const totalPages = Math.max(1, Math.ceil(visible.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageItems = visible.slice(start, start + perPage);

  /**
   * Breadcrumbs mirror the visible trail, and the CollectionPage carries an ItemList of
   * the products actually on screen — the listing equivalent of the Product block on the
   * detail page. `numberOfItems` is the full filtered count, not just the current page.
   */
  const breadcrumbs = category
    ? [
        { label: lt('crumbs.home', 'Home'), to: '/' },
        { label: lt('crumbs.products', 'Products'), to: '/products' },
        { label: catName, ...(activeSub ? { to: `/products/${category.slug}` } : {}) },
        ...(activeSub ? [{ label: subName }] : []),
      ]
    : undefined;

  const collectionSchema = category
    ? {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: activeSub ? `${subName}, ${catName}` : catName,
        ...(category.short ? { description: lt(`cat.${category.slug}.short`, category.short) } : {}),
        url: absoluteUrl(
          activeSub ? `/products/${category.slug}/${activeSub.slug}` : `/products/${category.slug}`,
        ),
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: visible.length,
          itemListElement: pageItems.map((p, i) => ({
            '@type': 'ListItem',
            position: start + i + 1,
            url: absoluteUrl(productPath(p.id) || `/product/${p.id}`),
            name: lp(p).name,
          })),
        },
      }
    : undefined;

  /**
   * FAQPage markup for the questions the pillar section renders, on category AND subcategory
   * pages, because both now render one. The rule it has to respect is unchanged: the markup
   * may only describe questions the page actually shows, so it is derived from the same
   * pillar object the section renders from rather than written separately.
   */
  const pillar = activeSub
    ? getSubcategoryPillar(activeSub.slug)
    : category
      ? getCategoryPillar(category.slug)
      : undefined;
  const pillarKey = activeSub ? `subpillar.${activeSub.slug}` : `pillar.${category?.slug}`;
  const faqSchema = pillar?.faqs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: pillar.faqs.map((f, i) => ({
          '@type': 'Question',
          name: lt(`${pillarKey}.faqs.${i}.q`, f.q),
          acceptedAnswer: { '@type': 'Answer', text: lt(`${pillarKey}.faqs.${i}.a`, f.a) },
        })),
      }
    : undefined;

  /**
   * A SUBCATEGORY page is titled for the phrase buyers actually search, not for the
   * catalogue's internal name. "Post Supports, Products" became "Post Supports
   * Manufacturer & Exporter | KEAA International"; "System Scaffolds-Ringlock" becomes
   * "Ringlock Scaffolding ...". See data/seoKeywords.js.
   *
   * Category pages are left as they were: all three already carry pillar content with
   * their own copy, and their names are already the words people use.
   */
  const subSeoTitle = activeSub ? subcategoryTitle(activeSub.name) : null;

  useSEO({
    title: subSeoTitle
      || (category
        ? lt('seo.listTitle', '{name}, Products', { name: activeSub ? subName : catName })
        : lt('seo.title', 'Products')),
    description: activeSub
      ? subcategoryDescription(activeSub.name, baseList.length)
      : category?.short ? lt(`cat.${category.slug}.short`, category.short) : undefined,
    appendSiteName: !subSeoTitle,
    breadcrumbs,
    schema: [collectionSchema, faqSchema].filter(Boolean),
  });

  if (!category) {
    return (
      <section className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-text">{lt('notFound.catTitle', 'Category not found')}</h1>
        <p className="body-copy mx-auto text-center mt-2">{lt('notFound.catDesc', 'This product category doesn’t exist.')}</p>
        <Button to="/products" className="mt-6">
          {lt('notFound.backAll', 'Back to Products')}
        </Button>
      </section>
    );
  }

  if (subSlug && !activeSub) {
    return (
      <section className="container-page py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-text">{lt('notFound.subTitle', 'Subcategory not found')}</h1>
        <p className="body-copy mx-auto text-center mt-2">{lt('notFound.subDesc', 'This subcategory doesn’t exist in {name}.', { name: lt(`cat.${category.slug}.name`, category.name) })}</p>
        <Button to={`/products/${category.slug}`} className="mt-6">
          {lt('notFound.backCat', 'Back to {name}', { name: lt(`cat.${category.slug}.name`, category.name) })}
        </Button>
      </section>
    );
  }

  const onFilterToggle = (key, value) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] || []);
      set.has(value) ? set.delete(value) : set.add(value);
      next[key] = set;
      return next;
    });
    setPage(1);
  };
  const onClearFilters = () => {
    setActiveFilters({});
    setPage(1);
  };
  const onSearch = (q) => {
    setQuery(q);
    setPage(1);
  };

  const goToPage = (p) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    if (gridTopRef.current) {
      const y = gridTopRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sidebarProps = {
    category,
    activeSubSlug: subSlug || null,
    facets,
    activeFilters,
    onFilterToggle,
    onClearFilters,
    activeFilterCount,
  };

  return (
    <>
      <section className="border-b border-navy-100 bg-surface">
        <div className="container-page py-8 lg:py-10">
          <div className="lg:grid lg:grid-cols-[288px_1fr] lg:gap-8">
            {/* Sidebar — sticky on desktop, collapsible on mobile */}
            <div className="hidden lg:block">
              <CatalogSidebar {...sidebarProps} />
            </div>

            {/* Main column */}
            <div className="min-w-0" ref={gridTopRef}>
              {/* Breadcrumb */}
              <nav aria-label={lt('crumbs.label', 'Breadcrumb')} className="flex flex-wrap items-center gap-2 text-xs text-text-strong">
                <Link to="/" className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{lt('crumbs.home', 'Home')}</Link>
                <span aria-hidden className="text-primary">/</span>
                <Link to="/products" className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{lt('crumbs.products', 'Products')}</Link>
                <span aria-hidden className="text-primary">/</span>
                <Link to={`/products/${category.slug}`} className="border-b border-transparent pb-0.5 transition-colors hover:border-primary hover:text-primary-darker">{lt(`cat.${category.slug}.name`, category.name)}</Link>
                {activeSub && (
                  <>
                    <span aria-hidden className="text-primary">/</span>
                    <span className="font-medium text-text" aria-current="page">{lt(`sub.${activeSub.slug}.name`, activeSub.name)}</span>
                  </>
                )}
              </nav>

              {/* Title + feature badges */}
              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">
                    {activeSub ? lt(`sub.${activeSub.slug}.name`, activeSub.name) : lt(`cat.${category.slug}.name`, category.name)}
                  </h1>
                  <p className="body-copy mt-2">{lt(`cat.${category.slug}.short`, category.short)}</p>
                </div>
                {category.badges?.length > 0 && (
                  <div className="grid flex-shrink-0 grid-cols-2 gap-x-5 gap-y-3 lg:max-w-xs">
                    {category.badges.map((b, i) => (
                      <div key={b.title} className="leading-tight">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-darker">{lt(`cat.${category.slug}.badges.${i}.title`, b.title)}</p>
                        <p className="mt-1 text-[11px] text-text-muted">{lt(`cat.${category.slug}.badges.${i}.sub`, b.sub)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div role="tablist" aria-label={lt('tabs.label', 'Product views')} className="mt-6 flex items-center gap-6 border-b border-navy-100">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                      tab === t.key
                        ? 'border-primary-dark text-primary-dark'
                        : 'border-transparent text-text-muted hover:text-navy-800'
                    }`}
                  >
                    {lt(`tabs.${t.key}`, t.label)}
                  </button>
                ))}
              </div>

              {/* Mobile: categories & filters toggle */}
              <div className="mt-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen((o) => !o)}
                  aria-expanded={mobileNavOpen}
                  aria-controls="catalog-mobile-nav"
                  className="flex w-full items-center justify-between rounded-card border border-navy-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-800"
                >
                  <span>
                    {lt('mobile.toggle', 'Categories & Filters')}{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                  </span>
                  <span aria-hidden className="text-[13px] font-bold uppercase tracking-[0.12em] text-primary-dark">
                    {mobileNavOpen ? lt('mobile.close', 'Close') : lt('mobile.open', 'Open')}
                  </span>
                </button>
                {mobileNavOpen && (
                  <div id="catalog-mobile-nav" className="mt-4">
                    <CatalogSidebar {...sidebarProps} />
                  </div>
                )}
              </div>

              {/* Tab content */}
              {tab === 'gallery' && (
                <GalleryTab
                  visible={visible}
                  pageItems={pageItems}
                  query={query}
                  onSearch={onSearch}
                  searchScope={activeSub ? lt(`sub.${activeSub.slug}.name`, activeSub.name) : lt(`cat.${category.slug}.name`, category.name)}
                  view={view}
                  setView={setView}
                  sort={sort}
                  setSort={(s) => { setSort(s); setPage(1); }}
                  perPage={perPage}
                  setPerPage={(n) => { setPerPage(n); setPage(1); }}
                  perPageOptions={PER_PAGE_OPTIONS}
                  start={start}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  goToPage={goToPage}
                  activeFilterCount={activeFilterCount}
                  onClearFilters={onClearFilters}
                />
              )}
              {tab === 'overview' && <OverviewTab category={category} />}
              {tab === 'downloads' && <DownloadsTab />}
            </div>
          </div>
        </div>
      </section>

      {/* Long-form copy. The category pages had it already; every subcategory now has its own,
          written for that range alone so the pages are distinct rather than duplicates.
          See components/products/CategoryPillar and data/subcategoryPillars.js. */}
      {category && <CategoryPillar category={category} subcategory={activeSub || undefined} />}

      <CtaBand
        title={lt('cta.title', 'Need Help Choosing')}
        accent={lt('cta.accent', 'the Right Product?')}
        desc={lt('cta.desc', 'Our experts are here to help you find the best solution for your project.')}
        cta={{ label: lt('cta.label', 'Request a Quote'), to: '/contact?tab=rfq' }}
      />
    </>
  );
}

/* ---------------------------------- Gallery ---------------------------------- */
function GalleryTab({
  visible, pageItems, query, onSearch, searchScope, view, setView, sort, setSort, perPage, setPerPage, perPageOptions,
  start, currentPage, totalPages, goToPage, activeFilterCount, onClearFilters,
}) {
  const lt = useLT('catalog');
  const from = visible.length === 0 ? 0 : start + 1;
  const to = Math.min(start + perPage, visible.length);

  return (
    <div className="mt-6">
      {/* Search — scoped to the products on this page, matched against the live catalogue */}
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={lt('search.placeholder', 'Search {scope}…', { scope: searchScope })}
          aria-label={lt('search.ariaLabel', 'Search products in {scope}', { scope: searchScope })}
          className="w-full rounded-card border border-navy-200 bg-white py-2.5 pl-4 pr-20 text-sm text-navy-800 outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => onSearch('')}
            aria-label={lt('search.clearLabel', 'Clear search')}
            className="absolute right-2.5 top-1/2 flex h-6 -translate-y-1/2 items-center justify-center rounded-card px-2 text-[13px] font-bold uppercase tracking-[0.12em] text-text-muted transition-colors hover:bg-navy-50 hover:text-navy-800"
          >
            {lt('search.clear', 'Clear')}
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-compact text-text-muted">
          {lt('toolbar.showing', 'Showing ')}<span className="font-semibold text-navy-800">{from}–{to}</span>{lt('toolbar.of', ' of ')}
          <span className="font-semibold text-navy-800">{visible.length}</span>{lt('toolbar.products', ' products')}
          {query && (
            <>{lt('toolbar.for', ' for “')}<span className="font-semibold text-navy-800">{query}</span>{lt('toolbar.quoteEnd', '”')}</>
          )}
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-text-muted">
            {lt('toolbar.sortBy', 'Sort by:')}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-card border border-navy-200 bg-white px-2.5 py-1.5 text-sm text-navy-800 outline-none focus:border-primary"
            >
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{lt(`sort.${k}`, v.label)}</option>
              ))}
            </select>
          </label>
          <div className="flex overflow-hidden rounded-card border border-navy-200">
            <ViewBtn active={view === 'grid'} onClick={() => setView('grid')} label={lt('toolbar.gridView', 'Grid view')}>{lt('toolbar.grid', 'Grid')}</ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => setView('list')} label={lt('toolbar.listView', 'List view')}>{lt('toolbar.list', 'List')}</ViewBtn>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-card border border-dashed border-navy-200 bg-navy-50/40 py-14 text-center">
          <p className="font-display text-base font-semibold text-text">
            {query ? lt('empty.noMatchQuery', 'No products match “{q}”', { q: query }) : lt('empty.noMatchFilters', 'No products match these filters')}
          </p>
          <p className="mt-1 text-body-compact text-text-muted">
            {query ? lt('empty.queryHint', 'Try a different term, or clear the search.') : lt('empty.filtersHint', 'Try removing a filter to see more products.')}
          </p>
          {(query || activeFilterCount > 0) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {query && (
                <button onClick={() => onSearch('')} className="rounded-card bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-900">
                  {lt('empty.clearSearch', 'Clear search')}
                </button>
              )}
              {activeFilterCount > 0 && (
                <button onClick={onClearFilters} className="rounded-card border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50">
                  {lt('empty.clearFilters', 'Clear filters')}
                </button>
              )}
            </div>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pageItems.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {pageItems.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          goToPage={goToPage}
          perPage={perPage}
          setPerPage={setPerPage}
          perPageOptions={perPageOptions}
        />
      )}
    </div>
  );
}

function ViewBtn({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-8 items-center justify-center px-3 text-[13px] font-bold uppercase tracking-[0.12em] transition-colors ${
        active ? 'bg-primary-dark text-white' : 'bg-white text-text-muted hover:bg-navy-50'
      }`}
    >
      {children}
    </button>
  );
}

function ProductRow({ product }) {
  const lt = useLT('catalog');
  const { lp } = useProductL10n();
  const p = lp(product);
  const src = productImage(product, { w: 200, h: 200, crop: 'fill' });
  return (
    <Link
      to={productPath(product.id) || `/product/${product.id}`}
      className="group flex items-center gap-4 rounded-card border border-navy-100 bg-white p-3 shadow-card transition-shadow hover:shadow-cardHover"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-card">
        <ImagePlaceholder src={src} label={p.name} alt={p.name} tone="light" ratio="aspect-square" className="!rounded-none" zoom={false} caption={src ? undefined : lt('card.soon', 'Soon')} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-semibold text-text group-hover:text-primary-dark">{p.name}</h3>
        {product.itemCode && <p className="mt-0.5 font-mono text-xs text-primary-dark">{product.itemCode}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          {product.diameter && <span>{product.diameter}</span>}
          {p.finish && <span>{p.finish}</span>}
          <span className="text-text-muted">{lt(`sub.${product.subSlug}.name`, product.subcategory)}</span>
        </div>
      </div>
    </Link>
  );
}

function Pagination({ currentPage, totalPages, goToPage, perPage, setPerPage, perPageOptions }) {
  const lt = useLT('catalog');
  // compact page window
  const pages = [];
  const win = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - win && i <= currentPage + win)) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-4 border-t border-navy-100 pt-6 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-1.5">
        <PageBtn disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} label={lt('pager.prevLabel', 'Previous page')}>
          {lt('pager.prev', 'Prev')}
        </PageBtn>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-sm text-text-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-card px-3 text-sm font-medium transition-colors ${
                p === currentPage ? 'bg-primary-dark text-white' : 'border border-navy-200 bg-white text-navy-800 hover:bg-navy-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <PageBtn disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} label={lt('pager.nextLabel', 'Next page')}>
          {lt('pager.next', 'Next')}
        </PageBtn>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <label className="flex items-center gap-2">
          {lt('pager.show', 'Show')}
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="rounded-card border border-navy-200 bg-white px-2 py-1 text-sm text-navy-800 outline-none focus:border-primary"
          >
            {perPageOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          {lt('pager.perPage', 'per page')}
        </label>
        <span>{lt('pager.pageOf', 'Page {current} of {total}', { current: currentPage, total: totalPages })}</span>
      </div>
    </div>
  );
}

function PageBtn({ disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 items-center justify-center rounded-card border border-navy-200 bg-white px-3 text-[13px] font-bold uppercase tracking-[0.12em] text-navy-800 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Overview ---------------------------------- */
function OverviewTab({ category }) {
  const lt = useLT('catalog');
  return (
    <div className="mt-6">
      <div className="rounded-card border border-navy-100 bg-white p-6 shadow-card">
        <p className="body-copy">{lt(`cat.${category.slug}.short`, category.short)}</p>
        {category.standard && (
          <p className="mt-3 inline-block rounded-full border border-navy-100 bg-navy-50 px-4 py-1.5 font-mono text-xs text-navy-700">
            {category.standard}
          </p>
        )}
      </div>
      <h3 className="mt-8 font-display text-sm font-semibold text-text">{lt('overview.browseByType', 'Browse by type')}</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.subcategories.map((s) => (
          <Link
            key={s.slug}
            to={`/products/${category.slug}/${s.slug}`}
            className="group flex items-center justify-between rounded-card border border-navy-100 bg-white px-4 py-3.5 shadow-card transition-shadow hover:shadow-cardHover"
          >
            <span className="border-b border-transparent pb-0.5 text-sm font-medium text-navy-800 transition-colors group-hover:border-primary group-hover:text-primary-dark">{lt(`sub.${s.slug}.name`, s.name)}</span>
            <span className="text-xs text-text-muted">{s.count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Downloads ---------------------------------- */
function DownloadsTab() {
  const lt = useLT('catalog');
  return (
    <div className="mt-6">
      <div className="flex flex-col items-start gap-4 rounded-card border border-navy-100 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-body-compact font-semibold text-text">{lt('downloads.title', 'KEAA Product Catalogue')}</p>
          <p className="text-xs text-text-muted">{lt('downloads.desc', 'Complete product range with full technical specifications.')}</p>
        </div>
        <Button to="/downloads" size="sm">{lt('downloads.cta', 'Downloads Center')}</Button>
      </div>
    </div>
  );
}
