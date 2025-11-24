/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        brand: {
          yellow: '#FACC15', // Banana Yellow
          black: '#0F172A',  // Slate 900
          white: '#FFFFFF',
          gray: '#F8FAFC',   // Slate 50
        }
      },
      boxShadow: {
        'neo': '5px 5px 0px 0px #0F172A',
        'neo-sm': '3px 3px 0px 0px #0F172A',
        'neo-lg': '8px 8px 0px 0px #0F172A',
      },
      animation: {
        'bounce-slight': 'bounce-slight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        'bounce-slight': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}