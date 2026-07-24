# react-i18next migration plan

A decision document. **No code has changed** — this describes what a migration would do, so you
can choose before anything moves. Today the app runs entirely on the custom system.

`i18next` and `react-i18next` were once installed speculatively but never imported by a single
file, so they were dropped from `package.json` during a dead-code sweep. Step 1 of this migration
is therefore `npm install i18next react-i18next` — nothing else about the plan below changes.

---

## 1. What you have today

A small, custom i18n layer, and it works:

| File | Role |
| --- | --- |
| `src/i18n/locales.js` | `strings` — a flat `{ en: {...}, nl: {...}, … }` map, one entry per UI string, across **12 locales** (en, nl, de, fr, es, it, pt, pl, ru, tr, ar, hi). |
| `src/i18n/languages.js` | The language list + metadata (labels, RTL flag), `DEFAULT_LANGUAGE`, `getLanguage`. |
| `src/i18n/LocaleContext.jsx` | The provider. Resolves the initial language, persists the choice, syncs `<html lang/dir>`, and exposes `useT()` / `useLocale()`. |

**10 components** consume it, via `const t = useT(); t('nav.home')` or `useLocale()` for
`{ language, setLanguage, meta, languages }`.

Three things this custom layer does that are specific to this codebase and easy to break in a
careless migration:

1. **Prerender-safe** — `resolveInitialLanguage()` guards every `window` / `localStorage` access,
   because it runs at the top of the tree during the build-time prerender where `window` does not
   exist and `localStorage` can *throw* (Safari private mode).
2. **Region and language are one control** — `RegionContext` calls `setLanguage` when a region is
   picked, so the two can never disagree. This is custom coupling, not a stock i18n feature.
3. **RTL is deliberately staged** — `RTL_LAYOUT_READY = false`. Arabic renders as text but the
   layout does not mirror yet, on purpose (a separate logical-properties pass is the real RTL work).

None of this comes for free in react-i18next. A migration has to *carry it across*, not replace it.

---

## 2. What "migrate" actually means here — the shim strategy

The safe migration does **not** touch the 10 consumers. It keeps `useT()` and `useLocale()` as the
public API and swaps only what is *behind* them, so `t('nav.home')` keeps working unchanged.

```
BEFORE                              AFTER
useT() ─► LocaleContext ─► strings  useT() ─► LocaleContext (thin shim) ─► react-i18next ─► resources
```

Concretely:

- `LocaleContext.jsx` becomes a thin wrapper over react-i18next's `useTranslation()`. It still owns
  the `<html lang/dir>` sync, the RTL flag, the localStorage persistence and the region coupling —
  react-i18next provides none of those.
- `locales.js` stays the single source of the strings; it is re-shaped from `{ en: {...} }` into
  i18next's `{ en: { translation: {...} } }` `resources` format. Same keys, same values.
- A new `src/i18n/i18n.js` initialises i18next once (`i18next.use(initReactI18next).init({...})`).

Result: same behaviour, same keys, same fallback, but the *engine* is now the industry-standard one.

---

## 3. File-by-file change list

| File | Change | Why |
| --- | --- | --- |
| `src/i18n/i18n.js` | **NEW** | i18next init: `resources`, `lng`, `fallbackLng: 'en'`, and the critical `keySeparator: false` (see §4). |
| `src/i18n/locales.js` | **EDIT** (mechanical) | Wrap each locale's map in a `translation` namespace. Values untouched. |
| `src/i18n/LocaleContext.jsx` | **EDIT** | Internals become a shim over react-i18next; keeps `<html lang/dir>`, RTL flag, persistence, region hook. Public API (`useT`, `useLocale`) unchanged. |
| `src/i18n/languages.js` | **NO CHANGE** | Language list/metadata still drives the switcher. |
| The 10 consumer components | **NO CHANGE** | They call `useT()`/`useLocale()`, which still exist. |
| `src/context/RegionContext` | **VERIFY only** | Confirm `setLanguage` still flows through. No logic change expected. |

So the churn is **three files**, and two of them are mechanical. That is the whole point of the shim.

---

## 4. The one real gotcha — `keySeparator`

