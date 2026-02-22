import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0f14",
        slate: "#111827",
        mist: "#e6e8ec",
        aurora: "#c6f6d5",
        ember: "#f9c0a6",
        ocean: "#cbe4ff",
        graphite: "#1f2937",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(148, 163, 184, 0.12), 0 18px 40px rgba(15, 23, 42, 0.18)",
      },
      borderRadius: {
        xl: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
