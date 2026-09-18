import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import ImagePlaceholder from './ImagePlaceholder';
import { useProductL10n } from '../../i18n/LocaleContext';

/**
 * Product picker + quantity, as a repeatable list of line items — used by the RFQ and Export
 * Inquiry forms (Contact.jsx) so a buyer can name several specific catalogue items (not just a
 * category) and how many of each they need.
 *
 * The 355-product catalogue (productHelpers.js) is ~181 KB, so it is NOT imported at module
 * scope here — same lazy-on-first-interaction approach as the header's site search
 * (HeaderSearch.jsx). `ensureCatalog` is called once, from whichever row the visitor focuses
 * first, and the loaded module is shared by every row via the parent's state.
 */

let rowSeq = 0;
export const emptyLineItem = () => ({ key: `line-${++rowSeq}`, product: null, quantity: 1 });

const MAX_SUGGESTIONS = 6;

let catalogPromise = null;
const loadCatalog = () => {
  if (!catalogPromise) catalogPromise = import('../../data/productHelpers');
  return catalogPromise;
};

const defaultLabels = {
  label: 'Products & Quantities Required',
  add: '+ Add another product',
  searchPlaceholder: 'Search by item code or product name…',
  quantity: 'Quantity',
  change: 'Change product',
  remove: 'Remove product',
  noResults: 'No matching products',
  alreadyAdded: 'Already added — adjust its quantity above instead',
  loading: 'Loading products…',
};

export default function ProductLineItems({ items, onChange, labels = {}, className = '' }) {
  const L = { ...defaultLabels, ...labels };
  const [catalog, setCatalog] = useState(null);
  const loadingRef = useRef(false);

  const ensureCatalog = () => {
    if (catalog || loadingRef.current) return;
    loadingRef.current = true;
    loadCatalog().then((m) =>
      setCatalog({ products: m.products, searchProducts: m.searchProducts, productImage: m.productImage })
    );
  };

  const updateItem = (key, patch) => {
    onChange(items.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };
  const removeItem = (key) => onChange(items.filter((it) => it.key !== key));
  const addItem = () => onChange([...items, emptyLineItem()]);

  return (
    <div className={`sm:col-span-2 ${className}`}>
      <span className="text-sm font-medium text-navy-800">{L.label}</span>
      <div className="mt-1.5 space-y-2.5">
        {items.map((item) => (
          <LineItemRow
            key={item.key}
            item={item}
            catalog={catalog}
            // A product already picked in another row of THIS quotation is not offered again —
            // its quantity should be changed in that row instead of adding a duplicate one.
            excludeIds={items.filter((it) => it.key !== item.key && it.product).map((it) => it.product.id)}
            onFocusSearch={ensureCatalog}
            onChangeItem={(patch) => updateItem(item.key, patch)}
            onRemove={items.length > 1 ? () => removeItem(item.key) : undefined}
            labels={L}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark transition-colors hover:text-primary-deep"
      >
        <Plus aria-hidden className="h-4 w-4" strokeWidth={2.5} />
        {L.add}
      </button>
    </div>
  );
}

function LineItemRow({ item, catalog, excludeIds, onFocusSearch, onChangeItem, onRemove, labels }) {
  // Names are DISPLAYED in the active language; the picked product object stays the
  // catalogue original, so the quotation reaches the sales team with the English name.
  const { lp } = useProductL10n();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);

  // Matched-but-hidden (duplicates of another row) vs genuinely no match — the empty state
  // tells the visitor which one it is instead of just saying "no results" for a real product.
  const { results, hadDuplicates } = useMemo(() => {
    const q = query.trim();
    if (!catalog || !q) return { results: [], hadDuplicates: false };
    const matches = catalog.searchProducts(catalog.products, q, lp);
    const visible = matches.filter((p) => !excludeIds.includes(p.id));
    return {
      results: visible.slice(0, MAX_SUGGESTIONS),
      hadDuplicates: visible.length === 0 && matches.length > 0,
    };
  }, [catalog, query, excludeIds, lp]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  const pick = (product) => {
    onChangeItem({ product });
    setQuery('');
    setOpen(false);
  };

  const clearPick = () => onChangeItem({ product: null });

  const onKeyDown = (e) => {
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-card border border-navy-100 p-3 sm:flex-row sm:items-center">
      <div ref={wrapRef} className="relative min-w-0 flex-1">
        {item.product ? (
          <div className="flex items-center gap-3 rounded-card border border-navy-100 bg-navy-50/60 p-2">
            <div className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-card">
              <ImagePlaceholder
                src={catalog ? catalog.productImage(item.product, { w: 88, h: 88, crop: 'fill' }) : null}
                alt={lp(item.product).name}
                ratio="aspect-square"
                tone="light"
                zoom={false}
                className="!rounded-none"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{lp(item.product).name}</p>
              {item.product.itemCode && (
                <p className="font-mono text-xs text-primary-dark">{item.product.itemCode}</p>
              )}
            </div>
            <button
              type="button"
              onClick={clearPick}
              aria-label={labels.change}
              title={labels.change}
              className="flex-shrink-0 rounded-card p-1.5 text-muted transition-colors hover:bg-white hover:text-navy-900"
            >
              <X aria-hidden className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 rounded-card border border-navy-100 px-3.5 py-2.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <Search aria-hidden className="h-4 w-4 flex-shrink-0 text-muted" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  onFocusSearch();
                }}
                onFocus={() => {
                  setOpen(true);
                  onFocusSearch();
                }}
                onKeyDown={onKeyDown}
                placeholder={labels.searchPlaceholder}
                className="h-full w-full min-w-0 border-0 bg-transparent text-sm text-text outline-none placeholder:text-muted"
              />
            </div>
            {open && query.trim() && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-72 overflow-y-auto rounded-card border border-border bg-white py-1.5 shadow-cardHover">
                {!catalog ? (
                  <li className="px-3.5 py-2.5 text-sm text-muted">{labels.loading}</li>
                ) : results.length ? (
                  results.map((p, i) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(i)}
                        onClick={() => pick(p)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                          i === active ? 'bg-navy-50' : ''
                        }`}
                      >
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-card">
                          <ImagePlaceholder
                            src={catalog.productImage(p, { w: 72, h: 72, crop: 'fill' })}
                            alt={lp(p).name}
                            ratio="aspect-square"
                            tone="light"
                            zoom={false}
                            className="!rounded-none"
                          />
                        </div>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-navy-900">{lp(p).name}</span>
                          {p.itemCode && <span className="block font-mono text-xs text-muted">{p.itemCode}</span>}
                        </span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3.5 py-2.5 text-sm text-muted">
                    {hadDuplicates ? labels.alreadyAdded : labels.noResults}
                  </li>
                )}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:flex-shrink-0">
        <label className="sr-only" htmlFor={`qty-${item.key}`}>
          {labels.quantity}
        </label>
        <input
          id={`qty-${item.key}`}
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => onChangeItem({ quantity: Math.max(1, Number(e.target.value) || 1) })}
          className="w-20 rounded-card border border-navy-100 px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-primary"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={labels.remove}
            title={labels.remove}
            className="flex-shrink-0 rounded-card p-2 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <X aria-hidden className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
