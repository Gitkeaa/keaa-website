# KEAA International — Website

A premium, animation-rich React website for **KEAA International Pvt. Ltd.**
— manufacturer & exporter of scaffolding systems, formwork accessories, safety
products, livestock housing solutions and garden hardware.

Built with **React 18 + Vite + Tailwind CSS + Framer Motion + React Router**.

## Getting Started

```bash
npm install
npm run dev      # starts the dev server at http://localhost:5173
npm run build    # production build to /dist
npm run preview  # preview the production build locally
```

Requires Node.js 18+. (`node_modules` isn't included — install on a machine
with internet access.)

## What's New in This Revision

- **Premium photography** — every hero, category card, and gallery tile now
  uses high-resolution (1920px+) real photography sourced from Unsplash
  (free license, commercial use, no attribution required — see
  `src/data/images.js`). The old low-resolution catalogue-screenshot images
  have been removed.
- **Animation system** — a small set of reusable motion primitives:
  - `src/components/ui/Reveal.jsx` — scroll-triggered fade/slide-up wrapper
    (`<Reveal>`, plus `<StaggerGroup>`/`<StaggerItem>` for sequenced reveals)
  - `src/components/ui/AnimatedCounter.jsx` — count-up stat numbers on scroll
  - `Button` and `Card` now use Framer Motion for hover lift, tap feedback,
    and animated icons
  - `PageHero` supports an optional full-bleed background photo with a subtle
    entrance zoom, so every inner page can have its own visual identity
- **Real embedded map** on the Contact page (Google Maps iframe) instead of a
  static placeholder.
- Every category in Products now has real photography (including Safety
  Products, previously a placeholder).

## Content Notes

Company information, certifications, and product item codes/specs are sourced
from KEAA's own corporate catalogues, so they reflect the real business. A few
things to finish before launch:

- **Photography** — current images are high-quality *stock* photography
  standing in for official KEAA photos (per the brief: "use any suitable
  high-quality images... until the client provides official media"). Swap
  any entry in `src/data/images.js` for a real KEAA photo by changing the URL
  string — no layout changes needed anywhere in the app.
- **Certificates** — the two images on `/certifications` (`cert-iso9001.jpg`,
  `cert-aeo.jpg` in `public/images/`) are real scanned KEAA certificates, kept
  deliberately as authentic documents rather than stock substitutes.
- **Forms** (Contact, RFQ, newsletter) are functional on the front end but
  not wired to a backend — connect to your preferred form handler.
- **Videos** are placeholders with a play button; wire up real video hosting
  (YouTube embed, Vimeo, or self-hosted) when available.
- Double-check phone numbers, emails and the Ludhiana plant address against
  your latest letterhead before publishing.

## Project Structure

```
src/
├── components/
│   ├── layout/        Header, TopBar, MegaMenu, MobileDrawer, Footer, Logo
│   ├── ui/             Button, Card, Badge, Stat, SectionHeading, PageHero,
│   │                   ImagePlaceholder, Reveal, AnimatedCounter
│   ├── Layout.jsx       Page shell (header + outlet + footer + overlays)
│   └── ScrollToTop.jsx  Scrolls to top / anchor on route change
├── data/                Company info, products, navigation, content, images
├── pages/               One file per route
├── App.jsx              Route definitions
├── main.jsx             App entry point
└── index.css            Tailwind layers + base styles
```

## Notes on Tech Choices

The brief referenced Shadcn UI; this build uses small hand-written Tailwind +
Framer Motion components (`src/components/ui/*`) instead, to keep the
dependency list minimal while still delivering rich hover/scroll
micro-interactions. You can layer in `shadcn/ui` later with
`npx shadcn@latest init` if you'd like its CLI-driven component library too.

Respects `prefers-reduced-motion` globally (see `src/index.css`) — visitors
who've asked their OS for reduced motion get instant transitions instead of
animations.
