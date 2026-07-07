import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'KEAA International';
const SITE_URL = 'https://www.keaainternational.com';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1636362556682-11231883c01c?auto=format&fit=crop&w=1200&q=80';

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

/**
 * Sets a unique document title, meta description, canonical URL and Open
 * Graph / Twitter tags for the current route. Lightweight alternative to
 * react-helmet-async -- no extra dependency required.
 */
export default function useSEO({ title, description, image }) {
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
}
