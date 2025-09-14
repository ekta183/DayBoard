/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a1a',
        'bg-secondary': '#2d2d2d',
        'bg-tertiary': '#3d3d3d',
        'text-primary': '#ffffff',
        'text-secondary': '#b3b3b3',
        'text-muted': '#808080',
        'border-color': '#404040',
        'accent': '#4f46e5',
        'accent-hover': '#6366f1',
        'productive': '#10b981',
        'moderate': '#f59e0b',
        'not-productive': '#ef4444',
      }
    },
  },
  plugins: [],
}

