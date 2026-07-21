import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import { products, searchProducts } from '../../data/productHelpers';

/**
 * Products management. For now it reads the real catalogue (src/data/products.json via
 * productHelpers) so the table is populated with genuine data; when the backend lands this
 * becomes GET /api/products with server-side paging. Reuses the same searchProducts() the
 * public catalogue uses, so behaviour matches the storefront.
 */
const PAGE_SIZE = 15;

const columns = [
  { key: 'itemCode', label: 'Item Code', render: (p) => <span className="font-mono text-xs text-slate-600">{p.itemCode || 'N/A'}</span> },
  { key: 'name', label: 'Product', render: (p) => <span className="font-medium text-navy-900">{p.name}</span> },
  { key: 'category', label: 'Category', render: (p) => <span className="text-slate-600">{p.category}</span> },
  { key: 'subcategory', label: 'Subcategory', render: (p) => <span className="text-slate-500">{p.subcategory}</span> },
  {
    key: 'hasImage',
    label: 'Image',
    align: 'center',
    render: (p) =>
      p.hasImage ? (
        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Yes</span>
      ) : (
        <span className="text-slate-300">No</span>
      ),
  },
];

export default function AdminProducts() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => searchProducts(products, query), [query]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products across the live catalogue.`}
        actions={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg bg-primary-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-darker"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search products…"
          aria-label="Search products"
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <DataTable columns={columns} rows={pageItems} empty="No products match your search." />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          Showing {pageItems.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + pageItems.length} of {filtered.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-navy-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="tabular-nums">{page} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-navy-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
