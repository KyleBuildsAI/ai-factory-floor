/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      display: ['system-ui', 'sans-serif'],
      body: ['system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        factory: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        accent: {
          blue: '#4A90D9',
          green: '#50C878',
          orange: '#E8A838',
          red: '#E85D75',
          purple: '#9B59B6',
          yellow: '#F39C12',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
