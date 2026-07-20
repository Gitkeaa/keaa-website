import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'KEAA International';
const SITE_URL = 'https://www.keaainternational.com';
/**
 * The default social-share image, proxied through Cloudinary like the rest of the stock
 * photography (see src/data/images.js). This one is only ever fetched by social crawlers
 * rather than by visitors, so it was never the privacy problem the in-page images were —
 * it is routed the same way so there is exactly one place Unsplash is referenced.
 */
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/keaa-assets/image/fetch/f_auto,q_auto,w_1200,c_limit/' +
  encodeURIComponent('https://images.unsplash.com/photo-1636362556682-11231883c01c');

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
 */
export default function useSEO({ title, description, image, breadcrumbs, schema }) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    document.title = fullTitle;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:url', `${SITE_URL}${location.pathname}`);
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
    canonical.setAttribute('href', `${SITE_URL}${location.pathname}`);
  }, [title, description, image, location.pathname]);

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
