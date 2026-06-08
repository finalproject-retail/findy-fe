import { AdminProductDetailContent } from "@/components/admin/AdminProductDetailContent";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminProductPerformanceDetail } from "@/hooks/useAdminProductPerformanceDetail";
import { getDefaultAdminDateRange } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

export default function AdminProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = typeof id === "string" ? id : "";
  const dateRange = getDefaultAdminDateRange();
  const { data, isLoading, error, reload } = useAdminProductPerformanceDetail(
    productId,
    dateRange,
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: ADMIN_COLORS.pageBg,
        }}
      >
        <ActivityIndicator color={ADMIN_COLORS.navActive} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: ADMIN_COLORS.pageBg,
          padding: 24,
          gap: 12,
        }}
      >
        <Text style={{ ...pretendard(500), fontSize: 15, color: ADMIN_COLORS.navyMuted }}>
          {error ?? "상품 정보를 찾을 수 없습니다."}
        </Text>
        <Pressable onPress={() => void reload()}>
          <Text style={{ ...pretendard(600), fontSize: 14, color: ADMIN_COLORS.navActive }}>
            다시 시도
          </Text>
        </Pressable>
      </View>
    );
  }

  return <AdminProductDetailContent data={data} />;
}
