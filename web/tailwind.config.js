/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
        display: ['"Instrument Serif"', "Georgia", "serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#6366f1",
          glow: "#818cf8",
        },
        prio: {
          high: "#f43f5e",
          medium: "#71717a",
          low: "#d4d4d8",
        },
        overdue: "#f43f5e",
      },
      boxShadow: {
        card: "0 1px 0 rgba(24, 24, 27, 0.04), 0 4px 16px -4px rgba(24, 24, 27, 0.06)",
        lift: "0 8px 24px -6px rgba(24, 24, 27, 0.12), 0 4px 8px -2px rgba(24, 24, 27, 0.06)",
        glow: "0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 32px -8px rgba(99, 102, 241, 0.35), 0 4px 12px -4px rgba(24, 24, 27, 0.08)",
        ringFocus: "0 0 0 3px rgba(99, 102, 241, 0.18)",
      },
      animation: {
        drift: "drift 24s ease-in-out infinite",
        "pulse-soft": "pulseSoft 5s ease-in-out infinite",
        mesh: "mesh 22s ease-in-out infinite",
        shine: "shine 3.5s ease-in-out infinite",
        "spin-slow": "spin 18s linear infinite",
        float: "float 7s ease-in-out infinite",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "33%": { transform: "translate3d(-2%, -1%, 0)" },
          "66%": { transform: "translate3d(2%, 1%, 0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.7" },
        },
        mesh: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)" },
          "25%": { transform: "translate3d(8%, -6%, 0) rotate(8deg) scale(1.08)" },
          "50%": { transform: "translate3d(-4%, 8%, 0) rotate(-6deg) scale(0.96)" },
          "75%": { transform: "translate3d(6%, 4%, 0) rotate(4deg) scale(1.04)" },
        },
        shine: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(2deg)" },
        },
      },
    },
  },
  plugins: [],
};
