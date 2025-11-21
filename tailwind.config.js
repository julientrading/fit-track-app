/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-down': {
          '0%': { transform: 'translate(-50%, -100%)', opacity: '0' },
          '100%': { transform: 'translate(-50%, 0)', opacity: '1' },
        },
      },
      animation: {
        'slide-down': 'slide-down 0.3s ease-out',
      },
      colors: {
        primary: {
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#9333EA',
            700: '#7E22CE',
            800: '#6B21A8',
            900: '#581C87',
          },
          pink: {
            50: '#FDF2F8',
            100: '#FCE7F3',
            200: '#FBCFE8',
            300: '#F9A8D4',
            400: '#F472B6',
            500: '#EC4899',
            600: '#DB2777',
            700: '#BE185D',
            800: '#9D174D',
            900: '#831843',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
        'gradient-purple': 'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)',
        'gradient-pink': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
      }
    },
  },
  plugins: [],
}
