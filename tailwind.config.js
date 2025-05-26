/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Crucial for html.dark selector
  theme: {
    extend: {
      colors: {
        // Primary Action/Accent Colors
        'primary-red': '#DB0000',
        'primary-yellow': '#F5C518',

        // Backgrounds
        'background-light': '#FFFFFF',
        'background-dark': '#121212',
        
        // Surfaces (Cards, Modals, etc.)
        'surface-light': '#F3F4F6', // A bit off-white (like gray-100)
        'surface-dark': '#1E1E1E',  // A bit off-black (like gray-900 or a custom dark)

        // Text
        'text-primary-light': '#111827',      // Dark text for light backgrounds (like gray-900)
        'text-primary-dark': '#F3F4F6',       // Light text for dark backgrounds (like gray-100)
        'text-secondary-light': '#4B5563',  // Medium-dark text (like gray-600)
        'text-secondary-dark': '#9CA3AF',   // Medium-light text (like gray-400)
        'text-on-primary': '#FFFFFF',        // Text that goes on primary-red or primary-yellow (usually white)

        // Borders
        'border-light': '#D1D5DB',           // Light mode borders (like gray-300)
        'border-dark': '#374151',            // Dark mode borders (like gray-700)
        
        // Keeping your original names if you prefer, but consider aliasing or migrating
        'theme-red': '#DB0000',
        'theme-yellow': '#F5C518',
        'theme-white': '#FFFFFF',
        'theme-light-gray': '#F0F0F0', // Similar to surface-light or text-primary-dark
        'theme-medium-gray': '#AAAAAA',// Similar to text-secondary-dark
        'theme-dark-gray': '#222222',  // Similar to surface-dark
        'theme-bg-dark': '#121212',    // == background-dark
        'theme-bg-light': '#FFFFFF',   // == background-light
      },
      fontFamily: {
        // sans: ['Inter', 'sans-serif'], // Example
      },
      transitionProperty: {
        'colors': 'background-color, border-color, color, fill, stroke, opacity',
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // If you use form elements extensively
  ],
}