/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#0F0A0A',
        surface: {
          DEFAULT: '#1A1212',
          elevated: '#2B1917',
          hover: '#241716',
          subtle: '#140D0D',
        },
        brand: {
          DEFAULT: '#5A2A2E',
          hover: '#6E353A',
          deep: '#2B1917',
          muted: '#907878',
        },
        mauve: {
          DEFAULT: '#907878',
          light: '#B8ABA6',
          dark: '#2B1917',
        },
        border: {
          DEFAULT: 'rgba(144, 120, 120, 0.24)',
          subtle: 'rgba(144, 120, 120, 0.14)',
          strong: '#907878',
          accent: '#5A2A2E',
        },
        content: {
          DEFAULT: '#F2EDE8',
          main: '#F2EDE8',
          secondary: '#B8ABA6',
          muted: '#B8ABA6',
          subtle: '#907878',
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
      fontFamily: {
        display: ['Jost', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px 0 rgba(0, 0, 0, 0.35)',
        'lifted': '0 10px 30px -5px rgba(0, 0, 0, 0.55)',
        'overlay': '0 20px 50px -12px rgba(0, 0, 0, 0.75)',
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
