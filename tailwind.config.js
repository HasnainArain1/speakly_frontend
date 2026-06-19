/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          dark: '#3730A3',
          light: '#818CF8',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',

        // Page background
        page: '#F5F5FA',

        // Sidebar stays dark — this is the ONLY dark element
        sidebar: '#0F0A2E',

        // Existing color placeholders/names for compatibility
        "surface-container-highest": "#e5deff",
        "background": "#fcf8ff",
        "bg-lavender": "#F5F3FF",
        "surface-container-lowest": "#ffffff",
        "outline": "#777587",
        "tertiary-container": "#862dd4",
        "surface-dim": "#dcd5ff",
        "secondary": "#712ae2",
        "error-container": "#ffdad6",
        "tertiary": "#6b00b7",
        "surface-tint": "#4d44e3",
        "surface-container-high": "#eae5ff",
        "sidebar-text": "#C4B5FD",
        "on-surface-variant": "#464555",
        "secondary-container": "#8a4cfc",
        "on-primary-container": "#dad7ff",
        "error": "#ba1a1a",
        "primary-container": "#4f46e5",
        "surface": "#fcf8ff",
        "on-background": "#1b163a",
        "surface-container-low": "#f6f1ff",
        "surface-variant": "#e5deff",
        "on-surface": "#1b163a",
        "outline-variant": "#c7c4d8",
        "surface-white": "#FFFFFF",
        "surface-container": "#f0ebff",
        "sidebar-bg": "#0F0A2E",
        surface: {
          base: '#F5F5FA',
          card: '#FFFFFF',
          cardHover: '#F9FAFB',
          border: '#F3F4F6',
        },
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        "sidebar-width": "280px",
        "gutter": "24px",
        "section-gap": "48px",
        "card-padding": "32px",
        base: "4px",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      fontSize: {
        "hero-display": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }],
      },
      boxShadow: {
        card: "0 4px 24px rgba(79, 70, 229, 0.08)",
        "card-hover": "0 8px 32px rgba(79, 70, 229, 0.15)",
      },
      animation: {
        "slide-up": "slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        pulse: "pulse 2s infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulse: {
          "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(79, 70, 229, 0.4)" },
          "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(79, 70, 229, 0)" },
          "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(79, 70, 229, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};