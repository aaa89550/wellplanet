/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cosmos: {
          bg: '#030712',
          repulsion: '#ef4444',
          repulsion2: '#78716c',
          attraction: '#3b82f6',
          attraction2: '#c0c0c0',
          gravity: '#f59e0b',
          gravity2: '#fafafa',
        },
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
    },
  },
  plugins: [],
}
