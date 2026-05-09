export const COLORS = {
  main: "#FF507C",
  sub: "#FFDCE5",
  text: "#000000",
  subText: "#9E9E9E",
  subText2: "#B4B4B4",
  redText: "#EA4335",
  blueText: "#1A48F1",
  charcoal: "#202020",
  gray: "#C7C7C7",
  lightGray: "#EFEFEF",
} as const;

export const TYPOGRAPHY = {
  family: "Pretendard-Variable",
  size: {
    xl: 18,
    lg: 16,
    md: 15,
    sm: 14,
    xs: 12,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export const SPACING = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  screen: 20, // 화면 좌우 여백
} as const;

export const RADIUS = {
  xs: 5,
  md: 10,
  lg: 20,
  xl: 30,
  full: 50,
} as const;

export const BORDER = {
  thin: 0.5,
  base: 1,
  thick: 7,
} as const;
