import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ShieldCheck,
  Wrench,
  Droplets,
  Globe,
  Heart,
  CloudRain,
  Blocks,
  Gauge,
  Ruler,
  Shuffle,
  ArrowRight,
  Download,
  PackageSearch,
  Search,
  X,
} from 'lucide-react';
import CatalogSidebar from '../components/products/CatalogSidebar';
import ProductCard from '../components/products/ProductCard';
import CtaBand from '../components/CtaBand';
import ImagePlaceholder from '../components/ui/ImagePlaceholder';
import Button from '../components/ui/Button';
import useSEO from '../hooks/useSEO';
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

const PER_PAGE_OPTIONS = [12, 20, 40, 60];
const TABS = [
  { key: 'gallery', label: 'Gallery' },
  { key: 'overview', label: 'Overview' },
  { key: 'downloads', label: 'Downloads' },
];
const BADGE_ICONS = { ShieldCheck, Wrench, Droplets, Globe, Heart, CloudRain, Blocks, Gauge, Ruler, Shuffle };

export default function ProductCatalog() {
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
    const searched = searchProducts(baseList, query);
    const filtered = applyFilters(searched, activeFilters);
    const sorted = [...filtered].sort(SORTS[sort].fn);
    return sorted;
  }, [baseList, query, activeFilters, sort]);

  const activeFilterCount = Object.values(activeFilters).reduce((n, s) => n + (s?.size || 0), 0);

  const totalPages = Math.max(1, Math.ceil(visible.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageItems = visible.slice(start, start + perPage);

  useSEO({
    title: category ? `${activeSub ? activeSub.name : category.name} — Products` : 'Products',
    description: category?.short,
  });

  if (!category) {
    return (
      <section className="container-page py-24 text-center">
        <PackageSearch className="mx-auto h-12 w-12 text-ink/30" />
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-800">Category not found</h1>
        <p className="mt-2 text-sm text-text-muted">This product category doesn’t exist.</p>
        <Button to="/products" className="mt-6" icon={ArrowRight}>
          Back to Products
        </Button>
      </section>
    );
  }

  if (subSlug && !activeSub) {
    return (
      <section className="container-page py-24 text-center">
        <PackageSearch className="mx-auto h-12 w-12 text-ink/30" />
        <h1 className="mt-4 font-display text-2xl font-bold text-navy-800">Subcategory not found</h1>
        <p className="mt-2 text-sm text-text-muted">This subcategory doesn’t exist in {category.name}.</p>
        <Button to={`/products/${category.slug}`} className="mt-6" icon={ArrowRight}>
          Back to {category.name}
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
              <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-text-strong">
                <Link to="/" className="hover:text-primary-darker">Home</Link>
                <ChevronRight className="h-3 w-3 text-primary" />
                <Link to="/products" className="hover:text-primary-darker">Products</Link>
                <ChevronRight className="h-3 w-3 text-primary" />
                <Link to={`/products/${category.slug}`} className="hover:text-primary-darker">{category.name}</Link>
                {activeSub && (
                  <>
                    <ChevronRight className="h-3 w-3 text-primary" />
                    <span className="font-medium text-text" aria-current="page">{activeSub.name}</span>
                  </>
                )}
              </nav>

              {/* Title + feature badges */}
              <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <h1 className="font-display text-2xl font-bold text-navy-800 sm:text-3xl">
                    {activeSub ? activeSub.name : category.name}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{category.short}</p>
                </div>
                {category.badges?.length > 0 && (
                  <div className="grid flex-shrink-0 grid-cols-2 gap-x-5 gap-y-3 lg:max-w-xs">
                    {category.badges.map((b) => {
                      const BadgeIcon = BADGE_ICONS[b.icon] || ShieldCheck;
                      return (
                        <div key={b.title} className="flex items-start gap-2">
                          <BadgeIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                          <div className="leading-tight">
                            <p className="text-xs font-semibold text-navy-800">{b.title}</p>
                            <p className="text-[11px] text-text-muted">{b.sub}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div role="tablist" aria-label="Product views" className="mt-6 flex items-center gap-6 border-b border-navy-100">
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
                    {t.label}
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
                  className="flex w-full items-center justify-between rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-800"
                >
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
                    Categories & Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                  </span>
                  {mobileNavOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
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
                  searchScope={activeSub ? activeSub.name : category.name}
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

      <CtaBand
        title="Need Help Choosing"
        accent="the Right Product?"
        desc="Our experts are here to help you find the best solution for your project."
        cta={{ label: 'Request a Quote', to: '/rfq', icon: ArrowRight }}
      />
    </>
  );
}

/* ---------------------------------- Gallery ---------------------------------- */
function GalleryTab({
  visible, pageItems, query, onSearch, searchScope, view, setView, sort, setSort, perPage, setPerPage, perPageOptions,
  start, currentPage, totalPages, goToPage, activeFilterCount, onClearFilters,
}) {
  const from = visible.length === 0 ? 0 : start + 1;
  const to = Math.min(start + perPage, visible.length);

  return (
    <div className="mt-6">
      {/* Search — scoped to the products on this page, matched against the live catalogue */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={`Search ${searchScope}…`}
          aria-label={`Search products in ${searchScope}`}
          className="w-full rounded-xl border border-navy-200 bg-white py-2.5 pl-10 pr-10 text-sm text-navy-800 outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => onSearch('')}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-navy-50 hover:text-navy-800"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-muted">
          Showing <span className="font-semibold text-navy-800">{from}–{to}</span> of{' '}
          <span className="font-semibold text-navy-800">{visible.length}</span> products
          {query && (
            <> for &ldquo;<span className="font-semibold text-navy-800">{query}</span>&rdquo;</>
          )}
        </p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-text-muted">
            Sort by:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-navy-200 bg-white px-2.5 py-1.5 text-sm text-navy-800 outline-none focus:border-primary"
            >
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </label>
          <div className="flex overflow-hidden rounded-lg border border-navy-200">
            <ViewBtn active={view === 'grid'} onClick={() => setView('grid')} label="Grid view"><LayoutGrid className="h-4 w-4" /></ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => setView('list')} label="List view"><List className="h-4 w-4" /></ViewBtn>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-navy-200 bg-navy-50/40 py-14 text-center">
          <PackageSearch className="h-8 w-8 text-ink/35" />
          <p className="mt-3 font-display text-base font-semibold text-navy-800">
            {query ? <>No products match &ldquo;{query}&rdquo;</> : 'No products match these filters'}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {query ? 'Try a different term, or clear the search.' : 'Try removing a filter to see more products.'}
          </p>
          {(query || activeFilterCount > 0) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {query && (
                <button onClick={() => onSearch('')} className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-900">
                  Clear search
                </button>
              )}
              {activeFilterCount > 0 && (
                <button onClick={onClearFilters} className="rounded-lg border border-navy-200 bg-white px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50">
                  Clear filters
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
      className={`flex h-8 w-9 items-center justify-center transition-colors ${
        active ? 'bg-primary-dark text-white' : 'bg-white text-text-muted hover:bg-navy-50'
      }`}
    >
      {children}
    </button>
  );
}

function ProductRow({ product }) {
  const src = productImage(product, { w: 200, h: 200, crop: 'fill' });
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex items-center gap-4 rounded-xl border border-black bg-white p-3 shadow-card transition-shadow hover:shadow-cardHover"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        <ImagePlaceholder src={src} label={product.name} alt={product.name} tone="light" ratio="aspect-square" className="!rounded-none" zoom={false} caption={src ? undefined : 'Soon'} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-semibold text-navy-800 group-hover:text-primary-dark">{product.name}</h3>
        {product.itemCode && <p className="mt-0.5 font-mono text-xs text-primary-dark">{product.itemCode}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
          {product.diameter && <span>{product.diameter}</span>}
          {product.finish && <span>{product.finish}</span>}
          <span className="text-text-muted">{product.subcategory}</span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/30 group-hover:text-primary-dark" />
    </Link>
  );
}

function Pagination({ currentPage, totalPages, goToPage, perPage, setPerPage, perPageOptions }) {
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
        <PageBtn disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </PageBtn>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-sm text-text-muted">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
                p === currentPage ? 'bg-primary-dark text-white' : 'border border-navy-200 bg-white text-navy-800 hover:bg-navy-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <PageBtn disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} label="Next page">
          <ChevronRight className="h-4 w-4" />
        </PageBtn>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-muted">
        <label className="flex items-center gap-2">
          Show
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className="rounded-lg border border-navy-200 bg-white px-2 py-1 text-sm text-navy-800 outline-none focus:border-primary"
          >
            {perPageOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          per page
        </label>
        <span>Page {currentPage} of {totalPages}</span>
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
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 bg-white text-navy-800 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Overview ---------------------------------- */
function OverviewTab({ category }) {
  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-black bg-white p-6 shadow-card">
        <p className="text-sm leading-relaxed text-ink/70">{category.short}</p>
        {category.standard && (
          <p className="mt-3 inline-block rounded-full border border-navy-100 bg-navy-50 px-4 py-1.5 font-mono text-xs text-navy-700">
            {category.standard}
          </p>
        )}
      </div>
      <h3 className="mt-8 font-display text-sm font-semibold text-navy-800">Browse by type</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {category.subcategories.map((s) => (
          <Link
            key={s.slug}
            to={`/products/${category.slug}/${s.slug}`}
            className="group flex items-center justify-between rounded-xl border border-black bg-white px-4 py-3.5 shadow-card transition-shadow hover:shadow-cardHover"
          >
            <span className="text-sm font-medium text-navy-800 group-hover:text-primary-dark">{s.name}</span>
            <span className="flex items-center gap-1 text-xs text-text-muted">
              {s.count}
              <ChevronRight className="h-4 w-4 text-ink/30 group-hover:text-primary-dark" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- Downloads ---------------------------------- */
function DownloadsTab() {
  return (
    <div className="mt-6">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-black bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-dark">
            <Download className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-navy-800">KEAA Product Catalogue</p>
            <p className="text-xs text-text-muted">Complete product range with full technical specifications.</p>
          </div>
        </div>
        <Button to="/downloads" icon={ArrowRight} size="sm">Downloads Center</Button>
      </div>
    </div>
  );
}
