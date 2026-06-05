import { ADMIN_COLORS } from "@/constants/adminTheme";
import type { AdminFunnelStep } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type AdminProductFunnelProps = {
  steps: AdminFunnelStep[];
  finalConversionRate: string;
};

const FUNNEL_COLORS = [
  ADMIN_COLORS.funnelDark,
  ADMIN_COLORS.funnelMid,
  ADMIN_COLORS.funnelLight,
];

const FUNNEL_WIDTHS = [1, 0.78, 0.56];

export function AdminProductFunnel({
  steps,
  finalConversionRate,
}: AdminProductFunnelProps) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={{ ...pretendard(700), fontSize: 18, color: ADMIN_COLORS.navy }}>
        상품 성과 분석
      </Text>

      <View
        style={{
          backgroundColor: ADMIN_COLORS.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          padding: 20,
          gap: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ ...pretendard(600), fontSize: 15, color: ADMIN_COLORS.navy }}>
            품절 대응 성과
          </Text>
          <Text style={{ ...pretendard(500), fontSize: 13, color: ADMIN_COLORS.navyMuted }}>
            최종 전환율: {finalConversionRate}
          </Text>
        </View>

        <View style={{ gap: 14 }}>
          {steps.map((step, index) => (
            <View
              key={step.label}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Text
                style={{
                  width: 130,
                  ...pretendard(500),
                  fontSize: 13,
                  color: ADMIN_COLORS.navyMuted,
                }}
              >
                {step.label}
              </Text>
              <View style={{ flex: 1, alignItems: "center" }}>
                <View
                  style={{
                    width: `${FUNNEL_WIDTHS[index]! * 100}%`,
                    minWidth: 80,
                    height: 44,
                    borderRadius: 6,
                    backgroundColor: FUNNEL_COLORS[index],
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ ...pretendard(700), fontSize: 14, color: "#FFFFFF" }}>
                    {step.percent}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
