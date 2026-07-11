/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        /* 118 usages of `text-ink` across the pages; left untouched. */
        ink: '#1E293B',
        /* The old flat `surface: '#F8F9FA'` was removed: declared after the token object
           above, it silently overwrote it. Its six usages now resolve to the token
           (#F5F9FD) — two levels bluer, nothing measured depends on it. */
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,35,66,0.04), 0 8px 24px -8px rgba(10,35,66,0.12)',
        cardHover: '0 4px 8px rgba(10,35,66,0.06), 0 16px 36px -10px rgba(10,35,66,0.18)',
      },
      backgroundImage: {
        'diagonal-steel':
          'linear-gradient(135deg, #0A2342 0%, #0F3666 45%, #0A2342 100%)',
        'spec-grid':
          'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
