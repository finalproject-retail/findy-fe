import { ADMIN_COLORS } from "@/constants/adminTheme";
import { Platform, ScrollView, type ScrollViewProps, type ViewStyle } from "react-native";

type AdminScrollViewProps = ScrollViewProps;

/** 웹 ScrollView에 스크롤바 gutter를 고정해 가로 레이아웃 밀림 방지 */
export function getAdminWebScrollStyle(): ViewStyle {
  if (Platform.OS !== "web") return {};

  return {
    overflowY: "scroll",
    scrollbarGutter: "stable",
  } as ViewStyle;
}

/** 웹에서 스크롤바 유무에 따라 가로 레이아웃이 밀리지 않도록 gutter를 고정 */
export function AdminScrollView({ style, ...props }: AdminScrollViewProps) {
  return (
    <ScrollView
      {...props}
      style={[
        {
          flex: 1,
          backgroundColor: ADMIN_COLORS.pageBg,
          ...getAdminWebScrollStyle(),
        },
        style,
      ]}
    />
  );
}
