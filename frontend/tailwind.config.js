/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          white: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.12)",
          hover: "rgba(255,255,255,0.14)",
          card: "rgba(255,255,255,0.06)",
        },
        crime: {
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#06b6d4",
          danger: "#ef4444",
          warning: "#f59e0b",
          success: "#10b981",
          dark: "#0a0f1e",
          darker: "#060b14",
        }
      },
      backdropBlur: {
        glass: "20px",
        heavy: "40px",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        glow: "0 0 20px rgba(99,102,241,0.4)",
        "glow-danger": "0 0 20px rgba(239,68,68,0.4)",
        "glow-success": "0 0 20px rgba(16,185,129,0.4)",
      },
      animation: {
        "pulse-slow": "pulse 3s infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "marquee": "marquee 35s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        glow: {
          "from": { boxShadow: "0 0 10px rgba(99,102,241,0.3)" },
          "to": { boxShadow: "0 0 25px rgba(99,102,241,0.7)" }
        },
        slideUp: {
          "from": { opacity: 0, transform: "translateY(20px)" },
          "to": { opacity: 1, transform: "translateY(0)" }
        },
        slideInRight: {
          "from": { opacity: 0, transform: "translateX(100%)" },
          "to": { opacity: 1, transform: "translateX(0)" }
        },
        fadeIn: {
          "from": { opacity: 0 },
          "to": { opacity: 1 }
        },
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" }
        }
      }
    },
  },
  plugins: [],
}
