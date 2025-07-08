/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        vwRed: '#4C1D1D',
        vwBg: '#FDF6F3',
        vwAccent: '#D6BEBE',
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        caslon: ['"Adobe Caslon Pro"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
