/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F13',
        surface: 'rgba(255, 255, 255, 0.03)',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        primary: '#D946EF', // Fuchsia
        'primary-hover': '#C026D3',
        secondary: '#8B5CF6', // Violet
      },
      backdropBlur: {
        'glass': '12px',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        imperial: ['"Imperial Script"', 'cursive'],
      }
    },
  },
  plugins: [],
}
