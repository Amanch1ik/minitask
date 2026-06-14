/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Editorial-Medical (vault: Design/visual-direction). Manrope for UI,
        // Fraunces for display headings, JetBrains Mono for eyebrows/labels.
        sans: ['"Manrope"', "system-ui", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
      },
      colors: {
        // --- Editorial-Medical palette (clean semantic tokens) ---
        cream: "#f8f4ee",
        "cream-deep": "#f1ebe1",
        "cream-dark": "#e9e2d6",
        charcoal: "#2d2620",
        teal: "#14b8a6",
        "teal-dark": "#0f9d8f",
        "teal-soft": "#d8f1ed",
        amber: "#ea8c33",
        "amber-soft": "#faecd9",
        clay: "#c2564e", // functional danger / overdue / high priority
        "clay-soft": "#f6e0dd",

        // --- Legacy `asana-*` keys remapped onto the editorial palette, so the
        // screens not yet rewritten pick up the new direction with no churn. ---
        asana: {
          coral: "#14b8a6", // accent → teal
          "coral-dark": "#0f9d8f",
          "coral-soft": "#d8f1ed",
          ink: "#2d2620", // charcoal
          muted: "#6f6557",
          subtle: "#9c9384",
          border: "#e9e2d6",
          "border-strong": "#ddd4c4",
          surface: "#ffffff",
          bg: "#f8f4ee",
          "side-bg": "#f1ebe1",
          "side-hover": "#eae2d5",
          "side-active": "#e1d8c8",
        },
        prio: {
          high: "#c2564e",
          medium: "#ea8c33",
          low: "#9c9384",
        },
        chip: {
          subtle: "#9c9384",
          amber: "#ea8c33",
          teal: "#14b8a6",
        },
      },
      borderRadius: {
        // Concentric scale (vault: outer elements larger than inner).
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        // Warm, charcoal-tinted shadows — never neutral grey (vault rule).
        card: "0 1px 4px rgba(45, 38, 32, 0.06)",
        lift: "0 2px 20px rgba(45, 38, 32, 0.10)",
        drag: "0 18px 40px -12px rgba(45, 38, 32, 0.28)",
        column: "0 1px 0 rgba(255,255,255,0.6) inset, 0 2px 12px -6px rgba(45,38,32,0.08)",
        focus: "0 0 0 3px rgba(20, 184, 166, 0.20)",
        teal: "0 0 30px rgba(20, 184, 166, 0.25)",
        "teal-lg": "0 0 44px rgba(20, 184, 166, 0.38)",
      },
      keyframes: {
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
