import { ADMIN_COLORS, ADMIN_LAYOUT } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import { type PropsWithChildren } from "react";
import { View } from "react-native";
import { AdminSidebar, AdminTabBar } from "./AdminNavigation";

export function AdminShell({ children }: PropsWithChildren) {
  const isWide = useAdminWideLayout();

  if (isWide) {
    return (
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: ADMIN_COLORS.pageBg }}>
        <AdminSidebar />
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ flex: 1, width: "100%", maxWidth: ADMIN_LAYOUT.contentMaxWidth }}>
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: ADMIN_COLORS.pageBg }}>
      <View style={{ flex: 1 }}>{children}</View>
      <AdminTabBar />
    </View>
  );
}
