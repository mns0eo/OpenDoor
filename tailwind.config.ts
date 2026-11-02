import type { Config } from "tailwindcss";

// OpenDoor design tokens — change brand colors here.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        navy: { DEFAULT: "#14213D", 700: "#1d2d52", 600: "#2a3d68", 50: "#eef1f7" },
        paper: "#FAFAF8",
        sky: { DEFAULT: "#E8F0FE", 200: "#d3e2fc" },
        teal: { DEFAULT: "#4A9D9A", 600: "#3c8582", 50: "#ecf6f5" },
        ink: { DEFAULT: "#242424", muted: "#5f6470", faint: "#8a8f99" },
        line: "#e7e6e1",
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        card: "0 1px 2px rgba(20,33,61,0.04), 0 4px 16px -4px rgba(20,33,61,0.08)",
        lift: "0 2px 4px rgba(20,33,61,0.06), 0 16px 40px -12px rgba(20,33,61,0.18)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(.2,.7,.2,1) both",
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
