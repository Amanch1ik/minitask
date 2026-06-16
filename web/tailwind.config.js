/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        display: ['"Inter Tight"', '"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        // Asana-style palette
        asana: {
          coral: "#f06a6a",
          "coral-dark": "#e15a5a",
          "coral-soft": "#fde4e4",
          ink: "#1e1f21",
          muted: "#6d6e6f",
          subtle: "#9ca0a3",
          border: "#e8e8e9",
          "border-strong": "#d6d7d8",
          surface: "#ffffff",
          bg: "#fafafa",
          "side-bg": "#f6f5f3",
          "side-hover": "#edebe7",
          "side-active": "#e2dfd8",
        },
        prio: {
          high: "#f06a6a",
          medium: "#f59e0b",
          low: "#9ca0a3",
        },
        // Section dot palette — Asana style rainbow chips
        chip: {
          red: "#f87171",
          orange: "#fb923c",
          amber: "#f59e0b",
          green: "#10b981",
          teal: "#14b8a6",
          blue: "#60a5fa",
          indigo: "#818cf8",
          violet: "#a78bfa",
          pink: "#f472b6",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(30, 31, 33, 0.04), 0 0 0 1px rgba(30, 31, 33, 0.04)",
        lift: "0 4px 12px -2px rgba(30, 31, 33, 0.08), 0 0 0 1px rgba(30, 31, 33, 0.05)",
        focus: "0 0 0 3px rgba(240, 106, 106, 0.18)",
      },
    },
  },
  plugins: [],
};
