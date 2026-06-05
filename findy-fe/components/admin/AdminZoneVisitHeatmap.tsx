import { ADMIN_COLORS } from "@/constants/adminTheme";
import {
  ADMIN_ZONE_CARD_BODY_HEIGHT,
  ADMIN_ZONE_TABLE_HEADER_HEIGHT,
  ADMIN_ZONE_TABLE_ROW_HEIGHT,
} from "@/lib/admin/adminDashboardLayout";
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
import { ScrollView, Text, View, type ViewStyle } from "react-native";

type AdminZoneVisitHeatmapProps = {
  zones: AdminZoneMatrix;
  stretch?: boolean;
};

const ZONE_LABEL_COL_WIDTH = 108;
const ZONE_CELL_WIDTH = 100;

/** 인접 셀 border 겹침 방지 — 상·좌는 테이블 래퍼, 셀은 우·하만 */
function tableCellBorder(style?: ViewStyle): ViewStyle {
  return {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: ADMIN_COLORS.border,
    ...style,
  };
}

const tableFrameStyle: ViewStyle = {
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderColor: ADMIN_COLORS.border,
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
        style={tableCellBorder({
          width: ZONE_CELL_WIDTH,
          height: ADMIN_ZONE_TABLE_ROW_HEIGHT,
          backgroundColor: ADMIN_COLORS.pageBg,
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        <Text style={{ color: ADMIN_COLORS.navInactive }}>—</Text>
      </View>
    );
  }

  return (
    <View
      style={tableCellBorder({
        width: ZONE_CELL_WIDTH,
        height: ADMIN_ZONE_TABLE_ROW_HEIGHT,
        backgroundColor: highlighted
          ? heatColor(traffic.percent)
          : ADMIN_COLORS.cardBg,
        padding: 6,
        justifyContent: "center",
        gap: 2,
      })}
    >
      <Text
        style={{ ...pretendard(700), fontSize: 12, color: ADMIN_COLORS.navy }}
      >
        {traffic.total} ({traffic.percent}%)
      </Text>
      <Text
        style={{
          ...pretendard(500),
          fontSize: 10,
          color: ADMIN_COLORS.navyMuted,
        }}
      >
        ♂ {traffic.male.count} ({traffic.male.percent}%)
      </Text>
      <Text
        style={{
          ...pretendard(500),
          fontSize: 10,
          color: ADMIN_COLORS.navyMuted,
        }}
      >
        ♀ {traffic.female.count} ({traffic.female.percent}%)
      </Text>
    </View>
  );
}

function VisitorCell({ traffic }: { traffic: AdminZoneTraffic }) {
  return (
    <View
      style={tableCellBorder({
        width: ZONE_CELL_WIDTH,
        height: ADMIN_ZONE_TABLE_ROW_HEIGHT,
        backgroundColor: ADMIN_COLORS.statCardBg,
        padding: 6,
        justifyContent: "center",
        gap: 2,
      })}
    >
      <Text
        style={{ ...pretendard(700), fontSize: 11, color: ADMIN_COLORS.navy }}
      >
        {traffic.total} ({traffic.percent}%)
      </Text>
      <Text
        style={{
          ...pretendard(500),
          fontSize: 10,
          color: ADMIN_COLORS.navyMuted,
        }}
      >
        ♂ {traffic.male.count} ({traffic.male.percent}%)
      </Text>
      <Text
        style={{
          ...pretendard(500),
          fontSize: 10,
          color: ADMIN_COLORS.navyMuted,
        }}
      >
        ♀ {traffic.female.count} ({traffic.female.percent}%)
      </Text>
    </View>
  );
}

export function AdminZoneVisitHeatmap({
  zones,
  stretch = false,
}: AdminZoneVisitHeatmapProps) {
  return (
    <View style={{ gap: 16 }}>
      <Text
        style={{ ...pretendard(700), fontSize: 18, color: ADMIN_COLORS.navy }}
      >
        구역별 방문율 (혼잡도)
      </Text>

      <View
        style={
          stretch
            ? {
                height: ADMIN_ZONE_CARD_BODY_HEIGHT,
                backgroundColor: ADMIN_COLORS.cardBg,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: ADMIN_COLORS.border,
                overflow: "hidden",
              }
            : undefined
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={stretch ? { flex: 1 } : undefined}
        >
          <View style={tableFrameStyle}>
            <View style={{ flexDirection: "row" }}>
              <View
                style={tableCellBorder({
                  width: ZONE_LABEL_COL_WIDTH,
                  height: ADMIN_ZONE_TABLE_HEADER_HEIGHT,
                  backgroundColor: ADMIN_COLORS.statCardBg,
                })}
              />
              <View
                style={tableCellBorder({
                  width: ZONE_CELL_WIDTH,
                  height: ADMIN_ZONE_TABLE_HEADER_HEIGHT,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: ADMIN_COLORS.statCardBg,
                })}
              >
                <Text
                  style={{
                    ...pretendard(600),
                    fontSize: 12,
                    color: ADMIN_COLORS.navyMuted,
                  }}
                >
                  Visitors
                </Text>
              </View>
              {ADMIN_ZONE_ORDER.map((zone) => (
                <View
                  key={zone}
                  style={tableCellBorder({
                    width: ZONE_CELL_WIDTH,
                    height: ADMIN_ZONE_TABLE_HEADER_HEIGHT,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: ADMIN_COLORS.statCardBg,
                    paddingHorizontal: 4,
                  })}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      ...pretendard(600),
                      fontSize: 11,
                      lineHeight: 14,
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
                    style={tableCellBorder({
                      width: ZONE_LABEL_COL_WIDTH,
                      height: ADMIN_ZONE_TABLE_ROW_HEIGHT,
                      justifyContent: "center",
                      paddingHorizontal: 4,
                      backgroundColor: ADMIN_COLORS.statCardBg,
                    })}
                  >
                    <Text
                      numberOfLines={2}
                      style={{
                        ...pretendard(600),
                        fontSize: 11,
                        lineHeight: 14,
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
    </View>
  );
}
