import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e9ff',
          200: '#b7d5ff',
          300: '#85b8ff',
          400: '#4d93ff',
          500: '#2570f5',
          600: '#1a56d6',
          700: '#1743ab',
          800: '#173a8a',
          900: '#17336f',
        },
      },
      fontSize: {
        'btn-lg': ['1.125rem', { lineHeight: '1.5rem' }],
      },
    },
  },
  plugins: [],
}
export default config
