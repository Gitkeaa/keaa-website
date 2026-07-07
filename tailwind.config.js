/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
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
        ink: '#1E293B',
        surface: '#F8F9FA',
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
