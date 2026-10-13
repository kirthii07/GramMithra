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
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gram: {
          50: '#f0fdf8',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        earth: {
          50: '#fdfbf7',
          100: '#f7f3ea',
          200: '#eee5d3',
          300: '#e1d0b5',
          400: '#cca983',
          500: '#b88656',
          600: '#a16e45',
          700: '#83553a',
          800: '#6c4533',
          900: '#5a3b2e',
        },
        sand: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
        },
        dark: {
          50: '#0a1a14',
          100: '#0d2318',
          200: '#112b1e',
          300: '#163824',
          400: '#1a472a',
          500: '#1f5731',
          600: '#256639',
          700: '#2d7a43',
          800: '#358f4e',
          900: '#3da45a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '100%': { boxShadow: '0 0 60px rgba(16, 185, 129, 0.8), 0 0 100px rgba(16, 185, 129, 0.4)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gram-gradient': 'linear-gradient(135deg, #022c22 0%, #064e3b 30%, #065f46 60%, #022c22 100%)',
        'hero-mesh': 'radial-gradient(at 40% 20%, hsla(150,100%,10%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(160,80%,8%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(145,100%,6%,1) 0px, transparent 50%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(16, 185, 129, 0.3)',
        'glow': '0 0 30px rgba(16, 185, 129, 0.4)',
        'glow-lg': '0 0 60px rgba(16, 185, 129, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
