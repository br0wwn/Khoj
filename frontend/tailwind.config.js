/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F9F8F6',
        citizen: {
          DEFAULT: '#8E1616',
          light: '#A91D1D',
          dark: '#6B1010',
        },
        police: {
          DEFAULT: '#1A3D64',
          light: '#2A5484',
          dark: '#0F2740',
        }
      }
    },
  },
  plugins: [],
}
