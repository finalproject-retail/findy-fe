import { ADMIN_COLORS } from "@/constants/adminTheme";
import type { AdminRecommendationFunnelStep } from "@/lib/admin/adminProductPerformanceTypes";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import Svg, { Line, Polygon } from "react-native-svg";

type AdminRecommendationFunnelProps = {
  steps: AdminRecommendationFunnelStep[];
  finalConversionRate: string;
  /** 2열 그리드에서 옆 카드와 동일 높이로 맞출 때 */
  stretch?: boolean;
};

const FUNNEL_COLORS = [
  ADMIN_COLORS.funnelDark,
  ADMIN_COLORS.funnelMid,
  "#6B94C8",
  ADMIN_COLORS.funnelLight,
];

const SEGMENT_HEIGHT = 42;
const DETAIL_TITLE_BLOCK_MIN_HEIGHT = 44;

const FUNNEL_LAYOUT = {
  default: { funnelWidth: 184, sideInset: 18, labelFontSize: 16, cardPaddingH: 16 },
  compact: { funnelWidth: 148, sideInset: 14, labelFontSize: 16, cardPaddingH: 12 },
} as const;

function FunnelSegmentRow({
  step,
  index,
  topWidth,
  bottomWidth,
  funnelWidth,
  sideInset,
  labelFontSize,
}: {
  step: AdminRecommendationFunnelStep;
  index: number;
  topWidth: number;
  bottomWidth: number;
  funnelWidth: number;
  sideInset: number;
  labelFontSize: number;
}) {
  const centerX = funnelWidth / 2;
  const topLeft = centerX - topWidth / 2;
  const topRight = centerX + topWidth / 2;
  const bottomLeft = centerX - bottomWidth / 2;
  const bottomRight = centerX + bottomWidth / 2;
  const points = `${topLeft},0 ${topRight},0 ${bottomRight},${SEGMENT_HEIGHT} ${bottomLeft},${SEGMENT_HEIGHT}`;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          paddingLeft: sideInset,
          paddingRight: 10,
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            ...pretendard(500),
            fontSize: labelFontSize,
            color: ADMIN_COLORS.navyMuted,
            lineHeight: labelFontSize + 4,
          }}
        >
          {step.label}
        </Text>
      </View>

      <View style={{ width: funnelWidth, alignItems: "center", flexShrink: 0 }}>
        <Svg width={funnelWidth} height={SEGMENT_HEIGHT}>
          <Line
            x1={0}
            y1={SEGMENT_HEIGHT / 2}
            x2={Math.min(12, funnelWidth * 0.1)}
            y2={SEGMENT_HEIGHT / 2}
            stroke="#C5CEDB"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Polygon points={points} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
        </Svg>
      </View>

      <View
        style={{
          flex: 1,
          minWidth: 0,
          paddingRight: sideInset,
          paddingLeft: 10,
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            ...pretendard(700),
            fontSize: labelFontSize,
            color: ADMIN_COLORS.navy,
          }}
        >
          {step.percent}%
        </Text>
      </View>
    </View>
  );
}

export function AdminRecommendationFunnel({
  steps,
  finalConversionRate,
  stretch = false,
}: AdminRecommendationFunnelProps) {
  const layout = stretch ? FUNNEL_LAYOUT.compact : FUNNEL_LAYOUT.default;
  const maxPercent = steps[0]?.percent ?? 100;

  return (
    <View style={{ gap: 12, flex: stretch ? 1 : undefined, alignSelf: "stretch" }}>
      <View
        style={{
          minHeight: stretch ? DETAIL_TITLE_BLOCK_MIN_HEIGHT : undefined,
          justifyContent: stretch ? "flex-end" : undefined,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <Text
            style={{
              flex: 1,
              ...pretendard(700),
              fontSize: 16,
              color: ADMIN_COLORS.navy,
            }}
          >
            추천 후 구매 전환율
          </Text>
          <Text
            style={{
              flexShrink: 0,
              textAlign: "right",
              ...pretendard(500),
              fontSize: 12,
              color: ADMIN_COLORS.navyMuted,
            }}
          >
            최종 구매 전환율:{" "}
            <Text style={{ ...pretendard(700), color: ADMIN_COLORS.navy }}>
              {finalConversionRate}
            </Text>
          </Text>
        </View>
      </View>

      <View
        style={{
          flex: stretch ? 1 : undefined,
          backgroundColor: ADMIN_COLORS.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          paddingVertical: 20,
          paddingHorizontal: layout.cardPaddingH,
          justifyContent: "center",
        }}
      >
        <View style={{ width: "100%", gap: 0 }}>
          {steps.map((step, index) => {
            const topWidth = (step.percent / maxPercent) * layout.funnelWidth;
            const nextStep = steps[index + 1];
            const bottomWidth = nextStep
              ? (nextStep.percent / maxPercent) * layout.funnelWidth
              : topWidth * 0.65;

            return (
              <FunnelSegmentRow
                key={step.label}
                step={step}
                index={index}
                topWidth={topWidth}
                bottomWidth={bottomWidth}
                funnelWidth={layout.funnelWidth}
                sideInset={layout.sideInset}
                labelFontSize={layout.labelFontSize}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}
