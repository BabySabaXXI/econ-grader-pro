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
        /* Brainwave Neutral Scale */
        n: {
          1: "var(--n-1)",
          2: "var(--n-2)",
          3: "var(--n-3)",
          4: "var(--n-4)",
          5: "var(--n-5)",
          6: "var(--n-6)",
          7: "var(--n-7)",
        },
        /* Brainwave Primary */
        "primary-1": "var(--primary-1)",
        "primary-2": "var(--primary-2)",
        /* Brainwave Accents */
        "accent-1": "var(--accent-1)",
        "accent-2": "var(--accent-2)",
        "accent-3": "var(--accent-3)",
        "accent-4": "var(--accent-4)",
        "accent-5": "var(--accent-5)",
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
        /* Brainwave heading scale */
        h1: [
          "4rem",
          {
            lineHeight: "1.1",
            letterSpacing: "-0.025em",
            fontWeight: "700",
          },
        ],
        h2: [
          "3rem",
          {
            lineHeight: "1.15",
            letterSpacing: "-0.025em",
            fontWeight: "700",
          },
        ],
        h3: [
          "2.5rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
            fontWeight: "700",
          },
        ],
        h4: [
          "1.75rem",
          {
            lineHeight: "1.3",
            letterSpacing: "-0.02em",
            fontWeight: "700",
          },
        ],
        h5: [
          "1.5rem",
          {
            lineHeight: "1.33",
            letterSpacing: "-0.03em",
            fontWeight: "600",
          },
        ],
        h6: [
          "1.125rem",
          {
            lineHeight: "1.4",
            letterSpacing: "-0.03em",
            fontWeight: "600",
          },
        ],
        /* Brainwave body scale */
        body1: [
          "1.5rem",
          { lineHeight: "1.5", letterSpacing: "-0.01em", fontWeight: "400" },
        ],
        body2: [
          "1.0625rem",
          { lineHeight: "1.5", letterSpacing: "-0.005em", fontWeight: "400" },
        ],
        /* Brainwave base scale */
        base1: [
          "1rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.03em",
            fontWeight: "500",
          },
        ],
        base2: [
          "0.875rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
        /* Brainwave caption scale */
        caption1: [
          "0.75rem",
          {
            lineHeight: "1.33",
            letterSpacing: "-0.03em",
            fontWeight: "500",
          },
        ],
        caption2: [
          "0.6875rem",
          {
            lineHeight: "1.33",
            letterSpacing: "-0.01em",
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
        /* Brainwave shadow system */
        "bw-subtle": "0 0.125rem 0.125rem rgba(0,0,0,0.07)",
        "bw-sm":
          "0 0.125rem 0.25rem rgba(0,0,0,0.15)",
        "bw-md":
          "0 0 1rem 0.25rem rgba(0,0,0,0.04), 0 2rem 2rem -1rem rgba(0,0,0,0.1)",
        "bw-lg":
          "0 0.75rem 2.5rem -0.75rem rgba(0,0,0,0.15)",
        "bw-xl":
          "0 1.25rem 1.5rem 0 rgba(0,0,0,0.5)",
        "bw-inset":
          "inset 0 0.25rem 0.125rem #FFFFFF",
        "bw-tab":
          "0 0.125rem 0.125rem rgba(0,0,0,0.07), inset 0 0.25rem 0.125rem #FFFFFF",
        "bw-button":
          "0 0.25rem 1rem rgba(0,132,255,0.25)",
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
        "75": "18.75rem",
        "80": "20rem",
        "90": "22.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up":
          "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-ring": "pulseRing 2s ease-in-out infinite",
        "gradient-flow": "gradientFlow 3s ease infinite",
        float: "float 3s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.3" },
          "50%": { transform: "scale(1.05)", opacity: "0.15" },
          "100%": { transform: "scale(1)", opacity: "0.3" },
        },
        gradientFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
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
        "ease-spring": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
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
