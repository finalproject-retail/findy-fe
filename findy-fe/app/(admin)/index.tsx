import { AdminContentFrame } from "@/components/admin/AdminContentFrame";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminOperationsSummary } from "@/components/admin/AdminOperationsSummary";
import { AdminProductFunnel } from "@/components/admin/AdminProductFunnel";
import { AdminPromoProductList } from "@/components/admin/AdminPromoProductList";
import { AdminScrollView } from "@/components/admin/AdminScrollView";
import { AdminZoneVisitHeatmap } from "@/components/admin/AdminZoneVisitHeatmap";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminDashboardAnalytics } from "@/hooks/useAdminDashboardAnalytics";
import { useAdminPromotionAnalytics } from "@/hooks/useAdminPromotionAnalytics";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import {
  getDefaultAdminDateRange,
  type AdminDateRange,
} from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { useState, type ReactNode } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function DashboardRow({
  children,
  isWide,
}: {
  children: ReactNode;
  isWide: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: isWide ? "row" : "column",
        alignItems: "stretch",
        gap: 20,
      }}
    >
      {children}
    </View>
  );
}

function DashboardSection({
  children,
  isWide,
}: {
  children: ReactNode;
  isWide: boolean;
}) {
  return (
    <View style={isWide ? { flex: 1, minWidth: 0 } : { width: "100%" }}>
      {children}
    </View>
  );
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const isWide = useAdminWideLayout();
  const [dateRange, setDateRange] = useState<AdminDateRange>(
    getDefaultAdminDateRange,
  );
  const {
    stats,
    zones,
    loading: dashboardLoading,
    error: dashboardError,
  } = useAdminDashboardAnalytics(dateRange);
  const {
    funnel,
    finalConversionRate,
    promoProducts,
    loading: promoLoading,
    error: promoError,
  } = useAdminPromotionAnalytics(dateRange);

  return (
    <AdminScrollView
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24) + (isWide ? 0 : 72),
      }}
    >
      <AdminContentFrame>
        <AdminHeader
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          showTitle={!isWide}
        />

        <View style={{ paddingHorizontal: 20, gap: 28, paddingTop: 8 }}>
          <DashboardRow isWide={isWide}>
            <DashboardSection isWide={isWide}>
              <AdminOperationsSummary stats={stats} stretch={isWide} />
            </DashboardSection>

            <DashboardSection isWide={isWide}>
              {promoLoading ? (
                <View className="items-center py-10">
                  <ActivityIndicator color={ADMIN_COLORS.navy} />
                </View>
              ) : (
                <AdminProductFunnel
                  steps={funnel}
                  finalConversionRate={finalConversionRate}
                  stretch={isWide}
                />
              )}
            </DashboardSection>
          </DashboardRow>

          {dashboardError ? (
            <Text
              className="text-sm text-text-red"
              style={{ ...pretendard(400), paddingHorizontal: 4 }}
            >
              {dashboardError}
            </Text>
          ) : null}

          {promoError ? (
            <Text
              className="text-sm text-text-red"
              style={{ ...pretendard(400), paddingHorizontal: 4 }}
            >
              {promoError}
            </Text>
          ) : null}

          <DashboardRow isWide={isWide}>
            <DashboardSection isWide={isWide}>
              {dashboardLoading ? (
                <View className="items-center py-10">
                  <ActivityIndicator color={ADMIN_COLORS.navy} />
                </View>
              ) : (
                <AdminZoneVisitHeatmap zones={zones} stretch={isWide} />
              )}
            </DashboardSection>

            <DashboardSection isWide={isWide}>
              {promoLoading ? (
                <View className="items-center py-10">
                  <ActivityIndicator color={ADMIN_COLORS.navy} />
                </View>
              ) : (
                <AdminPromoProductList
                  products={promoProducts}
                  stretch={isWide}
                />
              )}
            </DashboardSection>
          </DashboardRow>
        </View>
      </AdminContentFrame>
    </AdminScrollView>
  );
}
