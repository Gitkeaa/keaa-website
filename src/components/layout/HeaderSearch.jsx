import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useT, useLT, useProductL10n } from '../../i18n/LocaleContext';
import { localePrefixOf } from '../../i18n/languages';
import { headerControl } from './headerControl';
import HeaderHint from './HeaderHint';
import { productPath } from '../../data/productPaths';

/**
 * Site search, INLINE in the header.
 *
 * It replaced a full-screen command palette. Three things about this one are deliberate:
 *
 *  1. It opens where the icon is. The field expands in place and the results hang directly
 *     under it — no modal, no backdrop, no viewport takeover for what is one input.
 *  2. An empty query shows ONE thing and only if it has earned it: the visitor's own last
 *     five searches, each removable. No suggested pages, no promoted products, no "no
 *     results yet" state — a first-time visitor still sees a bare field and nothing else.
 *  3. It searches the WHOLE SITE's copy, not just titles. Page body text comes from
 *     `/search-index.json`, generated at build time from the prerendered HTML
 *     (scripts/gen-search-index.mjs), so anything a visitor can read on the site is
 *     findable. Products are searched straight against the catalogue.
 *
 * Both data sources are LAZY and that is load-bearing: the catalogue is ~181 KB and the
 * index about 300 KB for the language being read. Neither is fetched until the first
 * keystroke, so the header costs nothing until someone actually searches.
 */

const MAX_PRODUCTS = 5;
const MAX_PAGES = 5;
const MAX_HISTORY = 5;

const HISTORY_KEY = 'keaa:search-history';

/**
 * Recent searches live in localStorage, which is not available during prerender and can
 * throw outright in a privacy-locked browser. Every access is guarded — history is a
 * convenience, so losing it must never take the search field down with it.
 */
function readHistory() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => typeof s === 'string').slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

function writeHistory(list) {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    /* full, disabled, or private-mode quota — the in-memory list still works this session */
  }
}

/* Module-scoped: each source is fetched at most once per page load. */
let catalogPromise = null;
const loadCatalog = () => {
  if (!catalogPromise) catalogPromise = import('../../data/productHelpers');
  return catalogPromise;
};

let indexPromise = null;
/**
 * Fetches the index for the language being browsed.
 *
 * There is one file per locale rather than one for the site. A single index held twelve copies
 * of the same 61 routes, 3.8 MB of which eleven twelfths were languages this visitor cannot
 * read; per locale it is about 300 KB and the results are in their language. English keeps the
 * unprefixed name, so nothing changes for the default site.
 *
 * Routes inside the file have no locale prefix; it is added back when a result is opened, which
 * is what keeps the files small and identical in shape.
 */
const loadIndex = () => {
  if (!indexPromise) {
    const prefix = typeof window === 'undefined' ? '' : localePrefixOf(window.location.pathname);
    const code = prefix.replace(/^\//, '');
    const file = code ? `/search-index.${code}.json` : '/search-index.json';
    indexPromise = fetch(file)
      .then((r) => (r.ok ? r.json() : []))
      // Absent in `vite dev` (it is generated from dist/), and a failed fetch must not
      // break search — products and page titles still work.
      .catch(() => []);
  }
  return indexPromise;
};

/**
 * Rank a page against the query. Every term must appear somewhere (AND), so "scaffold
 * galvanized" narrows instead of widening; where a term appears decides the score.
 *
 * The ROUTE counts as searchable text, and scores just under the title. A visitor types what
 * they call the page, which is often the word in the URL rather than the wording on it:
 * "faq" finds a page titled "Frequently Asked Questions", "terms" and "privacy" find the
 * legal pages, "rfq" finds "Request a Quotation". Without this those queries returned nothing.
 */
function scorePage(page, terms) {
  const title = (page.t || '').toLowerCase();
  const route = (page.r || '').toLowerCase().replace(/[-/]+/g, ' ').trim();
  const desc = (page.d || '').toLowerCase();
  const heads = (page.h || []).join(' ').toLowerCase();
  const body = (page.x || '').toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (title.includes(term)) score += 100;
    else if (route.includes(term)) score += 80;
    else if (heads.includes(term)) score += 50;
    else if (desc.includes(term)) score += 30;
    else if (body.includes(term)) score += 10;
    else return 0; // a term matched nowhere — drop the page entirely
  }
  return score;
}

