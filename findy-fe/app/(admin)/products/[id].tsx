import { AdminProductDetailContent } from "@/components/admin/AdminProductDetailContent";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { getDefaultAdminDateRange } from "@/lib/admin/mockDashboardData";
import { getAdminProductPerformanceDetail } from "@/lib/admin/mockProductPerformanceData";
import { pretendard } from "@/utils/pretendard";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

export default function AdminProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = typeof id === "string" ? id : "";

  const data = useMemo(() => {
    if (!productId) return null;
    return getAdminProductPerformanceDetail(productId, getDefaultAdminDateRange());
  }, [productId]);

  if (!data) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: ADMIN_COLORS.pageBg,
          padding: 24,
        }}
      >
        <Text style={{ ...pretendard(500), fontSize: 15, color: ADMIN_COLORS.navyMuted }}>
          상품 정보를 찾을 수 없습니다.
        </Text>
      </View>
    );
  }

  return <AdminProductDetailContent data={data} />;
}
