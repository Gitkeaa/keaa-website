import { useState } from 'react';
import { Globe } from 'lucide-react';
import HeaderPopover from './HeaderPopover';
import { useRegion } from '../../context/RegionContext';
import { useLocale, useLT } from '../../i18n/LocaleContext';
import { getLanguage, isLiveLocale } from '../../i18n/languages';
import { localeId } from '../../data/regions';

/**
 * ONE header control for market and language — the pattern enterprise exporters use:
 * a region list that drills into "Country - Language" rows.
 *
 * It replaced two adjacent controls (a region picker and a language picker), which could
 * disagree with each other — nothing stopped a visitor selecting "Europe" and "Hindi". Here
 * a single row sets both, so the two settings are structurally incapable of contradicting.
 *
 * What a pick actually does: sets the sales region (which decides the desk an RFQ is routed
 * to — see the RFQ tab on pages/Contact.jsx), sets the site language, persists both, and updates
 * <html lang>. See src/data/regions.js for the country/language table.
 *
 * NO FLAG EMOJI ANYWHERE, and that is a bug fix rather than a style preference: Chrome on
 * Windows ships no flag glyphs, so every 🇮🇳 fell back to rendering its two regional-
 * indicator letters — the control literally read "IN EN", and the contact line read
 * "IN KEAA International Pvt. Ltd.". Windows is most of this site's B2B desktop audience,
 * so the country is spelled out instead.
 *
 * The globe in front of the label is a plain lucide glyph, NOT a flag, and that distinction is
 * the whole point: one generic mark for "this control is about where you are" renders the same
 * on every platform, where 200 flags do not. It marks the control at a glance in a row that is
 * otherwise all words.
 */

/** Held in its own component so the drill-down resets whenever the panel is dismissed. */
function Panel({ close }) {
  const { region, confirmed, entry, setLocaleChoice, regions } = useRegion();
  const { setLanguage, t } = useLocale();
  const lt = useLT('common');
  const [openRegion, setOpenRegion] = useState(null);

  const activeId = entry ? localeId(region, entry) : null;

  const choose = (regionKey, item) => {
    const lang = setLocaleChoice(regionKey, item);
    if (lang) {
      setLanguage(lang);
      // Allow switching to non-live languages without full page navigation
      // Live languages will handle their own navigation in setLanguage
    }
    close();
  };

  // ---- Level 2: the countries inside one region ----------------------------------------
  if (openRegion) {
    return (
      <div>
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <button
            type="button"
            onClick={() => setOpenRegion(null)}
            aria-label="Back to all regions"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-card text-base leading-none text-ink transition-colors hover:bg-navy-50 hover:text-navy-900"
          >
            <span aria-hidden>&larr;</span>
          </button>
          <p className="text-sm font-semibold text-text">{lt(`region.${openRegion.key}.label`, openRegion.label)}</p>
        </div>

        <ul className="max-h-[20rem] overflow-y-auto py-1.5">
          {openRegion.locales.map((item) => {
            const id = localeId(openRegion.key, item);
            const active = id === activeId;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => choose(openRegion.key, item)}
                  aria-current={active ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? 'bg-navy-50 font-semibold text-navy-900'
                      : 'text-ink hover:bg-navy-50 hover:text-navy-900'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {lt(`country.${item.code}`, item.country)} <span className="text-muted">&ndash;</span>{' '}
                    <span lang={item.lang}>{getLanguage(item.lang).label}</span>
                  </span>
                  {/* A language that is not fully translated yet says so BEFORE the click:
                      the visitor should never discover it only from the notice strip. */}
                  {item.lang !== 'en' && !isLiveLocale(item.lang) && !active && (
                    <span
                      aria-hidden={false}
                      className="flex-shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-primary-darker"
                    >
                      {t('lang.comingSoon')}
                    </span>
                  )}
                  {/* `aria-current` announces the selection; this is its visual half. */}
                  {active && (
                    <span
                      aria-hidden
                      className="flex-shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-dark"
                    >
                      {lt('selected', 'Selected')}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // ---- Level 1: the regions -------------------------------------------------------------
  return (
    <div>
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-text">{t('region.title')}</p>
        <p className="mt-0.5 text-xs text-muted">
          {/* An unconfirmed region is a guess from the browser locale — say so, so the
              visitor knows to check it rather than trusting a wrong number. */}
          {confirmed ? t('region.subtitle') : lt('region.guessedNote', 'We guessed this from your browser, please confirm.')}
        </p>
      </div>

      <ul className="py-1.5">
        {regions.map((r) => {
          const active = r.key === region;
          return (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => setOpenRegion(r)}
                aria-current={active ? 'true' : undefined}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  active ? 'bg-navy-50 text-navy-900' : 'text-ink hover:bg-navy-50 hover:text-navy-900'
                }`}
              >
                <span className={`min-w-0 flex-1 truncate text-sm ${active ? 'font-semibold' : ''}`}>
                  {lt(`region.${r.key}.label`, r.label)}
                </span>
                <span aria-hidden className="flex-shrink-0 text-sm leading-none text-muted">
                  &rsaquo;
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* The office/contact block that used to close this panel is gone — the picker is a
          market chooser, not a contact card. The serving office is still reachable on the
          Contact page and in the footer, and the region a visitor picks here still routes
          their RFQ to the right desk (the Contact page's RFQ tab reads it from the region
          context). */}
    </div>
  );
}

export default function RegionLanguageSwitcher({ compact = false }) {
  const { entry, meta } = useRegion();
  const { language, t } = useLocale();
  const lt = useLT('common');

  /**
   * The trigger spells the market out: "INDIA (EN)", "CANADA (FR)".
   *
   * `short` is used where the full name would crowd the header — UK, USA, UAE — and until
   * a country has been picked the region label stands in, so the control always names a
   * place rather than showing an empty slot.
   */
  const countryName = entry && lt(`country.${entry.code}`, entry.country);
  const regionLabel = lt(`region.${meta.key}.label`, meta.label);
  const place = entry ? entry.short || countryName : regionLabel;
  const label = (
    <>
      <Globe
        aria-hidden
        className={`${compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'} flex-shrink-0`}
        strokeWidth={2}
      />
      <span className="whitespace-nowrap uppercase">
        {place} ({language})
      </span>
    </>
  );

  return (
    <HeaderPopover
      compact={compact}
      label={label}
      hint={t('region.hint')}
      srLabel={`${t('header.regionAria')}, ${entry ? `${countryName}, ` : ''}${regionLabel}, ${
        getLanguage(language).label
      }`}
      panelClassName="w-[21rem]"
    >
      {({ close }) => <Panel close={close} />}
    </HeaderPopover>
  );
}
