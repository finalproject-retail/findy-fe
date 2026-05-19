/** @type {import('tailwindcss').Config} */

const {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  BORDER,
} = require("./constants/theme");

module.exports = {
  content: [  
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        main: COLORS.main,
        sub: COLORS.sub,
        white: COLORS.white,
        "text-main": COLORS.text,
        "text-sub": COLORS.subText,
        "text-sub2": COLORS.subText2,
        "text-red": COLORS.redText,
        "text-blue": COLORS.blueText,
        charcoal: COLORS.charcoal,
        gray: COLORS.gray,
        "light-gray": COLORS.lightGray,
      },
      fontFamily: {
        pretendard: [TYPOGRAPHY.family],
      },
      fontSize: {
        xl: [`${TYPOGRAPHY.size.xl}px`, "26px"],
        lg: [`${TYPOGRAPHY.size.lg}px`, "24px"],
        md: [`${TYPOGRAPHY.size.md}px`, "22px"],
        sm: [`${TYPOGRAPHY.size.sm}px`, "20px"],
        xs: [`${TYPOGRAPHY.size.xs}px`, "18px"],
      },
      fontWeight: {
        regular: TYPOGRAPHY.weight.regular,
        medium: TYPOGRAPHY.weight.medium,
        semibold: TYPOGRAPHY.weight.semibold,
        bold: TYPOGRAPHY.weight.bold,
      },
      spacing: {
        xs: `${SPACING.xs}px`,
        sm: `${SPACING.sm}px`,
        md: `${SPACING.md}px`,
        lg: `${SPACING.lg}px`,
        xl: `${SPACING.xl}px`,
        screen: `${SPACING.screen}px`,
      },
      borderRadius: {
        xs: `${RADIUS.xs}px`,
        md: `${RADIUS.md}px`,
        lg: `${RADIUS.lg}px`,
        xl: `${RADIUS.xl}px`,
        full: `${RADIUS.full}px`,
      },
      borderWidth: {
        thin: `${BORDER.thin}px`,
        base: `${BORDER.base}px`,
        thick: `${BORDER.thick}px`,
      },
    },
  },
  plugins: [],
};
