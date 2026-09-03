/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        khmer: ["'Noto Sans Khmer'", "sans-serif"],
        sans: ["'Noto Sans Khmer'", "sans-serif"],
      },
      colors: {
        dark: {
          950: "#060911",
          900: "#0B0F19",
          850: "#0F1626",
          800: "#131C31",
          700: "#1E293B",
          600: "#334155",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        purple: {
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
        },
        emerald: {
          500: "#10b981",
          600: "#059669",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "tech-grid": "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(139, 92, 246, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};
