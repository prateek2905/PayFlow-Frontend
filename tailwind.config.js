/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#FAFAF9',
        }
      }
    },
  },
  plugins: [],
}
