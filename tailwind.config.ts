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
        background: "#0c0a14",
        card: "rgba(22, 18, 38, 0.75)",
        surface: "#181329",
        "surface-light": "#251c3f",
        "surface-border": "rgba(255, 255, 255, 0.08)",
        primary: {
          DEFAULT: "#8b5cf6",
          dark: "#7c3aed",
          light: "#a78bfa",
        },
        electric: {
          violet: "#a855f7",
          purple: "#7e22ce",
          pink: "#ec4899",
          orange: "#f97316",
          amber: "#f59e0b",
          cyan: "#06b6d4",
          emerald: "#10b981",
        },
      },
      fontFamily: {
        sans: [
          "Outfit",
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          "Outfit",
          "Clash Display",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(168, 85, 247, 0.4)",
        "glow-pink": "0 0 25px -5px rgba(236, 72, 153, 0.4)",
        "glow-orange": "0 0 25px -5px rgba(249, 115, 22, 0.4)",
        "card-shadow": "0 10px 30px -10px rgba(0, 0, 0, 0.6)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "glow-breathe": "glowBreathe 3s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glowBreathe: {
          "0%": { opacity: "0.4", transform: "scale(0.98)" },
          "100%": { opacity: "0.8", transform: "scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

