/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#F8D5E4',
        },
      },
      fontFamily: {
        caslon: ['Adobe Caslon Pro', 'serif'],
      },
    },
  },
  plugins: [],
}