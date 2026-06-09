import {
  getAdminProductImage,
  getAdminProductName,
} from "@/lib/admin/mockAdminProductAssets";
import type { ImageSourcePropType } from "react-native";

export type AdminDateRange = {
  start: string;
  end: string;
};

export type AdminStatCard = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
};

export type AdminZoneKey =
  | "fresh"
  | "processedFrozen"
  | "bakeryDeli"
  | "beverageAlcohol"
  | "lifestyle";

export type AdminZoneTraffic = {
  total: number;
  percent: number;
  male: { count: number; percent: number };
  female: { count: number; percent: number };
};

export type AdminZoneMatrix = Record<
  AdminZoneKey,
  {
    visitors: AdminZoneTraffic;
    flows: Partial<Record<AdminZoneKey, AdminZoneTraffic>>;
  }
>;

export type AdminFunnelStep = {
  label: string;
  percent: number;
};

export type AdminPromoType = "bundle" | "onePlusOne" | "discount";

export type AdminPromoProduct = {
  rank: number;
  name: string;
  productId: string;
  promoType: AdminPromoType;
  selectionRate: number;
  purchaseRate: number;
  image: ImageSourcePropType;
};

export type AdminDashboardData = {
  insight: string;
  stats: AdminStatCard[];
  zones: AdminZoneMatrix;
  funnel: AdminFunnelStep[];
  finalConversionRate: string;
  promoProducts: AdminPromoProduct[];
};

export const ADMIN_ZONE_LABELS: Record<AdminZoneKey, string> = {
  fresh: "신선 식품",
  processedFrozen: "가공/냉동 식품",
  bakeryDeli: "베이커리/델리",
  beverageAlcohol: "음료/주류",
  lifestyle: "라이프 스타일",
};

export const ADMIN_ZONE_ORDER: AdminZoneKey[] = [
  "fresh",
  "processedFrozen",
  "bakeryDeli",
  "beverageAlcohol",
  "lifestyle",
];

function traffic(
  total: number,
  percent: number,
  malePct: number,
): AdminZoneTraffic {
  const maleCount = Math.round(total * (malePct / 100));
  const femaleCount = total - maleCount;
  const femalePct = total > 0 ? Math.round((femaleCount / total) * 100) : 0;
  return {
    total,
    percent,
    male: { count: maleCount, percent: malePct },
    female: { count: femaleCount, percent: femalePct },
  };
}

export function getDefaultAdminDateRange(): AdminDateRange {
  return getRecentAdminDateRange(7);
}

/** 최근 N일 (오늘 포함) — API 기본 조회 기간 */
export function getRecentAdminDateRange(days = 7): AdminDateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - Math.max(days - 1, 0));

  return {
    start: formatAdminDate(start),
    end: formatAdminDate(end),
  };
}

function formatAdminDate(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

/** API 연동 전 목업 데이터 */
const MOCK_PROMO_TYPES: AdminPromoType[] = ["bundle", "onePlusOne", "discount"];

function buildMockPromoProducts(count = 20): AdminPromoProduct[] {
  return Array.from({ length: count }, (_, index) => {
    const rank = index + 1;
    const promoType = MOCK_PROMO_TYPES[index % MOCK_PROMO_TYPES.length]!;
    const selectionRate = 72 - (index % 6) * 3;
    const purchaseRate = 42 - (index % 5) * 2;

    return {
      rank,
      name: getAdminProductName(index),
      productId: `promo-${String(rank).padStart(3, "0")}`,
      promoType,
      selectionRate,
      purchaseRate,
      image: getAdminProductImage(index),
    };
  });
}

export function getAdminDashboardMock(_range: AdminDateRange): AdminDashboardData {
  return {
    insight:
      "5월 5일 매출이 가장 높았으며, 평소보다 방문객이 2배 많았습니다.",
    stats: [
      {
        label: "총 방문자수",
        value: "98,712명",
        delta: "+1,432",
        trend: "up",
      },
      {
        label: "총 매출액",
        value: "52,198,712원",
        delta: "+1,915,432",
        trend: "up",
      },
      {
        label: "총 주문수",
        value: "7,324개",
        delta: "+143개",
        trend: "up",
      },
      {
        label: "추천 구매 전환율",
        value: "45.3%",
        delta: "+13%",
        trend: "up",
      },
      {
        label: "품절 상품수",
        value: "20개",
        delta: "-13개",
        trend: "down",
      },
    ],
    zones: {
      fresh: {
        visitors: traffic(312, 68, 71),
        flows: {
          processedFrozen: traffic(58, 19, 74),
          bakeryDeli: traffic(42, 13, 63),
          beverageAlcohol: traffic(28, 9, 58),
          lifestyle: traffic(64, 21, 69),
        },
      },
      processedFrozen: {
        visitors: traffic(198, 43, 78),
        flows: {
          fresh: traffic(72, 36, 75),
          bakeryDeli: traffic(31, 16, 70),
          beverageAlcohol: traffic(48, 24, 82),
          lifestyle: traffic(35, 18, 77),
        },
      },
      bakeryDeli: {
        visitors: traffic(156, 34, 64),
        flows: {
          fresh: traffic(54, 35, 68),
          processedFrozen: traffic(38, 24, 72),
          beverageAlcohol: traffic(22, 14, 61),
          lifestyle: traffic(18, 12, 55),
        },
      },
      beverageAlcohol: {
        visitors: traffic(124, 27, 66),
        flows: {
          fresh: traffic(19, 15, 58),
          processedFrozen: traffic(41, 33, 80),
          bakeryDeli: traffic(24, 19, 62),
          lifestyle: traffic(28, 23, 71),
        },
      },
      lifestyle: {
        visitors: traffic(186, 41, 73),
        flows: {
          fresh: traffic(48, 26, 70),
          processedFrozen: traffic(52, 28, 79),
          bakeryDeli: traffic(21, 11, 57),
          beverageAlcohol: traffic(33, 18, 68),
        },
      },
    },
    funnel: [
      { label: "1. 대체 상품 노출", percent: 100 },
      { label: "2. 대체 상품 선택", percent: 78 },
      { label: "3. 대체 상품 구매", percent: 43 },
    ],
    finalConversionRate: "15.2%",
    promoProducts: buildMockPromoProducts(20),
  };
}

export const ADMIN_PROMO_LABELS: Record<AdminPromoType, string> = {
  bundle: "증정 행사",
  onePlusOne: "1+1 행사",
  discount: "할인 행사",
};
