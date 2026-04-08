/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0F19',
          800: '#141B2D',
          700: '#1A233A',
          600: '#232F4D',
          500: '#344569'
        },
        primary: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7'
        },
        accent: {
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
