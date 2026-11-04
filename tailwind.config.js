/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        pixel: ["var(--font-pixel)"],
      },
      maxWidth: {
        wrap: "1200px",
      },
      colors: {
        gold: "rgb(246 189 0 / <alpha-value>)",
        "gold-soft": "var(--gold-soft)",
        "gold-line": "var(--gold-line)",
        emerald: "rgb(91 210 138 / <alpha-value>)",
        danger: "rgb(239 98 98 / <alpha-value>)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        ink: "rgb(245 245 243 / <alpha-value>)",
        "ink-muted": "var(--muted)",
        "ink-dim": "var(--dim)",
        "surface-0": "rgb(9 10 12 / <alpha-value>)",
        "surface-1": "rgb(17 19 22 / <alpha-value>)",
        "surface-2": "rgb(25 28 32 / <alpha-value>)",
        "surface-3": "rgb(32 35 40 / <alpha-value>)",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        minecraft: {
          yellow: "hsl(var(--minecraft-yellow))",
          green: "hsl(var(--minecraft-green))",
          brown: "hsl(var(--minecraft-brown))",
          dark: "hsl(var(--minecraft-dark))",
          darker: "hsl(var(--minecraft-darker))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

