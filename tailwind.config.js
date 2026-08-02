/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["CormorantGaramond_600SemiBold"],
        "display-bold": ["CormorantGaramond_700Bold"],
        "display-medium": ["CormorantGaramond_500Medium"],
        sans: ["DMSans_400Regular"],
        "sans-medium": ["DMSans_500Medium"],
        "sans-semi": ["DMSans_600SemiBold"],
        "sans-bold": ["DMSans_700Bold"],
      },
      colors: {
        forest: {
          50: "#f2f7f4",
          100: "#e0ebe4",
          200: "#c2d7cb",
          500: "#3d6b52",
          700: "#2a4a39",
          900: "#1a2f25",
          950: "#0f1a15",
        },
        sand: {
          50: "#f3efe6",
          100: "#ebe4d4",
          200: "#ddd2bc",
          500: "#c4a574",
        },
        gold: {
          400: "#d4a84b",
          500: "#b8892e",
        },
      },
    },
  },
  plugins: [],
};
