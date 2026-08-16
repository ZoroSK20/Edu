import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bone: "#F5F1E8",
        surface: "#FFFFFF",
        ink: "#1B1810",
        "ink-soft": "#6B6558",
        "ink-faint": "#A39C8C",
        border: "#E3DDCF",
        maroon: {
          DEFAULT: "#7A1F2B",
          dark: "#5C1620",
          light: "#F4E7E8",
        },
      },
      borderRadius: {
        card: "12px",
        control: "8px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
