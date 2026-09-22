import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_LANGUAGE, INDEXED_LOCALES, isIndexedLocale, localePrefixOf } from '../i18n/languages';

const SITE_NAME = 'KEAA International';
const SITE_URL = 'https://www.keaainternational.com';

/**
 * The locale prefix this page load lives under ('' on the English site, '/de' on German).
 * `location.pathname` from the router never contains it — the prefix is the router's
 * basename (see App.jsx) — so canonical/og:url/hreflang re-attach it here. Fixed for the
 * lifetime of the load, exactly like the basename it mirrors.
 */
const LOCALE_PREFIX = typeof window === 'undefined' ? '' : localePrefixOf(window.location.pathname);
/**
 * The card shown when a link to this site is pasted into WhatsApp, LinkedIn or a search
 * preview, for every page that does not supply its own.
 *
 * It used to be an Unsplash stock photograph of somebody else's scaffolding, which is a
 * strange thing to put a company name against, and it meant the first impression of KEAA
 * in a shared link was a picture KEAA did not take. This one is the real logo and only
 * facts the site already publishes.
 *
 * Regenerate after a logo or tagline change with: node scripts/make-og-image.mjs
 *
 * Absolute on purpose. Open Graph crawlers do not resolve relative paths.
 */
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

/**
 * Marks the ONE <script> tag this hook owns. index.html ships a static Organization
 * block with no such attribute, so route-level schema never clobbers it.
 */
const JSONLD_ATTR = 'data-seo-jsonld';

