import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from '@prerenderer/rollup-plugin'
import { getPrerenderRoutes, resolveBrowser } from './scripts/prerender-routes.mjs'

/**
 * Build-time prerendering. See scripts/prerender-routes.mjs for what is rendered and why.
 *
 * The whole block is conditional on finding a Chromium binary: if none is present the
 * plugin is simply not added and the build produces the same SPA it always did. A missing
 * browser must never be able to break a deploy.
 */
const browser = await resolveBrowser()
const includeProducts = process.env.PRERENDER_PRODUCTS === '1'

if (!browser) {
  console.warn(
    '[prerender] No browser found, so prerendering is SKIPPED and this build is a plain SPA.\n' +
      '            Every URL will then serve the homepage title and canonical, which is the\n' +
      '            single most expensive SEO failure this site has had. scripts/check-prerender.mjs\n' +
      '            reports it after the build; set REQUIRE_PRERENDER=1 to make it fatal.\n' +
      '            Set PRERENDER_BROWSER to a Chrome, Edge or Chromium binary to enable it.'
  )
}

const prerenderPlugin = browser
  ? prerender({
      routes: getPrerenderRoutes({ includeProducts }),
      renderer: '@prerenderer/renderer-puppeteer',
      rendererOptions: {
        // Dispatched by useSEO once the route's markup AND its <head> tags are committed —
        // a fixed delay would race the lazy route chunks. See src/hooks/useSEO.js.
        renderAfterDocumentEvent: 'keaa:prerender-ready',
        /**
         * Sets `window.__PRERENDER_INJECTED` before any app code runs, so a component can
         * tell it is being snapshotted.
         *
         * This exists to stop body-portalled overlays being baked into the HTML. React
         * portals mount OUTSIDE #root, and on a real visit React only replaces #root — so
         * a snapshotted overlay stays in the document as dead markup that no handler is
         * attached to, sitting underneath the live one React then creates. The cookie bar
         * hit exactly this: every prerendered page shipped a second, undismissable copy.
         * Any future body-portalled overlay must check this flag too.
         */
        inject: { prerender: true },
        /**
         * How many pages render at once. Four was fine when this rendered forty pages; with
         * all 355 products in twelve languages it is 4,788, and a Vercel build was taking
         * about forty minutes, which makes every deploy painful and stacks up a queue when
         * several land together.
         *
         * Each concurrent route is one more browser tab holding one small page, so this is
         * bounded by memory rather than by CPU, and eight tabs is comfortable in a standard
         * build container. PRERENDER_CONCURRENCY overrides it: lower it if a build ever dies
         * without an error, which is what an out-of-memory kill looks like from here.
         */
        maxConcurrentRoutes: Number(process.env.PRERENDER_CONCURRENCY) || 8,
        timeout: 30000,
        launchOptions: {
          executablePath: browser.executablePath,
          headless: true,
          // --no-sandbox is required for the common CI/root-container case and is safe
          // here: the only pages this browser ever opens are our own build output.
          // browser.args carries whatever the serverless Chromium build additionally needs.
          args: [...new Set(['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', ...browser.args])],
        },
      },
    })
  : null

/**
 * Local stand-in for the vercel.json rewrites. Everything under /api (forms, chat widget,
 * admin console) and /uploads (avatars, product images served by the backend) goes to the
 * Spring Boot backend on :8080, so the app calls its API on ITS OWN origin in every
 * environment and the login cookie is always first-party. The chat used to run in a separate
 * Node process on :3001; it is now a controller in that same backend.
 */
const backendProxy = {
  '/api': { target: 'http://localhost:8080', changeOrigin: true },
  '/uploads': { target: 'http://localhost:8080', changeOrigin: true },
}

export default defineConfig(async () => ({
  plugins: [react(), prerenderPlugin].filter(Boolean),
  server: {
    port: 5173,
    open: true,
    proxy: backendProxy,
  },
  // `npm run preview` serves the production build locally; it needs the same proxy or every
  // /api call would hit the static server and 404.
  preview: {
    port: 4173,
    proxy: backendProxy,
  },
  build: {
    rollupOptions: {
      output: {
        // Pin only the libraries that are (a) big and (b) genuinely needed on every page
        // into their own cacheable chunks. Everything else — notably the lucide icon set —
        // is left to Vite's per-route splitting, so a page's icons ride in that page's own
        // lazy chunk instead of bloating the initial load. (A catch-all `vendor` chunk was
        // tried and made first paint WORSE by forcing every route's icons eager.)
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('framer-motion')) return 'motion'
          // The markdown renderer (react-markdown + the remark/micromark/mdast/hast stack)
          // is reached only through the lazy chat widget — keep it in its own lazy chunk.
          if (
            id.includes('react-markdown') || id.includes('remark') ||
            id.includes('micromark') || id.includes('mdast') ||
            id.includes('hast') || id.includes('unist') ||
            id.includes('unified') || id.includes('vfile') ||
            id.includes('property-information') || id.includes('character-entities') ||
            id.includes('decode-named-character-reference') || id.includes('trough') ||
            id.includes('trim-lines') || id.includes('longest-streak') ||
            id.includes('markdown-table') || id.includes('comma-separated-tokens') ||
            id.includes('space-separated-tokens') || id.includes('stringify-entities') ||
            id.includes('html-void-elements') || id.includes('estree')
          ) return 'markdown'
          // React core + router: needed for the very first paint anyway, so one shared,
          // long-cached chunk is ideal.
          if (
            id.includes('/react-dom/') || id.includes('/react-router') ||
            id.includes('/@remix-run/') || id.includes('/react/') ||
            id.includes('/scheduler/')
          ) return 'react-vendor'
          return undefined
        },
      },
    },
  },
}))
