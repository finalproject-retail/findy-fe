import { ADMIN_LAYOUT } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import { type PropsWithChildren } from "react";
import { View } from "react-native";

/** 스크롤 영역은 전체 너비, 본문만 maxWidth로 가운데 정렬 */
export function AdminContentFrame({ children }: PropsWithChildren) {
  const isWide = useAdminWideLayout();

  if (!isWide) {
    return <>{children}</>;
  }

  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <View style={{ width: "100%", maxWidth: ADMIN_LAYOUT.contentMaxWidth }}>
        {children}
      </View>
    </View>
  );
}
