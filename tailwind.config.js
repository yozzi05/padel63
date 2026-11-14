/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: { nav: "1180px" },
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        line: "var(--line)",
        ink: "var(--text)",
        muted: "var(--text-muted)",
        lime: "#C9F51A",
        court: "#2F5BEA",
        busy: "var(--busy)",
        night: "#0C0D0A",
        accent: "var(--accent-ink)",
      },
      fontFamily: {
        display: ["Ruble", '"Sofia Sans Extra Condensed"', "Impact", "sans-serif"],
        sans: ["Geologica", "system-ui", "sans-serif"],
        mono: ['"Martian Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
