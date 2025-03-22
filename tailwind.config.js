/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  variants: {
    extend: {
      backgroundColor: ["focus-mode"],
      textColor: ["focus-mode"],
      borderColor: ["focus-mode"],
      opacity: ["focus-mode"],
      animation: ["focus-mode"],
    },
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        // Color blind friendly palettes
        colorblind: {
          // Deuteranopia (red-green color blindness)
          deuteranopia: {
            purple: "#9F7AEA", // More blue-tinted purple
            blue: "#4299E1", // Standard blue
            orange: "#ED8936", // Orange instead of pink
            teal: "#38B2AC", // Teal instead of green
          },
          // Protanopia (red-green color blindness, different from deuteranopia)
          protanopia: {
            blue: "#3182CE", // Darker blue
            yellow: "#ECC94B", // Yellow instead of red/pink
            cyan: "#0BC5EA", // Cyan instead of green
            purple: "#805AD5", // Purple is still distinguishable
          },
          // Tritanopia (blue-yellow color blindness)
          tritanopia: {
            pink: "#ED64A6", // Pink is visible
            red: "#E53E3E", // Red is visible
            green: "#48BB78", // Green is visible but different
            gray: "#718096", // Gray instead of blue
          },
          // Monochromacy (total color blindness)
          monochromacy: {
            dark: "#1A202C", // Very dark gray
            medium: "#4A5568", // Medium gray
            light: "#A0AEC0", // Light gray
            lighter: "#E2E8F0", // Very light gray
          },
        },
        // Focus mode colors - reduced saturation and contrast
        focus: {
          background: {
            light: "#F7FAFC", // Very light gray with slight blue tint
            dark: "#171923", // Very dark gray with slight blue tint
          },
          text: {
            light: "#4A5568", // Medium gray for light mode
            dark: "#A0AEC0", // Light gray for dark mode
          },
          accent: {
            light: "#CBD5E0", // Light gray with slight blue tint
            dark: "#2D3748", // Dark gray with slight blue tint
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // Focus mode styles
      opacity: {
        5: "0.05",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
