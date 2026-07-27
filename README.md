# KEAA International — Website

A React website for **KEAA International Pvt. Ltd.** — manufacturer & exporter of
scaffolding systems, formwork accessories, safety products, livestock housing
solutions and garden hardware.

Built with **React 18 + Vite 5 + Tailwind CSS 3 + Framer Motion + React Router 6**.
The AI chat widget is backed by a small **Express + Google Gemini** server (`server.js`).

## Getting Started

**Requires Node.js 20.11 or newer.** `server.js` uses `import.meta.dirname`, which does
not exist on Node 18 or on Node 20.10 and below — the API server throws at boot on those
versions. The front end alone will build on 18, but the chat will not run.

```bash
npm install

npm run dev         # front end only, http://localhost:5173
npm run dev:server  # API server only, http://localhost:3001
npm run dev:all     # both together (this is the one you usually want)

npm run build       # production build to /dist
npm run preview     # serve the production build locally
```

The chat widget calls `/api/chat`, which the Vite dev server proxies to `localhost:3001`
(see `vite.config.js`). **That proxy is dev-only** — it does not survive `npm run build`,
so a production deployment must route `/api/*` to the Express process itself.

### Environment

Copy `.env.example` to `.env` and fill it in:

| Variable | Required | Notes |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Claude API key for the chat widget. Create one at <https://console.anthropic.com/settings/keys>; the account needs credit. Read only by `server.js`; it is never exposed to the browser. Without it the widget still answers, but from site data only. |
| `ANTHROPIC_MODEL` | no | Overrides the model. Defaults to `claude-haiku-4-5`. |
| `PORT` | no | API server port. Defaults to `3001`. |

There is no client-side env surface: nothing in `src/` reads `import.meta.env`, so no key
can leak into the bundle.

## Project Structure

```
src/
├── components/
│   ├── layout/          Header, NavPanel, HeaderSearch, MobileDrawer, Footer, Logo
│   ├── ui/              Button, CardRail, Badge, SectionHeading, PageHero, Reveal,
│   │                    AnimatedCounter, ImagePlaceholder, BrandTexture,
│   │                    CountrySelect, EmailField, PhoneField, WordLimitTextarea
│   ├── home/            HomeHeroBrandTest (the live homepage hero), CoreSolutions,
│   │                    ProductsShowcase, ManufacturingBand
│   ├── products/        ProductCard, CatalogSidebar
│   ├── Layout.jsx       Page shell (header + outlet + footer + overlays)
│   └── AiChat.jsx       Chat widget; talks to server.js
├── admin/               The /portal console — pages, layout, RBAC, help/SOP system
├── data/                Company info, catalogue, navigation, content, images
├── hooks/               useSEO
├── pages/               One file per route (15 pages, 17 routes)
├── App.jsx              Route definitions
├── main.jsx             App entry point
└── index.css            Design tokens (:root) + Tailwind layers

scripts/gen-categories.mjs   Regenerates src/data/categories.json from products.json
server.js                    Express + Gemini API for the chat widget
```

## Things worth knowing before you change anything

**The design tokens are load-bearing.** `src/index.css` defines the colour system in
`:root` and `tailwind.config.js` only maps it onto utilities. The comment block above
`:root` explains three rules that were derived by measuring contrast, not by taste —
read it before touching a colour. `src/components/ui/Button.jsx` carries the same
warning with the measured ratios.

**The catalogue is deliberately kept out of the entry chunk.** `src/data/products.json`
is 355 products (~181 KB). The site chrome only needs the category tree, so that is
precomputed into `src/data/categories.json` (~3.7 KB) by `scripts/gen-categories.mjs`,
which runs automatically on `npm run build`. Header, Footer, MobileDrawer and
CoreSolutions import `src/data/categories.js`; **anything that imports
`src/data/productHelpers.js` pulls in the whole catalogue**, so keep that to product
pages. Run `npm run gen:categories` by hand after editing `products.json`.

**The splash screen is an overlay, not a gate.** The route tree mounts immediately
underneath it, so page content and the LCP image exist in the DOM from the first frame
(a crawler always has empty `sessionStorage` and would otherwise see only a loading
animation). Because `IntersectionObserver` ignores occlusion, entrance animations would
otherwise fire behind the splash and be spent before anyone saw them — `src/hooks/useSplash.jsx`
holds them until it lifts.

## Known gaps

These are real and deliberate, not oversights — they are tracked, not fixed:

- **The three forms do not submit.** Contact, Request-a-Quotation and the job
  application all call `e.preventDefault()` and show a success panel without sending
  anything. There is no form backend yet. (There is no newsletter form, despite what
  the privacy policy says.)
- **The chat is not deployable as-is.** `AiChat` calls a relative `/api/chat` that only
  resolves through the Vite dev proxy, and the repo contains no host config that routes
  it to the Express process in production.
- **`/api/chat` is unauthenticated.** `server.js` uses a wide-open CORS policy with no
  rate limit and no auth, on KEAA's own Gemini key.
- **The chatbot and the catalogue disagree.** `server.js` builds its knowledge base from
  `src/data/products.js` (5 marketing categories, including a Safety Products line with
  real item codes), while the catalogue pages come from `src/data/products.json`
  (3 categories, 355 products, no PPE). Neither source is complete. Resolve this before
  trusting the bot's product answers.
- **`prefers-reduced-motion` is only half-honoured.** `src/index.css` neutralises CSS
  animation, but nearly all motion here is Framer Motion, which animates via JS and is
  untouched by that rule. Only some components call `useReducedMotion()`.
- **There are no tests and no CI.**

## Photography

Most imagery is high-quality *stock* photography standing in for official KEAA photos —
swap any entry in `src/data/images.js` for a real URL and nothing else needs to change.
The exceptions are real KEAA assets in `public/images/`: the leadership portraits and the
scanned certificates (`cert-iso-9001.jpg`, `cert-iso-14001.jpg`, `cert-iso-45001.jpg`,
`cert-zed-silver.jpg`). Product photography comes from Cloudinary via
`src/data/cloudinary.js`.