Your keys are flat but contain dots: `'nav.home'`, `'auth.errUnreachable'`. i18next, by default,
reads `.` as a **nesting** separator — so `t('nav.home')` would look for `nav → home` (nested),
find nothing, and silently fall back. **Every single key would break at once, quietly.**

The fix is one line in the init: `keySeparator: false` (and `nsSeparator: false` if any key ever
contains `:`). With that, dotted keys are treated as literal flat keys, exactly like today.

This is the failure mode most likely to bite a rushed migration, which is exactly why it is called
out here rather than discovered live.

---

## 5. What you gain, and what you do NOT

**Gain (the reason to do it at all):**

- **Interpolation** — `t('rfq.count', { count: 5 })` → "5 products". Today you would concatenate.
- **Plurals** — correct singular/plural per language (many languages have more than two plural forms).
- **Number / date / currency formatting** — locale-correct, via the built-in formatter.
- **`<Trans>`** — translate a sentence that has a `<a>` or `<strong>` inside it without splitting it.
- **Namespaces + lazy loading** — split translations into per-language files loaded on demand. This
  matters for **full-site** content: you would not ship all 12 languages' body copy in the initial
  bundle, only the active one.
- Ecosystem: translation-management tools (Locize, Tolgee, etc.) speak i18next natively.

**Do NOT gain (worth being honest about):**

- **It does not translate anything.** The library manages strings; a human or a translation service
  still produces the words. Migrating engines and translating content are two separate jobs.
- Your current fallback-to-English safety already exists; react-i18next matches it, it is not an
  upgrade there.
- A small bundle cost: i18next core + react-i18next add roughly 20–40 KB min+gzip. Negligible for a
  site this size, but not zero.

---

## 6. Risks and rollback

| Risk | Severity | Mitigation |
| --- | --- | --- |
| `keySeparator` default breaks every dotted key | High | Set `keySeparator: false` in init (§4). Verified by a build + a spot-check that `t('nav.home')` still returns "Home". |
| Prerender build breaks (window at init time) | Medium | `resources` are static imports (no window). Initial `lng` keeps the existing guarded resolver. Confirm with a full `npm run build`. |
| Region↔language coupling silently stops working | Medium | Keep `setLanguage` in the shim wired to the same place; test picking a region changes the language. |
| RTL flag lost, Arabic starts mirroring half-broken | Low | Carry `RTL_LAYOUT_READY` and the `<html dir>` logic verbatim into the shim. |
| Two systems live at once during the work | Low | Do it in one focused pass, not spread over days. |

**Rollback is cheap:** all three i18n files are tracked in git, so `git checkout -- src/i18n/` (plus
`npm remove i18next react-i18next`) returns you exactly to today — the state this document describes,
where neither package is installed. Keep that in mind if a step feels
wrong mid-way — nothing here is one-way.

---

## 7. Timing — the honest recommendation

This is infrastructure, and infrastructure is fine to set up now. **Translating the body content is
still the last step**, after the English copy is frozen — that has not changed.

A sensible order:

1. **Now (optional):** do the shim migration. You end up on the standard engine with today's chrome
   strings, zero visible change, and the richer features available when you want them.
2. **As you build pages:** put new UI labels through `t()` as you already do. Do **not** key-ify long
   body paragraphs yet.
3. **When English is frozen:** extract body content into per-locale files (namespaces), then get it
   professionally translated. This is where react-i18next's lazy per-language loading pays off.
4. **Separately, whenever RTL is scheduled:** the logical-properties pass that flips `RTL_LAYOUT_READY`.
   Independent of the engine choice.

Doing the migration now is reasonable **only** because the shim makes it low-risk and invisible. If it
were a rip-and-replace of all 10 consumers, the right answer would be "wait" — but it is not.

---

## 8. Your decision

- **Migrate now (shim):** ~3 files, no consumer changes, build-verified. Recommended if you are
  committed to full-site i18n and want the standard base in place.
- **Set up alongside, migrate later:** init react-i18next but leave the custom system as the live one.
  Costs you a period of two systems for little benefit — not recommended.
- **Leave installed, unused:** the packages sit in `package.json` until you decide. Zero risk, zero
  gain, and a small temptation for someone later to wire it up carelessly (the `keySeparator` trap).

If you choose to migrate, the plan above is the exact set of steps, and it is reversible at every one.
