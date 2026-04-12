/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FFC107",
          hover: "#E6AC00",
          light: "#FFF8E1",
        },
        brand: {
          black: "#000000",
          gray: "#6C757D",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        heading: ["28px", { fontWeight: "700" }],
        subheading: ["20px", { fontWeight: "500" }],
        body: ["16px", { fontWeight: "400" }],
        small: ["14px", { fontWeight: "400" }],
      },
      height: {
        btn: "44px",
        input: "44px",
      },
      borderRadius: {
        btn: "8px",
        input: "6px",
      },
    },
  },
  plugins: [],
};
