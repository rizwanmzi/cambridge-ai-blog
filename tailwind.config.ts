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
        dark: {
          bg: "#0a0f1c",
          surface: "#0f1520",
          hover: "#1e293b",
          border: "#1e293b",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#60a5fa",
          glow: "rgba(148, 163, 184, 0.08)",
        },
        txt: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
        },
        // Keep navy for backwards compat / any missed references
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
        heading: ['"Playfair Display"', "Georgia", "serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      animation: {
        "ai-glow": "ai-glow-pulse 2s ease-in-out infinite",
        "ai-glow-loading": "ai-glow-loading 1.2s ease-in-out infinite",
      },
      keyframes: {
        "ai-glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(148, 163, 184, 0.06)",
          },
          "50%": {
            boxShadow: "0 0 18px rgba(148, 163, 184, 0.12)",
          },
        },
        "ai-glow-loading": {
          "0%, 100%": {
            boxShadow: "0 0 10px rgba(148, 163, 184, 0.1)",
          },
          "50%": {
            boxShadow: "0 0 25px rgba(148, 163, 184, 0.2)",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
