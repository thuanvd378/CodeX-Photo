/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"]
      },
      colors: {
        surface: {
          50: "#f8faf9",
          100: "#eef2f0",
          200: "#dbe3df",
          700: "#32403b",
          800: "#24302c",
          900: "#151d1a"
        }
      }
    }
  },
  plugins: []
};
