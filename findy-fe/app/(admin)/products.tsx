import { AdminContentFrame } from "@/components/admin/AdminContentFrame";
import { AdminProductPerformanceList } from "@/components/admin/AdminProductPerformanceList";
import { AdminScrollView } from "@/components/admin/AdminScrollView";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminProductPerformanceList } from "@/hooks/useAdminProductPerformanceList";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import { getDefaultAdminDateRange } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminProductsScreen() {
  const insets = useSafeAreaInsets();
  const isWide = useAdminWideLayout();
  const dateRange = getDefaultAdminDateRange();
  const { products, isLoading, error, reload } = useAdminProductPerformanceList(dateRange);

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
          {isLoading ? (
            <View style={{ paddingVertical: 80, alignItems: "center" }}>
              <ActivityIndicator color={ADMIN_COLORS.navActive} />
            </View>
          ) : error ? (
            <View style={{ paddingVertical: 48, alignItems: "center", gap: 12 }}>
              <Text style={{ ...pretendard(500), fontSize: 14, color: ADMIN_COLORS.navyMuted }}>
                {error}
              </Text>
              <Pressable onPress={() => void reload()}>
                <Text style={{ ...pretendard(600), fontSize: 14, color: ADMIN_COLORS.navActive }}>
                  다시 시도
                </Text>
              </Pressable>
            </View>
          ) : (
            <AdminProductPerformanceList products={products} stretch={isWide} />
          )}
        </View>
      </AdminContentFrame>
    </AdminScrollView>
  );
}
