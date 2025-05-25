/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Using class-based dark mode
  theme: {
    extend: {
      colors: {
        'theme-red': '#DB0000',         // Primary Red
        'theme-yellow': '#F5C518',      // Accent Yellow
        'theme-white': '#FFFFFF',       // Primary White (for text, highlights)
        'theme-light-gray': '#F0F0F0', // For light backgrounds or subtle elements
        'theme-medium-gray': '#AAAAAA', // For secondary text
        'theme-dark-gray': '#222222',   // For card backgrounds in dark mode
        'theme-bg-dark': '#121212',     // Main dark background
        'theme-bg-light': '#FFFFFF',    // Main light background (if you implement light mode)
      },
      fontFamily: {
        // sans: ['Your Chosen Font', 'sans-serif'], // If you add a custom font
      },
    },
  },
  plugins: [],
}