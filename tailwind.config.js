/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ridewave: {
          black: '#000000',
          dark: '#121212',
          gray: '#1f1f1f',
          lightGray: '#2a2a2a',
          border: '#333333',
          accent: '#276EF1',
          accentHover: '#1E54B7',
          success: '#05A357',
          warning: '#FFC043',
          danger: '#E11900',
        },
        uber: {
          black: '#000000',
          dark: '#121212',
          gray: '#1f1f1f',
          lightGray: '#2a2a2a',
          border: '#333333',
          accent: '#276EF1', // Uber Blue
          accentHover: '#1E54B7',
          success: '#05A357',
          warning: '#FFC043',
          danger: '#E11900',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(39, 110, 241, 0.4)',
        'glow-success': '0 0 20px rgba(5, 163, 87, 0.4)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
