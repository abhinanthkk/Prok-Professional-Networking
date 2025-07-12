/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo-600
          hover: '#4338CA',   // Indigo-700
        },
        secondary: {
          DEFAULT: '#6B7280', // Gray-500
          hover: '#4B5563',   // Gray-600
        },
      },
    },
  },
  // darkMode: 'class',
  plugins: [],
} 