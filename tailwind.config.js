/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf0',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        casino: {
          red: '#C40018',
          brightRed: '#FF1E1E',
          gold: '#FFD700',
          chrome: '#E5E5E5',
          goldDark: '#8F6B29',
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shake': 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both',
        'flash': 'flash 0.5s ease-out',
        'sunburst': 'sunburstRotate 20s linear infinite',
        'bulb-chase-odd': 'bulbOdd 0.6s steps(1, end) infinite',
        'bulb-chase-even': 'bulbEven 0.6s steps(1, end) infinite',
        'logo-shine': 'logoShine 3s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.6, filter: 'drop-shadow(0 0 15px rgba(255, 30, 30, 0.6))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 35px rgba(255, 30, 30, 0.9))' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-2px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(4px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-6px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(6px, 0, 0)' },
        },
        flash: {
          '0%': { opacity: 1, backgroundColor: 'rgba(255, 255, 255, 1)' },
          '100%': { opacity: 0, backgroundColor: 'rgba(255, 255, 255, 0)' },
        },
        sunburstRotate: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
        bulbOdd: {
          '0%, 100%': { backgroundColor: '#FFD700', boxShadow: '0 0 10px #FFD700, 0 0 20px #FF8C00' },
          '50%': { backgroundColor: '#8B6508', boxShadow: 'none' },
        },
        bulbEven: {
          '0%, 100%': { backgroundColor: '#8B6508', boxShadow: 'none' },
          '50%': { backgroundColor: '#FFD700', boxShadow: '0 0 10px #FFD700, 0 0 20px #FF8C00' },
        },
        logoShine: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 20px rgba(220, 38, 38, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 40px rgba(220, 38, 38, 0.9))' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}
