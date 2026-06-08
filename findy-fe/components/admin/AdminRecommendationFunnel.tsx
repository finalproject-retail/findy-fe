import { ADMIN_COLORS } from "@/constants/adminTheme";
import type { AdminRecommendationFunnelStep } from "@/lib/admin/adminProductPerformanceTypes";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import Svg, { Line, Polygon } from "react-native-svg";

type AdminRecommendationFunnelProps = {
  steps: AdminRecommendationFunnelStep[];
  finalConversionRate: string;
};

const FUNNEL_COLORS = [
  ADMIN_COLORS.funnelDark,
  ADMIN_COLORS.funnelMid,
  "#6B94C8",
  ADMIN_COLORS.funnelLight,
];

const FUNNEL_MAX_WIDTH = 168;
const SEGMENT_HEIGHT = 42;
const LABEL_WIDTH = 118;

function FunnelSegmentRow({
  step,
  index,
  topWidth,
  bottomWidth,
}: {
  step: AdminRecommendationFunnelStep;
  index: number;
  topWidth: number;
  bottomWidth: number;
}) {
  const centerX = FUNNEL_MAX_WIDTH / 2;
  const topLeft = centerX - topWidth / 2;
  const topRight = centerX + topWidth / 2;
  const bottomLeft = centerX - bottomWidth / 2;
  const bottomRight = centerX + bottomWidth / 2;
  const points = `${topLeft},0 ${topRight},0 ${bottomRight},${SEGMENT_HEIGHT} ${bottomLeft},${SEGMENT_HEIGHT}`;

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: LABEL_WIDTH, paddingRight: 10 }}>
        <Text style={{ ...pretendard(500), fontSize: 12, color: ADMIN_COLORS.navyMuted, lineHeight: 17 }}>
          {step.label}
        </Text>
      </View>

      <View style={{ width: FUNNEL_MAX_WIDTH, alignItems: "center" }}>
        <Svg width={FUNNEL_MAX_WIDTH} height={SEGMENT_HEIGHT}>
          <Line
            x1={0}
            y1={SEGMENT_HEIGHT / 2}
            x2={12}
            y2={SEGMENT_HEIGHT / 2}
            stroke="#C5CEDB"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Polygon points={points} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
        </Svg>
      </View>

      <Text
        style={{
          width: 52,
          textAlign: "right",
          ...pretendard(700),
          fontSize: 13,
          color: ADMIN_COLORS.navy,
        }}
      >
        {step.percent}%
      </Text>
    </View>
  );
}

export function AdminRecommendationFunnel({
  steps,
  finalConversionRate,
}: AdminRecommendationFunnelProps) {
  const maxPercent = steps[0]?.percent ?? 100;

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Text style={{ ...pretendard(700), fontSize: 16, color: ADMIN_COLORS.navy }}>
          추천 후 구매 전환율
        </Text>
        <Text style={{ ...pretendard(500), fontSize: 12, color: ADMIN_COLORS.navyMuted }}>
          최종 구매 전환율:{" "}
          <Text style={{ ...pretendard(700), color: ADMIN_COLORS.navy }}>
            {finalConversionRate}
          </Text>
        </Text>
      </View>

      <View
        style={{
          backgroundColor: ADMIN_COLORS.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          paddingVertical: 20,
          paddingHorizontal: 12,
          gap: 0,
        }}
      >
        {steps.map((step, index) => {
          const topWidth = (step.percent / maxPercent) * FUNNEL_MAX_WIDTH;
          const nextStep = steps[index + 1];
          const bottomWidth = nextStep
            ? (nextStep.percent / maxPercent) * FUNNEL_MAX_WIDTH
            : topWidth * 0.65;

          return (
            <FunnelSegmentRow
              key={step.label}
              step={step}
              index={index}
              topWidth={topWidth}
              bottomWidth={bottomWidth}
            />
          );
        })}
      </View>
    </View>
  );
}
