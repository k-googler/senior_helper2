/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kakao: {
          yellow: '#FEE500',
          black: '#191919',
        }
      }
    },
  },
  plugins: [],
}
