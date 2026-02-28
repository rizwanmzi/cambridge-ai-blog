import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f3f9",
          100: "#d9e0ed",
          200: "#b3c1db",
          300: "#8da2c9",
          400: "#6783b7",
          500: "#4a6a9b",
          600: "#3a5278",
          700: "#2a3d5a",
          800: "#1a2740",
          900: "#0f1b2d",
          950: "#080e18",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#1a2740",
            h1: { color: "#0f1b2d" },
            h2: { color: "#0f1b2d" },
            h3: { color: "#0f1b2d" },
            strong: { color: "#0f1b2d" },
            a: { color: "#4a6a9b", textDecoration: "underline" },
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
