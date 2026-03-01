/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      display: ['"Courier New"', 'monospace'],
      body: ['"Courier New"', 'monospace'],
      mono: ['"Courier New"', 'monospace'],
    },
    extend: {
      colors: {
        factory: {
          50: '#f0e8d8',
          100: '#e0d0b8',
          200: '#c8b898',
          300: '#a89878',
          400: '#8a7a5a',
          500: '#6a5a3a',
          600: '#4a4030',
          700: '#3a3028',
          800: '#2a2018',
          900: '#1a1410',
          950: '#120e0a',
        },
        accent: {
          orange: '#ff6b35',
          'orange-light': '#ff8855',
          'orange-dark': '#cc5528',
          green: '#44dd66',
          yellow: '#ffaa33',
          blue: '#4488dd',
          red: '#dd4444',
          purple: '#aa66cc',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
