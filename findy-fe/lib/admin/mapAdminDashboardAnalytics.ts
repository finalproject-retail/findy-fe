import { parseAdminRate } from "@/lib/admin/api/adminApiUtils";
import type {
  AnalyticsSummaryData,
  ZoneMovementDto,
  ZoneVisitRateData,
  ZoneVisitRateDto,
} from "@/lib/admin/api/types";
import type {
  AdminStatCard,
  AdminZoneKey,
  AdminZoneMatrix,
  AdminZoneTraffic,
} from "@/lib/admin/mockDashboardData";
import {
  ADMIN_ZONE_LABELS,
  ADMIN_ZONE_ORDER,
} from "@/lib/admin/mockDashboardData";

const ZONE_ID_TO_ZONE_KEY: Record<number, AdminZoneKey> = {
  1: "fresh",
  2: "processedFrozen",
  3: "bakeryDeli",
  4: "beverageAlcohol",
  5: "lifestyle",
};

const GRID_TYPE_TO_ZONE_KEY: Record<string, AdminZoneKey> = {
  "신선 식품": "fresh",
  "가공/냉동 식품": "processedFrozen",
  "베이커리/델리": "bakeryDeli",
  "음료/주류": "beverageAlcohol",
  "라이프 스타일": "lifestyle",
};

function formatCount(value: number, unit: string): string {
  return `${Math.max(0, value).toLocaleString("ko-KR")}${unit}`;
}

function formatPercent(value: number): string {
  const rate = parseAdminRate(value);
  const display = rate > 0 && rate <= 1 ? rate * 100 : rate;
  return `${Math.round(display * 10) / 10}%`;
}

function emptyZoneTraffic(): AdminZoneTraffic {
  return {
    total: 0,
    percent: 0,
    averageStayDuration: 0,
  };
}

function buildEmptyZoneMatrix(): AdminZoneMatrix {
  return ADMIN_ZONE_ORDER.reduce((matrix, zoneKey) => {
    matrix[zoneKey] = {
      visitors: emptyZoneTraffic(),
      flows: {},
    };
    return matrix;
  }, {} as AdminZoneMatrix);
}

function toDisplayPercent(rate: number): number {
  const parsed = parseAdminRate(rate);
  return parsed > 0 && parsed <= 1
    ? Math.round(parsed * 1000) / 10
    : Math.round(parsed * 10) / 10;
}

function resolveZoneKey(
  zoneId: number | undefined | null,
  zoneName: string | undefined | null,
): AdminZoneKey | null {
  if (zoneId != null && ZONE_ID_TO_ZONE_KEY[zoneId]) {
    return ZONE_ID_TO_ZONE_KEY[zoneId];
  }

  const normalized = zoneName?.trim();
  if (!normalized) {
    return null;
  }

  const byLabel = GRID_TYPE_TO_ZONE_KEY[normalized];
  if (byLabel) {
    return byLabel;
  }

  const matched = (Object.entries(ADMIN_ZONE_LABELS) as [AdminZoneKey, string][]).find(
    ([, label]) => label === normalized,
  );

  return matched?.[0] ?? null;
}

function mapZoneVisitRateToTraffic(item: ZoneVisitRateDto): AdminZoneTraffic {
  return {
    total: Math.max(0, item.visitCount ?? item.uniqueVisitorCount ?? 0),
    percent: toDisplayPercent(item.visitRate),
    averageStayDuration: Math.max(0, item.averageStayDurationSeconds ?? 0),
  };
}

function mapZoneMovementToTraffic(item: ZoneMovementDto): AdminZoneTraffic {
  return {
    total: Math.max(0, item.movementCount ?? 0),
    percent: toDisplayPercent(item.movementRate),
    averageStayDuration: Math.max(0, item.averageTravelTimeSeconds ?? 0),
  };
}

export const ADMIN_SUMMARY_STAT_LABELS = [
  "총 방문자수",
  "총 매출액",
  "총 주문수",
  "추천 구매 전환율",
  "품절 상품수",
] as const;

export function getPlaceholderAdminStats(): AdminStatCard[] {
  return ADMIN_SUMMARY_STAT_LABELS.map((label) => ({
    label,
    value: "-",
  }));
}

/** GET /api/v1/admin/analytics/performance-summary → 운영 요약 카드 */
export function mapAnalyticsSummaryToStats(data: AnalyticsSummaryData): AdminStatCard[] {
  const summary = data.summary;

  return [
    {
      label: ADMIN_SUMMARY_STAT_LABELS[0],
      value: formatCount(summary.totalVisitorCount, "명"),
    },
    {
      label: ADMIN_SUMMARY_STAT_LABELS[1],
      value: formatCount(summary.totalSalesAmount, "원"),
    },
    {
      label: ADMIN_SUMMARY_STAT_LABELS[2],
      value: formatCount(summary.totalOrderCount, "개"),
    },
    {
      label: ADMIN_SUMMARY_STAT_LABELS[3],
      value: formatPercent(summary.recommendationConversionRate),
    },
    {
      label: ADMIN_SUMMARY_STAT_LABELS[4],
      value: formatCount(summary.outOfStockCount, "개"),
    },
  ];
}

/** GET /api/v1/admin/analytics/zones/visit-rates → 구역별 방문 히트맵 */
export function mapZoneVisitRatesToMatrix(data: ZoneVisitRateData): AdminZoneMatrix {
  const matrix = buildEmptyZoneMatrix();

  for (const item of data.zoneVisitRates ?? []) {
    const zoneKey = resolveZoneKey(item.zoneId, item.zoneName);
    if (!zoneKey) {
      continue;
    }

    matrix[zoneKey] = {
      ...matrix[zoneKey],
      visitors: mapZoneVisitRateToTraffic(item),
    };
  }

  for (const movement of data.zoneMovements ?? []) {
    const fromKey = resolveZoneKey(movement.fromZoneId, movement.fromZoneName);
    const toKey = resolveZoneKey(movement.toZoneId, movement.toZoneName);

    if (!fromKey || !toKey || fromKey === toKey) {
      continue;
    }

    matrix[fromKey] = {
      ...matrix[fromKey],
      flows: {
        ...matrix[fromKey].flows,
        [toKey]: mapZoneMovementToTraffic(movement),
      },
    };
  }

  return matrix;
}