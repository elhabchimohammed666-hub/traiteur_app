/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zellige: {
          DEFAULT: '#0F5C4D',
          dark: '#0B4439',
          light: '#1B826E',
          soft: '#EAF4F1',
          accent: '#2FA48E'
        },
        safran: {
          DEFAULT: '#B8923A',
          dark: '#947228',
          light: '#D9B65C',
          soft: '#FBF5E6'
        },
        creme: {
          DEFAULT: '#FBF5E6',
          dark: '#14110E',
          soft: '#FFFDF9'
        },
        sable: {
          DEFAULT: '#EADFC8',
          dark: '#1E1A15',
          light: '#F4ECE0'
        },
        anthracite: {
          DEFAULT: '#1F1B16',
          light: '#3C362F',
          muted: '#7A7265'
        },
        terracotta: {
          DEFAULT: '#B5523B',
          soft: '#FBECE8'
        },
        majorelle: {
          DEFAULT: '#2B4BC9',
          soft: '#EBF0FF'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Amiri', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'zellige': '0 4px 20px -2px rgba(15, 92, 77, 0.12)',
        'safran': '0 4px 20px -2px rgba(184, 146, 58, 0.20)',
        'card': '0 10px 30px -5px rgba(31, 27, 22, 0.08)'
      }
    },
  },
  plugins: [],
};
