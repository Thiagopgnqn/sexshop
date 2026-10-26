/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Los tokens se resuelven con variables CSS (ver src/index.css) para que el
      // panel de administración (.theme-admin) use una variante más suave y clara
      // del mismo tema, sin duplicar clases en los componentes.
      colors: {
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--c-surface) / <alpha-value>)',
          elevated: 'rgb(var(--c-surface-elevated) / <alpha-value>)',
          hover: 'rgb(var(--c-surface-hover) / <alpha-value>)',
          subtle: 'rgb(var(--c-surface-subtle) / <alpha-value>)',
        },
        brand: {
          DEFAULT: 'rgb(var(--c-brand) / <alpha-value>)',
          hover: 'rgb(var(--c-brand-hover) / <alpha-value>)',
          deep: 'rgb(var(--c-surface-elevated) / <alpha-value>)',
          muted: 'rgb(var(--c-mauve) / <alpha-value>)',
          border: 'rgb(var(--c-line) / <alpha-value>)',
        },
        mauve: {
          DEFAULT: 'rgb(var(--c-mauve) / <alpha-value>)',
          light: 'rgb(var(--c-mauve-light) / <alpha-value>)',
          dark: 'rgb(var(--c-surface-elevated) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--c-line) / 0.26)',
          subtle: 'rgb(var(--c-line) / 0.15)',
          strong: 'rgb(var(--c-line) / <alpha-value>)',
          accent: 'rgb(var(--c-brand) / <alpha-value>)',
        },
        content: {
          DEFAULT: 'rgb(var(--c-content) / <alpha-value>)',
          main: 'rgb(var(--c-content) / <alpha-value>)',
          secondary: 'rgb(var(--c-content-secondary) / <alpha-value>)',
          muted: 'rgb(var(--c-content-muted) / <alpha-value>)',
          subtle: 'rgb(var(--c-content-subtle) / <alpha-value>)',
        },
        status: {
          success: '#86EFAC',
          'success-bg': 'rgba(20, 83, 45, 0.32)',
          'success-border': 'rgba(134, 239, 172, 0.3)',
          warning: '#FCD34D',
          'warning-bg': 'rgba(120, 53, 15, 0.32)',
          'warning-border': 'rgba(252, 211, 77, 0.3)',
          error: '#FCA5A5',
          'error-bg': 'rgba(127, 29, 29, 0.35)',
          'error-border': 'rgba(252, 165, 165, 0.35)',
        },
      },
      // Borde por defecto (cuando un elemento usa `border` sin color explícito):
      // malva translúcido en vez del gris claro de Tailwind, que encandila.
      borderColor: {
        DEFAULT: 'rgb(var(--c-line) / 0.22)',
      },
      fontFamily: {
        display: ['Jost', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 2px 0 rgba(0, 0, 0, 0.18), 0 2px 8px -2px rgba(0, 0, 0, 0.22)',
        'lifted': '0 10px 30px -8px rgba(0, 0, 0, 0.45)',
        'overlay': '0 24px 60px -16px rgba(0, 0, 0, 0.6)',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '6px',
        'lg': '8px',
        'xl': '10px',
        '2xl': '12px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
