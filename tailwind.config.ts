import type { Config } from "tailwindcss";

const config: Config = {
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
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
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
        // Claude-style semantic colors
        bg: {
          "0": "var(--bg-0)",
          "000": "var(--bg-000)",
          "100": "var(--bg-100)",
          "200": "var(--bg-200)",
          "300": "var(--bg-300)",
        },
        text: {
          "100": "var(--text-100)",
          "200": "var(--text-200)",
          "300": "var(--text-300)",
          "400": "var(--text-400)",
          "500": "var(--text-500)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "Onest",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "Source Serif 4",
          "Georgia",
          "serif",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        "claude-sm": "0 1px 2px -1px rgba(0, 0, 0, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)",
        "claude": "0 0 15px rgba(0, 0, 0, 0.08)",
        "claude-md": "0 0 20px rgba(0, 0, 0, 0.12)",
        "claude-lg": "0 0 25px rgba(0, 0, 0, 0.15)",
        "claude-focus": "0 0 0 2px rgba(217, 119, 87, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.08)",
        // Legacy zen shadows for compatibility
        "zen-sm": "0 1px 3px -1px rgba(31, 30, 29, 0.04)",
        zen: "0 2px 8px -2px rgba(31, 30, 29, 0.06)",
        "zen-md": "0 4px 16px -4px rgba(31, 30, 29, 0.08)",
        "zen-lg": "0 8px 30px -8px rgba(31, 30, 29, 0.12)",
        "zen-xl": "0 16px 50px -12px rgba(31, 30, 29, 0.16)",
      },
      animation: {
        // Claude-style animations - smooth, deliberate
        "fade-in": "fadeIn 0.4s cubic-bezier(0.2, 0, 0, 1) forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "slide-down": "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "spin-slow": "spin 2s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "breathe": "breathe 3s ease-in-out infinite",
        "blink": "blink 1.5s infinite",
        // Legacy zen animations
        "zen-fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "zen-slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "zen-slide-down": "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards",
        "zen-scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "zen-spin": "spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "zen-pulse": "pulseSoft 2s ease-in-out infinite",
        "zen-progress": "progress 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "zen-float": "float 4s ease-in-out infinite",
        "zen-breathe": "breathe 3s ease-in-out infinite",
        "zen-ripple": "ripple 0.6s ease-out forwards",
        progress: "progress 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px) scale(0.98)", filter: "blur(4px)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)", filter: "blur(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        progress: {
          from: { width: "0%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.7" },
        },
        ripple: {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        blink: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.8" },
        },
      },
      transitionTimingFunction: {
        "silk": "cubic-bezier(0.2, 0, 0, 1)",
        "bounce-soft": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "zen-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
        "zen-bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
