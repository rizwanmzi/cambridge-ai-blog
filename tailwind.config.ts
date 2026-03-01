import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0A0A0A",
          surface: "#111111",
          hover: "rgba(255,255,255,0.03)",
          border: "rgba(255,255,255,0.08)",
        },
        accent: {
          DEFAULT: "#ffffff",
          blue: "#3b82f6",
        },
        ai: {
          indigo: "rgba(99,102,241,0.5)",
        },
        txt: {
          primary: "rgba(255,255,255,0.9)",
          secondary: "rgba(255,255,255,0.5)",
          tertiary: "rgba(255,255,255,0.3)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
