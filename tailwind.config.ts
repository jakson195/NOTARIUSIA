import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#131B2E',
          50: '#F3F5F9',
          100: '#E4E8F1',
          200: '#C3CBDE',
          300: '#95A2BF',
          400: '#5E6D93',
          500: '#3A4568',
          600: '#242E4A',
          700: '#1A2238',
          800: '#131B2E',
          900: '#0C1120',
        },
        paper: {
          DEFAULT: '#F5F4F0',
          soft: '#FBFAF8',
        },
        brass: {
          DEFAULT: '#A4813A',
          light: '#C9A45E',
          dark: '#7C5F27',
        },
        wax: {
          DEFAULT: '#7A2E2E',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
