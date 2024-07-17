/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'Roboto': ['Roboto', 'sans-serif'],
        'DMSans': ['DM Sans', 'sans-serif'],
        'Poppins': ['Poppins', 'sans-serif'],
        'Montserrat': ['Montserrat', 'sans-serif'],
        'THICCCBOI-Black': ['THICCCBOI-Black', 'sans-serif'],
        'THICCCBOI-Bold': ['THICCCBOI-Bold', 'sans-serif'],
        'THICCCBOI-ExtraBold': ['THICCCBOI-ExtraBold', 'sans-serif'],
        'THICCCBOI-Light': ['THICCCBOI-Light', 'sans-serif'],
        'THICCCBOI-Medium': ['THICCCBOI-Medium', 'sans-serif'],
        'THICCCBOI-Regular': ['THICCCBOI-Regular', 'sans-serif'],
        'THICCCBOI-SemiBold': ['THICCCBOI-SemiBold', 'sans-serif'],
        'THICCCBOI-ThicccAF': ['THICCCBOI-ThicccAF', 'sans-serif'],
        'THICCCBOI-Thin': ['THICCCBOI-Thin', 'sans-serif'],
      },
    },
  },
  plugins: [],
}