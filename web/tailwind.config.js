/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#f8f4ee",
          dark: "#ede8e0",
          deeper: "#e2dccf",
        },
        charcoal: {
          DEFAULT: "#2d2620",
          soft: "#5a5048",
          mute: "#8a7f73",
        },
        teal: {
          DEFAULT: "#14b8a6",
          soft: "#1fc8b3",
          dim: "#0d8a7c",
        },
        amber: {
          DEFAULT: "#ea8c33",
          soft: "#f29b4d",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Manrope"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      fontSize: {
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.22em" }],
      },
      borderRadius: {
        card: "12px",
        chip: "8px",
      },
      boxShadow: {
        soft: "0 1px 4px rgba(45, 38, 32, 0.06)",
        card: "0 2px 20px rgba(45, 38, 32, 0.08)",
        glow: "0 0 30px rgba(20, 184, 166, 0.25)",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
