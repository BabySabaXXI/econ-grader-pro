import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brown: {
          50: "#faf9f7",
          100: "#f5f3f0",
          200: "#e8e4de",
          300: "#d4cdc3",
          400: "#b5a999",
          500: "#8B7355",
          600: "#6B5A4D",
          700: "#574a40",
          800: "#483d35",
          900: "#3d342e",
          950: "#2c2825",
        },
        accent: "#A67C52",
        background: "#faf9f7",
        foreground: "#2c2825",
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
