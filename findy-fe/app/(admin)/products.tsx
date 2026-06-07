import { AdminContentFrame } from "@/components/admin/AdminContentFrame";
import { AdminProductPerformanceList } from "@/components/admin/AdminProductPerformanceList";
import { AdminScrollView } from "@/components/admin/AdminScrollView";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import { getDefaultAdminDateRange } from "@/lib/admin/mockDashboardData";
import { getAdminProductPerformanceMock } from "@/lib/admin/mockProductPerformanceData";
import { useMemo } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminProductsScreen() {
  const insets = useSafeAreaInsets();
  const isWide = useAdminWideLayout();
  const products = useMemo(
    () => getAdminProductPerformanceMock(getDefaultAdminDateRange()),
    [],
  );

  return (
    <AdminScrollView
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24) + (isWide ? 0 : 72),
        flexGrow: 1,
      }}
    >
      <AdminContentFrame>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: isWide ? 24 : Math.max(insets.top, 12) + 8,
            paddingBottom: 24,
          }}
        >
          <AdminProductPerformanceList products={products} stretch={isWide} />
        </View>
      </AdminContentFrame>
    </AdminScrollView>
  );
}
