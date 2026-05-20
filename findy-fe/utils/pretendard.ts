import { FONT_FAMILY } from "@/constants/theme";
import { Platform, type TextStyle } from "react-native";

export type PretendardWeight = 400 | 500 | 600 | 700;

const STATIC_FAMILY: Record<PretendardWeight, string> = {
  400: FONT_FAMILY.regular,
  500: FONT_FAMILY.medium,
  600: FONT_FAMILY.semibold,
  700: FONT_FAMILY.bold,
};

/**
 * iOS/Android: static Pretendard 파일별 fontFamily (Variable 폰트는 네이티브 미지원)
 * Web: Pretendard Variable + fontWeight
 */
export function pretendard(weight: PretendardWeight = 400): TextStyle {
  if (Platform.OS === "web") {
    return {
      fontFamily: FONT_FAMILY.variable,
      fontWeight: String(weight) as TextStyle["fontWeight"],
    };
  }

  return {
    fontFamily: STATIC_FAMILY[weight],
  };
}