/** A short window of body text around the first match, so the hit is visible in context. */
function snippet(page, term) {
  const text = page.x || page.d || '';
  const at = text.toLowerCase().indexOf(term);
  if (at === -1) return page.d || '';
  const start = Math.max(0, at - 40);
  return `${start > 0 ? '…' : ''}${text.slice(start, start + 120).trim()}…`;
}

export default function HeaderSearch({ onOpenChange }) {
  const t = useT();
  const ltc = useLT('catalog');
  const { lp } = useProductL10n();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  // Hover/focus prompt on the closed icon — the same chip the region control uses.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState(null);
  const [pages, setPages] = useState(null);
  const [active, setActive] = useState(0);
  const [history, setHistory] = useState([]);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  /*
    Read on OPEN, not on mount: it keeps localStorage off the header's first paint, and it
    re-syncs if the visitor searched in another tab since this page loaded. Starting from
    `[]` also means the prerendered markup and the first client render agree.
  */
  useEffect(() => {
    if (open) setHistory(readHistory());
  }, [open]);

  /** Most-recent-first, de-duplicated case-insensitively, capped at five. */
  const remember = useCallback((raw) => {
    const term = raw.trim();
    if (!term) return;
    setHistory((prev) => {
      const next = [term, ...prev.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(
        0,
        MAX_HISTORY
      );
      writeHistory(next);
      return next;
    });
  }, []);

  const forget = useCallback((term) => {
    setHistory((prev) => {
      const next = prev.filter((s) => s !== term);
      writeHistory(next);
      return next;
    });
  }, []);

  const forgetAll = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  // Fetch both sources on the first keystroke — not on mount, and not on open.
  useEffect(() => {
    if (!query.trim()) return;
    if (!catalog) {
      loadCatalog().then((m) =>
        setCatalog({ products: m.products, searchProducts: m.searchProducts })
      );
    }
    if (!pages) loadIndex().then(setPages);
  }, [query, catalog, pages]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  /**
   * The expanded field is 32rem wide and anchored `right-0`, so it reaches back across the
   * nav. Rather than letting it sit ON TOP of "Contact Us" and slice the word in half, the
   * header fades the nav out while search is open — see layout/Header.jsx.
   */
  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // Close on outside pointer-down and on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        close();
        inputRef.current?.blur();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // ⌘K / Ctrl-K opens and focuses the field from anywhere on the page.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/);
    const out = [];

    if (catalog) {
      for (const p of catalog.searchProducts(catalog.products, q, lp).slice(0, MAX_PRODUCTS)) {
        out.push({
          id: `p:${p.id}`,
          label: lp(p).name,
          hint: [p.itemCode, ltc(`sub.${p.subSlug}.name`, p.subcategory)].filter(Boolean).join(' · '),
          to: productPath(p.id) || `/product/${p.id}`,
          kind: t('search.products'),
        });
      }
    }

    if (pages) {
      /**
       * The index file is already the one for the language being read, and its routes carry
       * no locale prefix, so there is nothing to filter out and nothing to strip.
       *
       * It used to be one file covering all twelve languages, which meant filtering eleven
       * twelfths of it away on every keystroke after downloading all of it. The router's
       * basename supplies the prefix on navigation, which is why the stored route must not
       * carry one.
       */
      const ranked = pages
        .map((page) => ({ page, score: scorePage(page, terms) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_PAGES);

      for (const { page } of ranked) {
        out.push({
          id: `g:${page.r}`,
          label: page.t || page.r,
          hint: snippet(page, terms[0]),
          to: page.r,
          kind: t('search.pages'),
        });
      }
    }

    return out;
  }, [query, catalog, pages, t, ltc, lp]);

  useEffect(() => setActive(0), [query]);

  /*
    History records the RESULT the visitor chose, not the letters they typed to find it.
    Two reasons, and the second is why the typed query is wrong here:

      - Recording as-you-type would fill the list with the prefixes of one word
        ("s", "sc", "sca", …) and bury the only entry that meant anything. So it is
        recorded on selection, when the search has actually paid off.
      - Even on selection the typed text is a poor label: a two-letter "pr" that found
        "Scaffolding Prop" tells the visitor nothing a week later, and re-running "pr"
        re-opens the same guessing game. Storing "Scaffolding Prop" makes the row
        self-describing AND makes re-running it land on that item.
  */
  const go = (item) => {
    if (!item) return;
    remember(item.label);
    close();
    navigate(item.to);
  };

  /** Re-running a past search puts it back in the field rather than navigating blind. */
  const rerun = (term) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    }
  };

  const showResults = open && query.trim().length > 0 && results.length > 0;
  // Only ever one panel: results win the moment there is a query to answer.
  const showHistory = open && query.trim().length === 0 && history.length > 0;

  return (
    /*
      `relative` anchor, and the expanded field is ABSOLUTELY positioned so opening search
      does not reflow the header — an inline width change would shove the nav sideways
      every time the icon is clicked.
    */
    <div
      ref={wrapRef}
      className="relative flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!open && (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label={t('header.searchAria')}
            aria-expanded={false}
            className={`${headerControl} justify-center`}
          >
            <Search aria-hidden className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
          {/* Only while closed — once the field is open it is its own prompt. */}
          <HeaderHint show={hovered || focused}>{t('header.searchHint')}</HeaderHint>
        </>
      )}

      {open && (
        /*
          `h-10` is load-bearing. Without it this box is as tall as the field PLUS the
          results, and `-translate-y-1/2` then centres that combined height on the icon —
          which pushes the input upward out of the header as soon as results appear.
          Pinning the box to the field's own height keeps the input on the header line and
          lets the results hang below it (`top-full` on the list).
        */
        <div className="absolute right-0 top-1/2 z-50 h-10 w-[min(32rem,72vw)] -translate-y-1/2">
          {/*
            The focus affordance lives HERE, not on the input. The global
            `input:focus-visible { outline: 2px solid primary }` in index.css has
            specificity (0,1,1) and beat the input's own `.outline-none` (0,1,0), so the
            field rendered a browser outline INSIDE this border — two blue rectangles. The
            input now suppresses that with `focus-visible:outline-none` (0,2,0) and the
            wrapper shows one ring via `focus-within`, so focus is still clearly visible.
          */}
          <div className="flex h-10 items-center gap-2 rounded-card border border-border bg-white px-3 shadow-[0_2px_10px_-4px_rgb(10,35,66,0.18)] transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <Search aria-hidden className="h-4 w-4 flex-shrink-0 text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t('search.placeholder')}
              aria-label={t('header.searchAria')}
              className="h-full w-full border-0 bg-transparent text-sm text-navy-900 outline-none placeholder:text-muted focus:outline-none focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={close}
              aria-label={t('search.close')}
              className="flex-shrink-0 text-[11px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:text-navy-900"
            >
              {t('search.close')}
            </button>
          </div>

          {/*
            Empty query, but this visitor has searched before: offer the last five back.
            A visitor with no history sees no panel at all — there is no empty state.
          */}
          {showHistory && (
            <div className="absolute right-0 top-full mt-2 w-full overflow-hidden rounded-card border border-border bg-white shadow-cardHover">
              <div className="flex items-center justify-between px-3.5 pb-1 pt-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                  {t('search.recent')}
                </span>
                <button
                  type="button"
                  onClick={forgetAll}
                  className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:text-navy-900"
                >
                  {t('search.clearAll')}
                </button>
              </div>
              <ul className="pb-1.5">
                {history.map((term) => (
                  /*
                    Two SIBLING buttons, not a remove button nested inside the row button —
                    nested interactive elements are invalid HTML and the inner click would
                    have to fight the outer one. `group` lets the row hover style both.
                  */
                  <li key={term} className="group flex items-center transition-colors hover:bg-navy-50">
                    <button
                      type="button"
                      onClick={() => rerun(term)}
                      className="min-w-0 flex-1 truncate px-3.5 py-2 text-left text-sm text-navy-900"
                    >
                      {term}
                    </button>
                    <button
                      type="button"
                      onClick={() => forget(term)}
                      aria-label={`${t('search.remove')}: ${term}`}
                      title={t('search.remove')}
                      className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-card text-muted transition-colors hover:bg-white hover:text-navy-900"
                    >
                      <X aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showResults && (
            <ul className="absolute right-0 top-full mt-2 max-h-[60vh] w-full overflow-y-auto rounded-card border border-border bg-white py-1.5 shadow-cardHover">
              {results.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={`flex w-full items-start px-3.5 py-2.5 text-left transition-colors ${
                      i === active ? 'bg-navy-50' : ''
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span className="truncate text-sm font-semibold text-navy-900">
                          {item.label}
                        </span>
                        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                          {item.kind}
                        </span>
                      </span>
                      {item.hint && (
                        <span className="mt-0.5 block line-clamp-2 text-xs text-muted">
                          {item.hint}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
