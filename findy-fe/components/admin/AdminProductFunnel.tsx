import { ADMIN_COLORS } from "@/constants/adminTheme";
import type { AdminFunnelStep } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type AdminProductFunnelProps = {
  steps: AdminFunnelStep[];
  finalConversionRate: string;
  stretch?: boolean;
};

const FUNNEL_COLORS = [
  ADMIN_COLORS.funnelDark,
  ADMIN_COLORS.funnelMid,
  ADMIN_COLORS.funnelLight,
];

const LABEL_WIDTH = 118;
const BAR_HEIGHT = 40;
const BAR_RADIUS = 5;

type StepTransition = {
  entryRate: number;
  dropPp: number;
};

function getStepTransition(
  previousPercent: number,
  nextPercent: number,
): StepTransition {
  const entryRate =
    previousPercent > 0
      ? Math.round((nextPercent / previousPercent) * 1000) / 10
      : 0;
  const dropPp = Math.round((previousPercent - nextPercent) * 10) / 10;

  return { entryRate, dropPp };
}

function TransitionBadges({ transition }: { transition: StepTransition }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        paddingLeft: LABEL_WIDTH + 12,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          backgroundColor: "#EEF3FF",
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text
          style={{
            ...pretendard(600),
            fontSize: 11,
            color: ADMIN_COLORS.navActive,
          }}
        >
          ↓ {transition.entryRate}% 진입
        </Text>
      </View>
      <View
        style={{
          backgroundColor: ADMIN_COLORS.negativeBg,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text
          style={{
            ...pretendard(600),
            fontSize: 11,
            color: ADMIN_COLORS.negativeText,
          }}
        >
          -{transition.dropPp}% 이탈
        </Text>
      </View>
    </View>
  );
}

function FunnelBarRow({
  step,
  index,
  displayPercent,
}: {
  step: AdminFunnelStep;
  index: number;
  displayPercent: number;
}) {
  const widthPercent = Math.min(Math.max(displayPercent, 0), 100);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Text
        style={{
          width: LABEL_WIDTH,
          ...pretendard(500),
          fontSize: 13,
          color: ADMIN_COLORS.navyMuted,
          lineHeight: 18,
        }}
      >
        {step.label}
      </Text>

      <View style={{ flex: 1 }}>
        <View
          style={{
            height: BAR_HEIGHT,
            borderRadius: BAR_RADIUS,
            backgroundColor: ADMIN_COLORS.statCardBg,
            overflow: "hidden",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: `${widthPercent}%`,
              minWidth: widthPercent > 0 ? 48 : 0,
              height: "100%",
              borderRadius: BAR_RADIUS,
              backgroundColor: FUNNEL_COLORS[index],
              justifyContent: "center",
              paddingHorizontal: 12,
            }}
          >
            {widthPercent >= 18 ? (
              <Text
                style={{ ...pretendard(700), fontSize: 13, color: "#FFFFFF" }}
              >
                {displayPercent}%
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {widthPercent < 18 ? (
        <Text
          style={{
            width: 44,
            textAlign: "right",
            ...pretendard(700),
            fontSize: 14,
            color: ADMIN_COLORS.navy,
          }}
        >
          {displayPercent}%
        </Text>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
}

export function AdminProductFunnel({
  steps,
  finalConversionRate,
  stretch = false,
}: AdminProductFunnelProps) {
  return (
    <View style={stretch ? { flex: 1, gap: 16 } : { gap: 16 }}>
      <Text
        style={{ ...pretendard(700), fontSize: 18, color: ADMIN_COLORS.navy }}
      >
        상품 성과 분석
      </Text>

      <View
        style={{
          flex: stretch ? 1 : undefined,
          backgroundColor: ADMIN_COLORS.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          padding: 20,
          gap: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <Text
            style={{
              ...pretendard(600),
              fontSize: 15,
              color: ADMIN_COLORS.navy,
            }}
          >
            품절 대응 성과
          </Text>
          <View
            style={{
              backgroundColor: ADMIN_COLORS.statCardBg,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}
          >
            <Text
              style={{
                ...pretendard(600),
                fontSize: 12,
                color: ADMIN_COLORS.navyMuted,
              }}
            >
              최종 전환율{" "}
              <Text style={{ color: ADMIN_COLORS.navy }}>
                {finalConversionRate}
              </Text>
            </Text>
          </View>
        </View>

        <View
          style={
            stretch ? { flex: 1, justifyContent: "center", gap: 4 } : { gap: 4 }
          }
        >
          {steps.map((step, index) => {
            const displayPercent = index === 0 ? 100 : step.percent;
            const previousPercent = index > 0 ? steps[index - 1]!.percent : 100;
            const transition =
              index > 0
                ? getStepTransition(previousPercent, displayPercent)
                : null;

            return (
              <View key={step.label} style={{ gap: 4 }}>
                {transition ? (
                  <TransitionBadges transition={transition} />
                ) : null}
                <FunnelBarRow
                  step={step}
                  index={index}
                  displayPercent={displayPercent}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
