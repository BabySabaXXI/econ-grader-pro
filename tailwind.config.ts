import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* shadcn bridge */
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        /* Japandi Neutral Scale */
        n: {
          1: "var(--n-1)",
          2: "var(--n-2)",
          3: "var(--n-3)",
          4: "var(--n-4)",
          5: "var(--n-5)",
          6: "var(--n-6)",
          7: "var(--n-7)",
        },
        /* Primary */
        "primary-1": "var(--primary-1)",
        "primary-2": "var(--primary-2)",
      },
      fontFamily: {
        satoshi: ["var(--font-satoshi)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        "inter-display": [
          "var(--font-inter-display)",
          "var(--font-inter)",
          "system-ui",
          "sans-serif",
        ],
        sans: [
          "var(--font-satoshi)",
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        /* Heading scale — lighter weights for Japandi */
        h1: [
          "3.5rem",
          {
            lineHeight: "1.1",
            letterSpacing: "-0.03em",
            fontWeight: "300",
          },
        ],
        h2: [
          "2.5rem",
          {
            lineHeight: "1.15",
            letterSpacing: "-0.025em",
            fontWeight: "300",
          },
        ],
        h3: [
          "2rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
            fontWeight: "400",
          },
        ],
        h4: [
          "1.5rem",
          {
            lineHeight: "1.3",
            letterSpacing: "-0.02em",
            fontWeight: "400",
          },
        ],
        h5: [
          "1.25rem",
          {
            lineHeight: "1.4",
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
        h6: [
          "1.0625rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
        /* Body scale */
        body1: [
          "1.125rem",
          { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        body2: [
          "1rem",
          { lineHeight: "1.6", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        /* Base scale */
        base1: [
          "0.9375rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.01em",
            fontWeight: "500",
          },
        ],
        base2: [
          "0.875rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.01em",
            fontWeight: "400",
          },
        ],
        /* Caption scale */
        caption1: [
          "0.75rem",
          {
            lineHeight: "1.4",
            letterSpacing: "-0.01em",
            fontWeight: "500",
          },
        ],
        caption2: [
          "0.6875rem",
          {
            lineHeight: "1.4",
            letterSpacing: "0em",
            fontWeight: "500",
          },
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        /* Japandi shadow system — barely visible */
        "jp-subtle": "0 1px 2px rgba(0,0,0,0.03)",
        "jp-sm": "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        "jp-md": "0 4px 12px -2px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.02)",
        "jp-lg": "0 8px 24px -8px rgba(0,0,0,0.08)",
        "jp-xl": "0 12px 40px -12px rgba(0,0,0,0.12)",
        "jp-inset": "inset 0 1px 2px rgba(0,0,0,0.04)",
      },
      spacing: {
        "0.75": "0.1875rem",
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "6.5": "1.625rem",
        "7.5": "1.875rem",
        "9.5": "2.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "25": "6.25rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "58": "14.5rem",
        "65": "16.25rem",
        "72": "18rem",
        "80": "20rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        "slide-up": "slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) backwards",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-ring": "pulseRing 3s ease-in-out infinite",
        "gradient-flow": "gradientFlow 4s ease infinite",
        float: "float 4s ease-in-out infinite",
        breathe: "breathe 3s ease-in-out infinite",
        "gentle-pulse": "gentlePulse 4s ease-in-out infinite",
        "accordion-down": "accordion-down 0.25s ease-out",
        "accordion-up": "accordion-up 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.15" },
          "50%": { transform: "scale(1.03)", opacity: "0.08" },
          "100%": { transform: "scale(1)", opacity: "0.15" },
        },
        gradientFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        gentlePulse: {
          "0%, 100%": { opacity: "0.3", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.02)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      transitionTimingFunction: {
        "ease-natural": "cubic-bezier(0.22, 1, 0.36, 1)",
        "ease-spring": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
