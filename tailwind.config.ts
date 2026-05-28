import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#0f0f0f",
          yellow: "#F5C518",
          card: "#1a1a1a",
          border: "#2a2a2a",
          muted: "#888888",
        },
      },
    },
  },
  plugins: [],
};

export default config;
