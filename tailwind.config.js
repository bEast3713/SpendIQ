/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        surface: "#15121b",
        "surface-dim": "#15121b",
        "surface-bright": "#3b3742",
        "surface-container": "#211e27",
        "surface-container-low": "#1d1a23",
        "surface-container-high": "#2c2832",
        "surface-container-highest": "#37333d",
        "surface-glass": "rgba(30, 41, 59, 0.7)",
        "border-glass": "rgba(255, 255, 255, 0.1)",
        primary: "#d0bcff",
        "primary-container": "#a078ff",
        "primary-gradient-end": "#4338CA",
        secondary: "#4cd7f6",
        "secondary-container": "#03b5d3",
        tertiary: "#ffb869",
        "tertiary-container": "#ca801e",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-background": "#e7e0ed",
        "on-surface": "#e7e0ed",
        "on-surface-variant": "#cbc3d7",
        "on-primary": "#3c0091",
        "on-primary-container": "#340080",
        "on-secondary": "#003640",
        "on-secondary-container": "#00424e",
        "text-primary": "#F8FAFC",
        "text-muted": "#94A3B8",
        "accent-negative": "#F43F5E",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      spacing: {
        'container-padding': '24px',
        'stack-lg': '32px',
        'stack-md': '16px',
        'stack-sm': '8px',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
