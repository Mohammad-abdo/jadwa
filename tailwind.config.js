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
        'arabic': ['Alexandria', 'Cairo', 'serif'],
        'english': ['Cairo', 'Inter', 'Roboto', 'system-ui', 'sans-serif'],
        'sans': ['Cairo', 'Alexandria', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.05em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.05em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.05em' }],
        '5xl': ['3rem', { lineHeight: '1', letterSpacing: '-0.075em' }],
        '6xl': ['3.75rem', { lineHeight: '1', letterSpacing: '-0.075em' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.075em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.075em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.075em' }],
      },
    },
  },
  plugins: [],
}

