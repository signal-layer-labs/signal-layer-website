import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#0f1115",
        panel: "#171a21",
        line: "#2a2f3a",
        ink: "#f3f5f7",
        muted: "#a9b0bc",
        signal: "#7dd3fc",
        field: "#11141a"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0, 0, 0, 0.24)"
      }
    }
  },
  plugins: []
};

export default config;
