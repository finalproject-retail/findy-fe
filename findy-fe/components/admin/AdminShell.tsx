import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import { type PropsWithChildren } from "react";
import { View } from "react-native";
import { AdminSidebar, AdminTabBar } from "./AdminNavigation";

export function AdminShell({ children }: PropsWithChildren) {
  const isWide = useAdminWideLayout();

  if (isWide) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "stretch",
          backgroundColor: ADMIN_COLORS.pageBg,
        }}
      >
        <AdminSidebar />
        <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
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
