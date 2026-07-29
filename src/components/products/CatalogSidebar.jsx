import { Link } from 'react-router-dom';
import { useLT } from '../../i18n/LocaleContext';

/**
 * The catalog left rail: a dark category header block (with the category's hero
 * photo), the subcategory navigation, and the data-driven filter panel. Filter
 * state is owned by the page; this component only renders it and reports toggles.
 */
export default function CatalogSidebar({
  category,
  activeSubSlug,
  facets,
  activeFilters,
  onFilterToggle,
  onClearFilters,
  activeFilterCount,
}) {
  const lt = useLT('catalog');
  const subLink = (slug) =>
    slug ? `/products/${category.slug}/${slug}` : `/products/${category.slug}`;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      {/* Category header block */}
      <div className="relative overflow-hidden rounded-card">
        {category.heroImage && (
          <img
            src={category.heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'saturate(0.5) brightness(0.55)' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900/85 via-navy-800/80 to-navy-700/75" />
        <div className="relative p-5">
          <p className="font-display text-lg font-bold leading-tight text-white">{lt(`cat.${category.slug}.name`, category.name)}</p>
          <p className="text-xs text-white/70">{lt('sidebar.productCount', '{n} products', { n: category.count })}</p>
        </div>
      </div>

      {/* Subcategory nav */}
      <nav className="mt-4 overflow-hidden rounded-card border border-navy-100 bg-white shadow-card">
        <ul className="divide-y divide-navy-50">
          <SubItem to={subLink()} active={!activeSubSlug} label={lt('sidebar.allProducts', 'All Products')} count={category.count} />
          {category.subcategories.map((s) => (
            <SubItem
              key={s.slug}
              to={subLink(s.slug)}
              active={activeSubSlug === s.slug}
              label={lt(`sub.${s.slug}.name`, s.name)}
              count={s.count}
            />
          ))}
        </ul>
      </nav>

      {/* Filters */}
      {facets.length > 0 && (
        <div className="mt-4 rounded-card border border-navy-100 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="font-display text-body-compact font-semibold text-text">{lt('sidebar.filterTitle', 'Filter Products')}</p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-[13px] font-bold uppercase tracking-[0.12em] text-primary-dark hover:text-primary-darker"
              >
                {lt('sidebar.clearAll', 'Clear All')}
              </button>
            )}
          </div>

          <div className="mt-4 space-y-5">
            {facets.map((group) => (
              <fieldset key={group.key}>
                <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  {lt(`facet.${group.key}`, group.label)}
                </legend>
                <div className="space-y-1.5">
                  {group.options.map((opt) => {
                    const checked = activeFilters[group.key]?.has(opt.value) || false;
                    return (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-center gap-2.5 text-sm text-ink transition-colors hover:text-navy-800"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onFilterToggle(group.key, opt.value)}
                          className="h-4 w-4 rounded-card border-navy-300 text-primary-dark accent-primary-dark focus:ring-primary"
                        />
                        <span className="flex-1">{opt.value}</span>
                        <span className="text-xs text-text-muted">({opt.count})</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function SubItem({ to, active, label, count }) {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
          active
            ? 'bg-primary/[0.08] font-semibold text-primary-dark'
            : 'text-ink hover:bg-navy-50 hover:text-navy-800'
        }`}
      >
        <span>{label}</span>
        <span className={`text-xs ${active ? 'text-primary-dark/70' : 'text-text-muted'}`}>{count}</span>
      </Link>
    </li>
  );
}
