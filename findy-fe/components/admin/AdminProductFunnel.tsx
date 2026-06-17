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

const INLINE_PERCENT_MIN_WIDTH = 32;
const MIN_VISIBLE_BAR_WIDTH = 8;

type StepTransition = {
  entryRate: number;
  dropRate: number;
};

function roundOneDecimal(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 10) / 10;
}

function normalizePercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(Math.max(roundOneDecimal(value), 0), 100);
}

function getStepTransition(
  previousPercent: number,
  nextPercent: number,
): StepTransition {
  if (previousPercent <= 0) {
    return {
      entryRate: 0,
      dropRate: 100,
    };
  }

  const entryRate = roundOneDecimal(
    Math.min(Math.max((nextPercent / previousPercent) * 100, 0), 100),
  );

  const dropRate = roundOneDecimal(Math.max(100 - entryRate, 0));

  return { entryRate, dropRate };
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
          -{transition.dropRate}% 이탈
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
  const widthPercent = normalizePercent(displayPercent);
  const showPercentInside = widthPercent >= INLINE_PERCENT_MIN_WIDTH;

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
              minWidth: widthPercent > 0 ? MIN_VISIBLE_BAR_WIDTH : 0,
              height: "100%",
              borderRadius: BAR_RADIUS,
              backgroundColor: FUNNEL_COLORS[index],
              justifyContent: "center",
              paddingHorizontal: showPercentInside ? 12 : 0,
            }}
          >
            {showPercentInside ? (
              <Text
                numberOfLines={1}
                style={{
                  ...pretendard(700),
                  fontSize: 13,
                  color: "#FFFFFF",
                }}
              >
                {widthPercent}%
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {!showPercentInside ? (
        <Text
          numberOfLines={1}
          style={{
            width: 44,
            textAlign: "right",
            ...pretendard(700),
            fontSize: 14,
            color: ADMIN_COLORS.navy,
          }}
        >
          {widthPercent}%
        </Text>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
}

function buildDisplaySteps(steps: AdminFunnelStep[]) {
  let previousPercent = 100;

  return steps.map((step, index) => {
    const rawPercent = index === 0 ? 100 : normalizePercent(step.percent);

    const displayPercent =
      index === 0 ? 100 : Math.min(rawPercent, previousPercent);

    const transition =
      index > 0 ? getStepTransition(previousPercent, displayPercent) : null;

    previousPercent = displayPercent;

    return {
      step,
      index,
      displayPercent,
      transition,
    };
  });
}

export function AdminProductFunnel({
  steps,
  finalConversionRate,
  stretch = false,
}: AdminProductFunnelProps) {
  const displaySteps = buildDisplaySteps(steps);

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
          {displaySteps.map(({ step, index, displayPercent, transition }) => (
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
          ))}
        </View>
      </View>
    </View>
  );
}