/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
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