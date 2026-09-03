/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gpay: {
          blue: '#1a73e8',
          blueLight: '#4285F4',
          blueDark: '#174ea6',
          blueSubtle: '#e8f0fe',
          blueDarkSubtle: 'rgba(66, 133, 244, 0.15)',
          red: '#ea4335',
          yellow: '#fbbc04',
          green: '#34a853',
          surface: '#12141a',
          card: '#1b1f28',
          cardHover: '#232936',
          border: 'rgba(255, 255, 255, 0.08)',
          borderFocus: '#4285F4',
        }
      },
      fontFamily: {
        sans: ['Google Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'gpay': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'gpay-blue': '0 0 25px -3px rgba(66, 133, 244, 0.4)',
        'gpay-green': '0 0 25px -3px rgba(52, 168, 83, 0.4)',
      }
    },
  },
  plugins: [],
}