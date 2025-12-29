import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
      },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Emotion colors
        emotion: {
          calm: "hsl(var(--emotion-calm))",
          energy: "hsl(var(--emotion-energy))",
          growth: "hsl(var(--emotion-growth))",
          focus: "hsl(var(--emotion-focus))",
          joy: "hsl(var(--emotion-joy))",
          strength: "hsl(var(--emotion-strength))",
        },
        // Category colors
        personal: {
          DEFAULT: "hsl(var(--personal))",
          light: "hsl(var(--personal-light))",
        },
        professional: {
          DEFAULT: "hsl(var(--professional))",
          light: "hsl(var(--professional-light))",
        },
        fitness: {
          DEFAULT: "hsl(var(--fitness))",
          light: "hsl(var(--fitness-light))",
        },
        // Score levels
        score: {
          seed: "hsl(var(--score-seed))",
          build: "hsl(var(--score-build))",
          rise: "hsl(var(--score-rise))",
          flow: "hsl(var(--score-flow))",
          mastery: "hsl(var(--score-mastery))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
        "4xl": "calc(var(--radius) + 24px)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        glow: "var(--shadow-glow)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        personal: "var(--shadow-personal)",
        professional: "var(--shadow-professional)",
        fitness: "var(--shadow-fitness)",
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom, 0)",
        "safe-top": "env(safe-area-inset-top, 0)",
        "18": "4.5rem",
        "22": "5.5rem",
      },
      minHeight: {
        "touch": "44px",
        "screen-safe": "calc(100vh - env(safe-area-inset-bottom, 0))",
      },
      minWidth: {
        "touch": "44px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px -5px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 30px -5px hsl(var(--primary) / 0.5)" },
        },
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "progress-ring": {
          from: { strokeDashoffset: "314" },
          to: { strokeDashoffset: "var(--progress)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "slide-down": "slide-down 0.6s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite linear",
        "glow": "glow 2s ease-in-out infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "progress-ring": "progress-ring 1s ease-out forwards",
      },
      backgroundImage: {
        "gradient-personal": "var(--gradient-personal)",
        "gradient-professional": "var(--gradient-professional)",
        "gradient-fitness": "var(--gradient-fitness)",
        "gradient-momentum": "var(--gradient-momentum)",
        "gradient-warm": "var(--gradient-warm)",
        "gradient-calm": "var(--gradient-calm)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;