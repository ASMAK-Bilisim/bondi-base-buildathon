/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        mello: ['MelloCondensed', 'sans-serif'],
      },
      colors: {
        'app-primary-1': '#D8FEAA',
        'app-primary-2': '#1C544E',
        'app-accent': '#F49C4A',
        'app-dark': '#071F1E',
        'app-light': '#F2FBF9',
        'app-dark-mint': '#D4E7E2',
      },
      fontSize: {
        'app-headline-1': ['42px', '48px'],
        'app-body-1': ['18px', '26px'],
        'app-body-2': ['16px', '24px'],
      },
    },
  },
  plugins: [],
}