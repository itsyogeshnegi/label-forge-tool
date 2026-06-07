/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Courier New', 'Courier', 'monospace'],
      },
      colors: {
        // Core monochrome theme
        logistics: {
          lightBg: '#ffffff',
          darkBg: '#0f172a',
          lightBorder: '#e2e8f0',
          darkBorder: '#334155',
          lightText: '#0f172a',
          darkText: '#f8fafc',
        }
      }
    },
  },
  plugins: [],
}
