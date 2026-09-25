/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * Semantic tokens. Every value lives in `:root` in src/index.css — this file only
         * maps them onto utilities. The `<alpha-value>` placeholder is what makes opacity
         * modifiers like `bg-primary/20` work against a CSS variable.
         *
         * Read the comment above `:root` before changing any of these. In short:
         * `primary` cannot carry white text (3.89:1), `primary-dark` can (4.87:1), and
         * `primary-deep` is not decorative — it exists so small blue text clears AA on
         * the hero's translucent scrim.
         */
        primary: {
          glow: 'rgb(var(--color-primary-glow) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          darker: 'rgb(var(--color-primary-darker) / <alpha-value>)',
          deep: 'rgb(var(--color-primary-deep) / <alpha-value>)',
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        /**
         * Signal red. Reserved for the two floating controls (the hero's film badge and the
         * AI assistant) — see the note in index.css before using it anywhere else.
         */
        signal: {
          light: 'rgb(var(--color-signal-light) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-signal) / <alpha-value>)',
          dark: 'rgb(var(--color-signal-dark) / <alpha-value>)',
          deep: 'rgb(var(--color-signal-deep) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          raised: 'rgb(var(--color-surface-raised) / <alpha-value>)',
          bright: 'rgb(var(--color-surface-bright) / <alpha-value>)',
          tint: 'rgb(var(--color-surface-tint) / <alpha-value>)',
          deep: 'rgb(var(--color-surface-deep) / <alpha-value>)',
          'deep-raised': 'rgb(var(--color-surface-deep-raised) / <alpha-value>)',
        },
        border: 'rgb(var(--color-border) / <alpha-value>)',
        text: {
          DEFAULT: 'rgb(var(--color-text) / <alpha-value>)',
          body: 'rgb(var(--color-text-body) / <alpha-value>)',
          strong: 'rgb(var(--color-text-strong) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        },

        /**
         * Legacy, kept deliberately. Twelve pages still reference `navy-*`, `gold-*` and
         * `ink`, and removing them here would silently strip their styling. Retire them
         * page by page in favour of the tokens above. `gold` is no longer a sanctioned
         * brand colour: its only surviving role is `accent`, and only on `surface-deep`.
         *
         * NOTE: `surface` above shadows the old flat `surface: '#F8F9FA'`. The two differ
         * by ~2 levels of blue and nothing measured depends on it.
         */
        navy: {
          DEFAULT: '#0A2342',
          50: '#EAF0F8',
          100: '#CFDEEE',
          200: '#9FBBDC',
          300: '#6F98CA',
          400: '#3F75B8',
          500: '#1A4F8F',
          600: '#0F3666',
          700: '#0A2342',
          800: '#071A33',
          900: '#050F1F',
          950: '#030A14',
        },
        gold: {
          DEFAULT: '#F5B400',
          50: '#FFF9E8',
          100: '#FFF0C2',
          200: '#FFE08A',
          300: '#FFCF52',
          400: '#FABE24',
          500: '#F5B400',
          600: '#CC9500',
          700: '#A37700',
          800: '#7A5900',
          900: '#523C00',
        },
        /* Body-copy ink. Every `text-ink` on the site resolves here, so this token is the
           single lever for the body colour. #384250 is taken from the reference typography
           the client supplied and matches the `--color-text-body` token in index.css.

           Use it at FULL opacity. `text-ink/60`-style tints were what produced nine
           different body greys across the pages; secondary copy now uses `text-muted`
           instead, so the site has exactly two body-text colours. */
        ink: '#000000',
        /* The one secondary body tone — captions, metadata, timestamps. Top-level so it
           reads as the natural partner to `ink`: body copy is `text-ink`, secondary copy
           is `text-muted`, and nothing else. It is the same value as the nested
           `text.muted` above (which spells out as the clumsier `text-text-muted`); both
           resolve to --color-text-muted, so there is still one source of truth. */
        muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
        /* The old flat `surface: '#F8F9FA'` was removed: declared after the token object
           above, it silently overwrote it. Its six usages now resolve to the token
           (#F5F9FD) — two levels bluer, nothing measured depends on it. */
      },
      fontFamily: {
        // One unified typeface: Satoshi across headings AND body (the Lely/PERI reference
        // look). `display` = headings/eyebrows (Bold 700), `body` = reading prose
        // (Light 300 via the `.body-copy` primitive in src/index.css). `mono` stays
        // JetBrains Mono, reserved for technical tokens only (item codes, step numbers).
        display: ['"Satoshi"', 'system-ui', 'sans-serif'],
        body: ['"Satoshi"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      /**
       * Body type scale. Values live in :root (src/index.css) so the `.body-copy`
       * primitive and these utilities can never drift apart.
       *
       *   text-body          18px — reading paragraphs, the reference's own size
       *   text-body-compact  16px — copy inside cards and dense grids
       *
       * Both carry the reference's 1.6 line-height, so a paragraph never needs a
       * separate `leading-*` utility. Tailwind's own text-xs…text-5xl are untouched and
       * remain correct for labels, badges and headings.
       */
      fontSize: {
        body: ['var(--text-body)', { lineHeight: 'var(--leading-body)' }],
        'body-compact': ['var(--text-body-compact)', { lineHeight: 'var(--leading-body)' }],
      },
      // A 14-inch 1920x1080 laptop run at Windows' default 150% scaling reports a CSS
      // viewport of about 1265px once the scrollbar is taken off, which is UNDER Tailwind's
      // `xl` (1280px). That is why those machines were served the tablet header with a
      // hamburger while an external monitor got the full navigation bar. `deck` is the width
      // at which the full six-item bar, the search and the quote button genuinely fit, so the
      // header switches on that rather than on `xl`. Everything below it is unchanged.
      screens: {
        deck: '1152px',
      },
      // Layout width tokens. Values live in :root (src/index.css) so the CSS
      // container tiers and these utilities share one source of truth.
      maxWidth: {
        content: 'var(--w-content)',
        wide: 'var(--w-wide)',
        measure: 'var(--w-prose)',
        form: 'var(--w-form)',
      },
      // One corner radius for every rectangular box on the site — cards, panels, modals,
      // inputs, media wrappers — matched to the project card on Projects & Gallery. The
      // mixed rounded-lg/xl/2xl scale is what read as unfinished; routing every box
      // through `rounded-card` means the whole site retunes from this one line.
      // Tailwind's default scale is left intact so it keeps working during the migration,
      // and `rounded-full` stays the deliberate exception for pills, chips and avatars.
      borderRadius: {
        card: '0.375rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,35,66,0.04), 0 8px 24px -8px rgba(10,35,66,0.12)',
        cardHover: '0 4px 8px rgba(10,35,66,0.06), 0 16px 36px -10px rgba(10,35,66,0.18)',
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
