/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F7F2',
          100: '#DCECE0',
          200: '#BBDAC3',
          300: '#8FC09C',
          400: '#5FA171',
          500: '#3D8450',
          600: '#2A6A3B',
          700: '#1F532E',
          800: '#14532D',  /* Primary Deep Forest */
          900: '#0E3B20',
          950: '#062010',
        },
        sage: {
          50: '#F5F8F6',
          100: '#E8EFE9',  /* Secondary Surface Accent */
          200: '#D2DFD4',
          300: '#B8CDBB',
          400: '#9AB59E',
          500: '#7B9B80',
          600: '#607E65',
          700: '#4C6450',
          800: '#3D5041',
          900: '#334237',
        },
        terracotta: {
          50: '#FCF6F3',
          100: '#F8ECE5',
          200: '#F0D5C7',
          300: '#E4B49F',
          400: '#D48A6F',
          500: '#C25E38',  /* Muted Terracotta CTA */
          600: '#A84E2B',
          700: '#8A3D20',
          800: '#6E321C',
          900: '#5B2B1B',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FAF8F5', /* Main Background */
          200: '#F3EFEA',
          300: '#E8E2D8',
          400: '#D6CDBF',
        },
        charcoal: {
          50: '#F6F7F6',
          100: '#E3E6E4',
          200: '#C3C9C4',
          300: '#9DA69F',
          400: '#758077',
          500: '#536358',
          600: '#3D4B41',
          700: '#2B352E',
          800: '#1E2621',  /* Dark Charcoal body text */
          900: '#141A16',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Tamil"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 16px -2px rgba(20, 40, 25, 0.05), 0 1px 3px 0 rgba(20, 40, 25, 0.03)',
        'card-hover': '0 12px 32px -4px rgba(20, 40, 25, 0.1), 0 4px 8px -2px rgba(20, 40, 25, 0.04)',
        'elevated': '0 20px 40px -8px rgba(20, 40, 25, 0.12), 0 8px 16px -4px rgba(20, 40, 25, 0.06)',
      }
    },
  },
  plugins: [],
}
