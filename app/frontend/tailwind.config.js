/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: { DEFAULT: '#2563eb' },      // blue-600
        secondary: { DEFAULT: '#10b981' },    // green-500
        accent: { DEFAULT: '#f59e0b' },       // amber-500
        background: { DEFAULT: '#f9fafb' },   // gray-50
        surface: { DEFAULT: '#ffffff' },
        text: { DEFAULT: '#111827' },         // gray-900
      },
    },
  },
  plugins: [],
} 