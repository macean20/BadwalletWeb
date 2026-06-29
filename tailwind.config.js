/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0f172a',    // bg-slate-900
          primary: '#2563eb', // bg-blue-600
          accent: '#10b981',  // bg-emerald-500
          light: '#f8fafc',   // bg-slate-50
          card: '#ffffff',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
