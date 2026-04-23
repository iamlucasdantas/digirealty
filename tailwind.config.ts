import type { Config } from "tailwindcss";

// ──────────────────────────────────────────────────────────────
// Design system · The Aesthetics Atlas v2
// Warm, editorial, low-saturation. Cream body, clay CTA, cocoa
// on the dark contact block. Zero fuchsia/magenta — the old brand
// palette skewed "marketplace", this one skews "quiet magazine".
// ──────────────────────────────────────────────────────────────
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bone:  "#FBF7F1",
        cream: "#F5EFE8",
        sand:  "#EFE6DA",

        blush: {
          50:  "#FDF6F1",
          100: "#FAE9DE",
          200: "#F4D4C0",
          300: "#ECBCA0",
          400: "#E0A684",
        },

        clay: {
          50:  "#FAEFE7",
          100: "#F1DCCB",
          200: "#E5C1A7",
          300: "#D6A584",
          400: "#CC8B68",
          500: "#BE7955",
          600: "#A36446",
          700: "#85523A",
          800: "#5F3C2B",
          900: "#3E271C",
        },

        cocoa: {
          50:  "#F4ECE4",
          100: "#E5D6C7",
          200: "#C4A387",
          400: "#7A5740",
          600: "#4A3525",
          700: "#3A2A1F",
          800: "#2E2118",
          900: "#231911",
        },

        ink: {
          DEFAULT: "#2B1D14",
          muted:   "#7A6A5F",
          faint:   "#B0A192",
          onDark:  "#F5EFE8",
        },

        // Keep `brand.*` as an alias of `clay.*` so existing class
        // names (bg-brand-600, text-brand-700, etc.) keep working
        // during the rollout. All new code should prefer `clay.*`.
        brand: {
          DEFAULT: "#BE7955",
          50:  "#FAEFE7",
          100: "#F1DCCB",
          200: "#E5C1A7",
          300: "#D6A584",
          400: "#CC8B68",
          500: "#BE7955",
          600: "#A36446",
          700: "#85523A",
          800: "#5F3C2B",
          900: "#3E271C",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      container: {
        center: true,
        padding: { DEFAULT: "1.25rem", md: "2rem", lg: "3rem" },
        screens: { "2xl": "1200px" },
      },
      letterSpacing: {
        eyebrow: "0.18em",
      },
      boxShadow: {
        soft: "0 2px 20px -8px rgba(94, 55, 35, 0.18)",
        card: "0 8px 32px -12px rgba(94, 55, 35, 0.18)",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
