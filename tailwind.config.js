/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'olive-green': {
          50: '#f6f7f4',
          100: '#e9ede3',
          200: '#d3dac7',
          300: '#b4c0a3',
          400: '#95a67f',
          500: '#7a8c66',
          600: '#5f6f4f',
          700: '#4d5842',
          800: '#404838',
          900: '#373d32',
          950: '#1c2018',
        },
        'turquoise': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
      },
      fontFamily: {
        'arabic': ['Cairo', 'Tajawal', 'Arial', 'sans-serif'],
        'english': ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

