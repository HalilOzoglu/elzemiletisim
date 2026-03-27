import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: { "1": "hsl(var(--chart-1))", "2": "hsl(var(--chart-2))", "3": "hsl(var(--chart-3))", "4": "hsl(var(--chart-4))", "5": "hsl(var(--chart-5))" },
        navy: { 900: "#0a0f1e", 800: "#0d1526", 700: "#111d35", 600: "#162444" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      keyframes: {
        "modal-in": { "0%": { opacity: "0", transform: "scale(0.95) translateY(-8px)" }, "100%": { opacity: "1", transform: "scale(1) translateY(0)" } },
        "modal-out": { "0%": { opacity: "1", transform: "scale(1)" }, "100%": { opacity: "0", transform: "scale(0.95)" } },
        "fade-in": { "0%": { opacity: "0", transform: "translateY(4px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "skeleton-pulse": { "0%, 100%": { opacity: "0.4" }, "50%": { opacity: "0.8" } },
      },
      animation: {
        "modal-in": "modal-in 150ms ease-out",
        "modal-out": "modal-out 100ms ease-in",
        "fade-in": "fade-in 200ms ease-out",
        "skeleton-pulse": "skeleton-pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
