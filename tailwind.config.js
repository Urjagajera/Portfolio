/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        display: ['Syne', '"Hanken Grotesk"', 'sans-serif'],
        mono: ['"Courier Prime"', 'Courier New', 'monospace'],
        note: ['Gaegu', 'cursive'],
        pen: ['"Nanum Pen Script"', 'cursive'],
        scrawl: ['"Reenie Beanie"', 'cursive'],
      },
    },
  },
  plugins: [],
};
