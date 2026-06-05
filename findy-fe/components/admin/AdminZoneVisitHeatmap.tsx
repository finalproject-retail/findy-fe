import { ADMIN_COLORS } from "@/constants/adminTheme";
import type {
  AdminZoneKey,
  AdminZoneMatrix,
  AdminZoneTraffic,
} from "@/lib/admin/mockDashboardData";
import {
  ADMIN_ZONE_LABELS,
  ADMIN_ZONE_ORDER,
} from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { ScrollView, Text, View } from "react-native";

type AdminZoneVisitHeatmapProps = {
  zones: AdminZoneMatrix;
};

function heatColor(percent: number) {
  if (percent >= 50) return ADMIN_COLORS.heatHigh;
  if (percent >= 30) return ADMIN_COLORS.heatMid;
  if (percent >= 15) return ADMIN_COLORS.heatLow;
  return ADMIN_COLORS.cardBg;
}

function TrafficCell({
  traffic,
  highlighted,
}: {
  traffic?: AdminZoneTraffic;
  highlighted?: boolean;
}) {
  if (!traffic) {
    return (
      <View
        style={{
          width: 92,
          minHeight: 72,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          backgroundColor: ADMIN_COLORS.pageBg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: ADMIN_COLORS.navInactive }}>—</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        width: 92,
        minHeight: 72,
        borderWidth: 1,
        borderColor: ADMIN_COLORS.border,
        backgroundColor: highlighted ? heatColor(traffic.percent) : ADMIN_COLORS.cardBg,
        padding: 6,
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Text style={{ ...pretendard(700), fontSize: 11, color: ADMIN_COLORS.navy }}>
        {traffic.total} ({traffic.percent}%)
      </Text>
      <Text style={{ ...pretendard(500), fontSize: 9, color: ADMIN_COLORS.navyMuted }}>
        ♂ {traffic.male.count} ({traffic.male.percent}%)
      </Text>
      <Text style={{ ...pretendard(500), fontSize: 9, color: ADMIN_COLORS.navyMuted }}>
        ♀ {traffic.female.count} ({traffic.female.percent}%)
      </Text>
    </View>
  );
}

function VisitorCell({ traffic }: { traffic: AdminZoneTraffic }) {
  return (
    <View
      style={{
        width: 92,
        minHeight: 72,
        borderWidth: 1,
        borderColor: ADMIN_COLORS.border,
        backgroundColor: ADMIN_COLORS.statCardBg,
        padding: 6,
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Text style={{ ...pretendard(700), fontSize: 11, color: ADMIN_COLORS.navy }}>
        {traffic.total} ({traffic.percent}%)
      </Text>
      <Text style={{ ...pretendard(500), fontSize: 9, color: ADMIN_COLORS.navyMuted }}>
        ♂ {traffic.male.count} ({traffic.male.percent}%)
      </Text>
      <Text style={{ ...pretendard(500), fontSize: 9, color: ADMIN_COLORS.navyMuted }}>
        ♀ {traffic.female.count} ({traffic.female.percent}%)
      </Text>
    </View>
  );
}

export function AdminZoneVisitHeatmap({ zones }: AdminZoneVisitHeatmapProps) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={{ ...pretendard(700), fontSize: 18, color: ADMIN_COLORS.navy }}>
        구역별 방문율 (혼잡도)
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ width: 88, minHeight: 40 }} />
            <View
              style={{
                width: 92,
                minHeight: 40,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: ADMIN_COLORS.border,
                backgroundColor: ADMIN_COLORS.statCardBg,
              }}
            >
              <Text style={{ ...pretendard(600), fontSize: 10, color: ADMIN_COLORS.navyMuted }}>
                Visitors
              </Text>
            </View>
            {ADMIN_ZONE_ORDER.map((zone) => (
              <View
                key={zone}
                style={{
                  width: 92,
                  minHeight: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: ADMIN_COLORS.border,
                  backgroundColor: ADMIN_COLORS.statCardBg,
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    ...pretendard(600),
                    fontSize: 10,
                    color: ADMIN_COLORS.navy,
                    textAlign: "center",
                  }}
                >
                  {ADMIN_ZONE_LABELS[zone]}
                </Text>
              </View>
            ))}
          </View>

          {ADMIN_ZONE_ORDER.map((rowZone) => {
            const row = zones[rowZone];
            return (
              <View key={rowZone} style={{ flexDirection: "row" }}>
                <View
                  style={{
                    width: 88,
                    minHeight: 72,
                    justifyContent: "center",
                    paddingHorizontal: 4,
                    borderWidth: 1,
                    borderColor: ADMIN_COLORS.border,
                    backgroundColor: ADMIN_COLORS.statCardBg,
                  }}
                >
                  <Text
                    style={{
                      ...pretendard(600),
                      fontSize: 10,
                      color: ADMIN_COLORS.navy,
                      textAlign: "center",
                    }}
                  >
                    {ADMIN_ZONE_LABELS[rowZone]}
                  </Text>
                </View>
                <VisitorCell traffic={row.visitors} />
                {ADMIN_ZONE_ORDER.map((colZone) => {
                  const isDiagonal = rowZone === colZone;
                  const traffic = row.flows[colZone as AdminZoneKey];
                  return (
                    <TrafficCell
                      key={`${rowZone}-${colZone}`}
                      traffic={isDiagonal ? undefined : traffic}
                      highlighted={Boolean(traffic && traffic.percent >= 30)}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
