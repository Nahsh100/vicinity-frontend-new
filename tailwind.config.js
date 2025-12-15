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
          50: 'oklch(96% 0.02 237.323)',
          100: 'oklch(92% 0.04 237.323)',
          200: 'oklch(85% 0.08 237.323)',
          300: 'oklch(78% 0.12 237.323)',
          400: 'oklch(72% 0.14 237.323)',
          500: 'oklch(68.5% 0.169 237.323)',
          600: 'oklch(65% 0.18 237.323)',
          700: 'oklch(58% 0.16 237.323)',
          800: 'oklch(50% 0.14 237.323)',
          900: 'oklch(42% 0.12 237.323)',
          950: 'oklch(35% 0.10 237.323)',
        },
      },
    },
  },
  plugins: [],
}
