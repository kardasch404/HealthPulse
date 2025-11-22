/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#051F20',
        'primary-dark': '#0B2B26',
        secondary: '#163832',
        accent: '#235347',
        light: '#8EB69B',
        'light-bg': '#DAF1DE',
      },
    },
  },
  plugins: [],
}
