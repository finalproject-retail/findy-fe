import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import { getDefaultAdminDateRange, type AdminDateRange } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminProductsScreen() {
  const insets = useSafeAreaInsets();
  const isWide = useAdminWideLayout();
  const [dateRange, setDateRange] = useState<AdminDateRange>(getDefaultAdminDateRange);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: ADMIN_COLORS.pageBg }}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24) + (isWide ? 0 : 72),
        flexGrow: 1,
      }}
    >
      <AdminHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showTitle={!isWide}
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ ...pretendard(600), fontSize: 16, color: ADMIN_COLORS.navyMuted }}>
          상품 별 성과 화면은 준비 중입니다.
        </Text>
      </View>
    </ScrollView>
  );
}
