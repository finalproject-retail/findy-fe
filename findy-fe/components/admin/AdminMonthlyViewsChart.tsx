import { ADMIN_COLORS } from "@/constants/adminTheme";
import type { AdminMonthlyViewPoint } from "@/lib/admin/adminProductPerformanceTypes";
import { pretendard } from "@/utils/pretendard";
import { useMemo } from "react";
import { Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from "react-native-svg";

type AdminMonthlyViewsChartProps = {
  points: AdminMonthlyViewPoint[];
  height?: number;
  /** 2열 그리드에서 옆 카드와 동일 높이로 맞출 때 */
  stretch?: boolean;
};

const CHART_HEIGHT = 220;
const DETAIL_TITLE_BLOCK_MIN_HEIGHT = 44;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 12;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;

function buildSmoothPath(
  values: number[],
  width: number,
  height: number,
  maxValue: number,
) {
  if (values.length === 0) return "";

  const plotWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const stepX = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  const coords = values.map((value, index) => {
    const x = PADDING_LEFT + stepX * index;
    const y = PADDING_TOP + plotHeight - (value / maxValue) * plotHeight;
    return { x, y };
  });

  if (coords.length === 1) {
    const point = coords[0]!;
    return `M ${point.x} ${point.y}`;
  }

  let path = `M ${coords[0]!.x} ${coords[0]!.y}`;
  for (let index = 1; index < coords.length; index += 1) {
    const previous = coords[index - 1]!;
    const current = coords[index]!;
    const controlX = (previous.x + current.x) / 2;
    path += ` C ${controlX} ${previous.y}, ${controlX} ${current.y}, ${current.x} ${current.y}`;
  }

  return path;
}

function buildAreaPath(
  linePath: string,
  values: number[],
  width: number,
  height: number,
) {
  if (values.length === 0) return "";

  const plotWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const stepX = values.length > 1 ? plotWidth / (values.length - 1) : 0;
  const baseY = PADDING_TOP + plotHeight;
  const lastX = PADDING_LEFT + stepX * (values.length - 1);

  return `${linePath} L ${lastX} ${baseY} L ${PADDING_LEFT} ${baseY} Z`;
}

export function AdminMonthlyViewsChart({
  points,
  height = CHART_HEIGHT,
  stretch = false,
}: AdminMonthlyViewsChartProps) {
  const chartWidth = 320;
  const values = points.map((point) => point.value);
  const maxValue = useMemo(() => {
    const peak = Math.max(...values, 1);
    return Math.ceil(peak / 200) * 200;
  }, [values]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let value = 0; value <= maxValue; value += maxValue / 5) {
      ticks.push(Math.round(value));
    }
    return ticks;
  }, [maxValue]);

  const linePath = buildSmoothPath(values, chartWidth, height, maxValue);
  const areaPath = buildAreaPath(linePath, values, chartWidth, height);
  const plotWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;
  const stepX = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  return (
    <View style={{ gap: 12, flex: stretch ? 1 : undefined, alignSelf: "stretch" }}>
      <View
        style={{
          minHeight: stretch ? DETAIL_TITLE_BLOCK_MIN_HEIGHT : undefined,
          justifyContent: stretch ? "flex-end" : undefined,
        }}
      >
        <Text style={{ ...pretendard(700), fontSize: 16, color: ADMIN_COLORS.navy }}>
          월별 조회수 분석
        </Text>
      </View>

      <View
        style={{
          flex: stretch ? 1 : undefined,
          backgroundColor: ADMIN_COLORS.cardBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: ADMIN_COLORS.border,
          paddingVertical: 16,
          paddingHorizontal: 8,
          justifyContent: "center",
        }}
      >
        <Svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
          <Defs>
            <LinearGradient id="viewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#4A7FE8" stopOpacity={0.28} />
              <Stop offset="100%" stopColor="#4A7FE8" stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {yTicks.map((tick) => {
            const y = PADDING_TOP + plotHeight - (tick / maxValue) * plotHeight;
            return (
              <Line
                key={tick}
                x1={PADDING_LEFT}
                y1={y}
                x2={chartWidth - PADDING_RIGHT}
                y2={y}
                stroke={ADMIN_COLORS.border}
                strokeWidth={1}
              />
            );
          })}

          <Path d={areaPath} fill="url(#viewsAreaGradient)" />
          <Path
            d={linePath}
            fill="none"
            stroke={ADMIN_COLORS.navActive}
            strokeWidth={2.5}
          />

          {values.map((value, index) => {
            const x = PADDING_LEFT + stepX * index;
            const y = PADDING_TOP + plotHeight - (value / maxValue) * plotHeight;
            return <Circle key={points[index]!.month} cx={x} cy={y} r={3.5} fill={ADMIN_COLORS.navActive} />;
          })}

          {yTicks.map((tick) => {
            const y = PADDING_TOP + plotHeight - (tick / maxValue) * plotHeight;
            return (
              <SvgText
                key={`y-${tick}`}
                x={PADDING_LEFT - 8}
                y={y + 4}
                fontSize={10}
                fill={ADMIN_COLORS.navyMuted}
                textAnchor="end"
              >
                {tick}
              </SvgText>
            );
          })}

          {points.map((point, index) => {
            const x = PADDING_LEFT + stepX * index;
            return (
              <SvgText
                key={point.month}
                x={x}
                y={height - 8}
                fontSize={10}
                fill={ADMIN_COLORS.navyMuted}
                textAnchor="middle"
              >
                {point.month}
              </SvgText>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}
