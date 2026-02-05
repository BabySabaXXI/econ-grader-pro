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
        "label-xl": [
          "1.5rem",
          {
            lineHeight: "1.33",
            letterSpacing: "-0.015em",
            fontWeight: "500",
          },
        ],
        "label-lg": [
          "1.125rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.015em",
            fontWeight: "500",
          },
        ],
        "label-md": [
          "1rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.011em",
            fontWeight: "500",
          },
        ],
        "label-sm": [
          "0.875rem",
          {
            lineHeight: "1.4",
            letterSpacing: "-0.006em",
            fontWeight: "500",
          },
        ],
        "label-xs": [
          "0.75rem",
          { lineHeight: "1.33", letterSpacing: "0", fontWeight: "500" },
        ],
        "p-xl": [
          "1.25rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.015em",
            fontWeight: "400",
          },
        ],
        "p-lg": [
          "1.125rem",
          {
            lineHeight: "1.33",
            letterSpacing: "-0.015em",
            fontWeight: "400",
          },
        ],
        "p-md": [
          "1rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.011em",
            fontWeight: "300",
          },
        ],
        "p-sm": [
          "0.875rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.006em",
            fontWeight: "400",
          },
        ],
        "p-xs": [
          "0.75rem",
          { lineHeight: "1.33", letterSpacing: "0", fontWeight: "400" },
        ],
        h3: [
          "2.5rem",
          {
            lineHeight: "1.2",
            letterSpacing: "-0.01em",
            fontWeight: "500",
          },
        ],
        h4: [
          "2.25rem",
          {
            lineHeight: "1.5",
            letterSpacing: "-0.005em",
            fontWeight: "500",
          },
        ],
        h5: [
          "1.75rem",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "700" },
        ],
        h6: [
          "1.25rem",
          { lineHeight: "1.5", letterSpacing: "0", fontWeight: "500" },
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        neura: "0 0 1.25rem 0 rgba(0,0,0,0.03)",
        "neura-md": "0 0 1.25rem 0 rgba(0,0,0,0.06)",
        "neura-lg": "0 4px 2rem 0 rgba(0,0,0,0.08)",
      },
      spacing: {
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "7.5": "1.875rem",
        "9.5": "2.375rem",
        "12.5": "3.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "21": "5.25rem",
        "22": "5.5rem",
        "25": "6.25rem",
        "30": "7.5rem",
        "37.5": "9.375rem",
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
          from: { opacity: "0", transform: "scale(0.96)" },
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
