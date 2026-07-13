import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        mint: "#5eead4",
        coral: "#fb7185",
        sky: "#38bdf8",
        gold: "#d6a642"
      },
      boxShadow: {
        glow: "0 24px 80px rgb(var(--color-glow) / 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
