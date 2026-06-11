/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#009F5A",
          primaryPressed: "#00844A",
          accent: "#16A34A",
        },
        surface: {
          page: "#F6F8FB",
          card: "#FFFFFF",
          muted: "#F2F4F7",
        },
        text: {
          primary: "#101828",
          secondary: "#475467",
          muted: "#667085",
          inverse: "#FFFFFF",
        },
        border: {
          subtle: "#E4E7EC",
          strong: "#D0D5DD",
        },
        status: {
          success: "#2F9B65",
          error: "#F14141",
        },
      },
      spacing: {
        18: "72px",
      },
      borderRadius: {
        "4xl": "28px",
      },
      fontFamily: {
        quicksand: ["Quicksand-Regular", "sans-serif"],
        "quicksand-bold": ["Quicksand-Bold", "sans-serif"],
        "quicksand-semibold": ["Quicksand-SemiBold", "sans-serif"],
        "quicksand-light": ["Quicksand-Light", "sans-serif"],
        "quicksand-medium": ["Quicksand-Medium", "sans-serif"],
      },
    },
  },
  plugins: [],
};
