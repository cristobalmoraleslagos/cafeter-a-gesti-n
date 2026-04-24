/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FAF6F0',
          100: '#F2E8D5',
          200: '#E0CFB1',
          300: '#C9B08C',
          400: '#A98B6C',
          500: '#8B6F4E',
          600: '#6F4E37',
          700: '#5A3E2B',
          800: '#4A3320',
          900: '#3D2A1A',
        },
        cream: '#FAF6F0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
