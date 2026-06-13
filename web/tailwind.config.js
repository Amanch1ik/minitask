/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
      },
      colors: {
        accent: {
          DEFAULT: "#0a0a0a",
          fg: "#ffffff",
        },
        // Status accents — used sparingly, as small dots and borders only.
        todo: "#71717a",
        progress: "#3b82f6",
        done: "#10b981",
        // Priority dot palette
        prio: {
          high: "#ef4444",
          medium: "#71717a",
          low: "#d4d4d8",
        },
        overdue: "#ef4444",
      },
      boxShadow: {
        // No drop shadows for cards; use borders instead. Keep one focus ring.
        focus: "0 0 0 3px rgba(10, 10, 10, 0.08)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