function setMeta(attr, key, value) {
  if (!value) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

/** Absolute URL for a route path — schema.org requires fully-qualified URLs. */
export function absoluteUrl(path) {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${String(path).startsWith('/') ? path : `/${path}`}`;
}

/**
 * A BreadcrumbList from the same `[{ label, to }]` shape PageHero already receives, so a
 * page declares its trail once and it serves both the visible crumbs and the markup.
 *
 * The final crumb is the current page and deliberately carries no `item`: Google treats a
 * self-referencing last element as redundant, and omitting it is the documented form.
 */
function buildBreadcrumbList(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.to && i < crumbs.length - 1 ? { item: absoluteUrl(c.to) } : {}),
    })),
  };
}

/**
 * Sets a unique document title, meta description, canonical URL and Open Graph / Twitter
 * tags for the current route, plus optional JSON-LD structured data. Lightweight
 * alternative to react-helmet-async -- no extra dependency required.
 *
 * @param {object}   opts
 * @param {string}   opts.title        Page title (SITE_NAME is appended).
 * @param {string}   opts.description  Meta description.
 * @param {string}   opts.image        Social share image; falls back to DEFAULT_IMAGE.
 * @param {Array}    opts.breadcrumbs  `[{ label, to }]` -> emitted as a BreadcrumbList.
 * @param {object|Array} opts.schema   Extra schema.org object(s), e.g. a Product.
 * @param {boolean}  opts.noindex      Keep the page out of the index entirely.
 * @param {boolean}  opts.appendSiteName
   Whether to append " | KEAA International". True for the ordinary case, where a page
   supplies a bare subject. Pass false when the title already ends in the brand, which
   product and range pages do: their titles are composed to a 60 character budget by
   data/seoKeywords.js, and appending to that would push the useful words past where
   Google truncates.
 */
export default function useSEO({
  title,
  description,
  image,
  breadcrumbs,
  schema,
  noindex = false,
  appendSiteName = true,
}) {
  /**
   * Six locales are live but no longer offered to search engines. Every page under those
   * prefixes is noindex regardless of what the page itself asked for, because the decision
   * is about the locale rather than the page. See INDEXED_LOCALES in i18n/languages.js.
   */
  const localeNoindex = !isIndexedLocale(LOCALE_PREFIX);
  const isNoindex = noindex || localeNoindex;
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title
      ? (appendSiteName ? `${title} | ${SITE_NAME}` : title)
      : SITE_NAME;
    document.title = fullTitle;

    /**
     * robots. Removed rather than set to "index, follow" when a page is indexable, because
     * the absence of the tag already means exactly that and an explicit one is one more
     * thing that can contradict the canonical.
     */
    const robots = document.querySelector('meta[name="robots"]');
    if (isNoindex) setMeta('name', 'robots', 'noindex, follow');
    else if (robots) robots.remove();

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', `${SITE_URL}${LOCALE_PREFIX}${location.pathname}`);
    setMeta('property', 'og:image', image || DEFAULT_IMAGE);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image || DEFAULT_IMAGE);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    // Each language's page is its OWN canonical — /de/about canonicalises to /de/about,
    // never to the English page; hreflang below is what ties the versions together.
    canonical.setAttribute('href', `${SITE_URL}${LOCALE_PREFIX}${location.pathname}`);

    /**
     * hreflang alternates — emitted only while at least one locale is live, so the English-
     * only site carries exactly the head it always did. Every language version lists the
     * full set including itself and an x-default pointing at English, which is the
     * documented reciprocal form Google requires (one-way links are ignored).
     */
    document.querySelectorAll('link[data-seo-hreflang]').forEach((el) => el.remove());
    /**
     * INDEXED_LOCALES, not liveLocales(). Six live locales were dropped from search on the
     * Search Console evidence of 22 September 2026; advertising an alternate we have asked
     * Google not to index is a contradiction, and Google ignores hreflang sets that contain
     * noindex members anyway.
     */
    const locales = INDEXED_LOCALES;
    // A page that is not indexed has nothing to offer alternates of.
    if (locales.length && !isNoindex) {
      const alternates = [
        [DEFAULT_LANGUAGE, `${SITE_URL}${location.pathname}`],
        ...locales.map((code) => [code, `${SITE_URL}/${code}${location.pathname}`]),
        ['x-default', `${SITE_URL}${location.pathname}`],
      ];
      for (const [lang, href] of alternates) {
        const el = document.createElement('link');
        el.setAttribute('rel', 'alternate');
        el.setAttribute('hreflang', lang);
        el.setAttribute('href', href);
        el.setAttribute('data-seo-hreflang', '');
        document.head.appendChild(el);
      }
    }
  }, [title, description, image, isNoindex, appendSiteName, location.pathname]);

  /**
   * Serialised rather than passed by reference: pages build these arrays/objects inline in
   * render, so a reference dependency would be a new identity every pass and re-run the
   * effect on every render.
   */
  const breadcrumbsKey = JSON.stringify(breadcrumbs || null);
  const schemaKey = JSON.stringify(schema || null);

  useEffect(() => {
    const graph = [];

    const crumbs = JSON.parse(breadcrumbsKey);
    if (crumbs && crumbs.length) graph.push(buildBreadcrumbList(crumbs));

    const extra = JSON.parse(schemaKey);
    if (extra) graph.push(...(Array.isArray(extra) ? extra : [extra]));

    let el = document.querySelector(`script[${JSONLD_ATTR}]`);

    if (!graph.length) {
      if (el) el.remove();
      return undefined;
    }

    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.setAttribute(JSONLD_ATTR, '');
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(graph.length === 1 ? graph[0] : graph);

    // Torn down on unmount so a Product block can never linger onto the next route.
    return () => {
      const stale = document.querySelector(`script[${JSONLD_ATTR}]`);
      if (stale) stale.remove();
    };
  }, [breadcrumbsKey, schemaKey]);

  /**
   * The signal the build-time prerenderer waits on (see PRERENDER_EVENT in vite.config.js).
   *
   * Declared LAST on purpose: effects in a component run in declaration order, so by the
   * time this fires both the meta effect and the JSON-LD effect above have already written
   * to <head>, and the page's own markup is committed. Waiting on a fixed timeout instead
   * would race a slow lazy chunk and snapshot an empty page.
   *
   * In a real browser this is an event nobody listens for — harmless, and it keeps the
   * prerender contract in the one place every page already calls.
   */
  useEffect(() => {
    document.dispatchEvent(new Event('keaa:prerender-ready'));
  });
}
