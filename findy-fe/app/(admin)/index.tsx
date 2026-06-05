import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminOperationsSummary } from "@/components/admin/AdminOperationsSummary";
import { AdminProductFunnel } from "@/components/admin/AdminProductFunnel";
import { AdminPromoProductList } from "@/components/admin/AdminPromoProductList";
import { AdminZoneVisitHeatmap } from "@/components/admin/AdminZoneVisitHeatmap";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import {
  getAdminDashboardMock,
  getDefaultAdminDateRange,
  type AdminDateRange,
} from "@/lib/admin/mockDashboardData";
import { useMemo, useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function DashboardSection({
  children,
  isWide,
  fullWidth,
}: {
  children: ReactNode;
  isWide: boolean;
  fullWidth?: boolean;
}) {
  return (
    <View
      style={
        isWide && !fullWidth
          ? { width: "48%" }
          : { width: "100%" }
      }
    >
      {children}
    </View>
  );
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const isWide = useAdminWideLayout();
  const [dateRange, setDateRange] = useState<AdminDateRange>(getDefaultAdminDateRange);
  const data = useMemo(() => getAdminDashboardMock(dateRange), [dateRange]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: ADMIN_COLORS.pageBg }}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24) + (isWide ? 0 : 72),
      }}
    >
      <AdminHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        showTitle={!isWide}
      />

      <View style={{ paddingHorizontal: 20, gap: 28, paddingTop: 8 }}>
        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "space-between",
          }}
        >
          <DashboardSection isWide={isWide}>
            <AdminOperationsSummary insight={data.insight} stats={data.stats} />
          </DashboardSection>

          <DashboardSection isWide={isWide}>
            <AdminProductFunnel
              steps={data.funnel}
              finalConversionRate={data.finalConversionRate}
            />
          </DashboardSection>

          <DashboardSection isWide={isWide} fullWidth={!isWide}>
            <AdminZoneVisitHeatmap zones={data.zones} />
          </DashboardSection>

          <DashboardSection isWide={isWide}>
            <AdminPromoProductList products={data.promoProducts} />
          </DashboardSection>
        </View>
      </View>
    </ScrollView>
  );
}
