/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { COLORS } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const Colors = {
  light: {
    text: COLORS.text,
    background: COLORS.white,
    tint: COLORS.main,
    icon: COLORS.subText,
    tabIconDefault: COLORS.subText,
    tabIconSelected: COLORS.main,
  },
  dark: {
    text: COLORS.white,
    background: COLORS.charcoal,
    tint: COLORS.main,
    icon: COLORS.subText,
    tabIconDefault: COLORS.subText,
    tabIconSelected: COLORS.main,
  },
} as const;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
