import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import type { AdminStatCard } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type AdminOperationsSummaryProps = {
  insight: string;
  stats: AdminStatCard[];
  stretch?: boolean;
};

function StatCard({ stat, compact }: { stat: AdminStatCard; compact?: boolean }) {
  const isUp = stat.trend === "up";
  const badgeBg = isUp ? ADMIN_COLORS.positiveBg : ADMIN_COLORS.negativeBg;
  const badgeText = isUp ? ADMIN_COLORS.positiveText : ADMIN_COLORS.negativeText;

  return (
    <View
      style={{
        flex: 1,
        minWidth: compact ? "100%" : "46%",
        backgroundColor: ADMIN_COLORS.statCardBg,
        borderRadius: 12,
        padding: 16,
        gap: 8,
      }}
    >
      <Text style={{ ...pretendard(500), fontSize: 13, color: ADMIN_COLORS.statLabel }}>
        {stat.label}
      </Text>
      <Text style={{ ...pretendard(700), fontSize: 20, color: ADMIN_COLORS.navy }}>
        {stat.value}
      </Text>
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: badgeBg,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text style={{ ...pretendard(600), fontSize: 12, color: badgeText }}>
          {stat.delta}
        </Text>
      </View>
    </View>
  );
}

export function AdminOperationsSummary({
  insight,
  stats,
  stretch = false,
}: AdminOperationsSummaryProps) {
  const isWide = useAdminWideLayout();

  return (
    <View style={stretch ? { flex: 1, gap: 16 } : { gap: 16 }}>
      <Text style={{ ...pretendard(700), fontSize: 18, color: ADMIN_COLORS.navy }}>
        운영 요약
      </Text>

      <View
        style={
          stretch
            ? {
                flex: 1,
                backgroundColor: ADMIN_COLORS.cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: ADMIN_COLORS.border,
                padding: 20,
                gap: 16,
              }
            : { gap: 16 }
        }
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View
            style={{
              width: 4,
              borderRadius: 2,
              backgroundColor: ADMIN_COLORS.accentBar,
            }}
          />
          <Text
            style={{
              flex: 1,
              ...pretendard(500),
              fontSize: 14,
              color: ADMIN_COLORS.navyMuted,
              lineHeight: 22,
            }}
          >
            {insight}
          </Text>
        </View>

        <View
          style={{
            flex: stretch ? 1 : undefined,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            alignContent: stretch ? "stretch" : undefined,
          }}
        >
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={isWide ? { width: "48%", flexGrow: stretch ? 1 : 0 } : { width: "48%" }}
            >
              <StatCard stat={stat} compact={isWide} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
