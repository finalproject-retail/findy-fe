import { formatAdminDate } from "@/lib/admin/dateRange";
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
  delta?: string;
  trend?: "up" | "down";
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
  averageStayDuration: number;
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
  averageStayDuration: number,
): AdminZoneTraffic {
  return {
    total,
    percent,
    averageStayDuration,
  };
}

export function getDefaultAdminDateRange(): AdminDateRange {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    start: formatAdminDate(firstOfMonth),
    end: formatAdminDate(today),
  };
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
        visitors: traffic(312, 68, 420),
        flows: {
          processedFrozen: traffic(58, 19, 180),
          bakeryDeli: traffic(42, 13, 240),
          beverageAlcohol: traffic(28, 9, 150),
          lifestyle: traffic(64, 21, 300),
        },
      },
      processedFrozen: {
        visitors: traffic(198, 43, 360),
        flows: {
          fresh: traffic(72, 36, 210),
          bakeryDeli: traffic(31, 16, 190),
          beverageAlcohol: traffic(48, 24, 270),
          lifestyle: traffic(35, 18, 220),
        },
      },
      bakeryDeli: {
        visitors: traffic(156, 34, 510),
        flows: {
          fresh: traffic(54, 35, 200),
          processedFrozen: traffic(38, 24, 160),
          beverageAlcohol: traffic(22, 14, 130),
          lifestyle: traffic(18, 12, 140),
        },
      },
      beverageAlcohol: {
        visitors: traffic(124, 27, 280),
        flows: {
          fresh: traffic(19, 15, 170),
          processedFrozen: traffic(41, 33, 250),
          bakeryDeli: traffic(24, 19, 200),
          lifestyle: traffic(28, 23, 230),
        },
      },
      lifestyle: {
        visitors: traffic(186, 41, 390),
        flows: {
          fresh: traffic(48, 26, 220),
          processedFrozen: traffic(52, 28, 260),
          bakeryDeli: traffic(21, 11, 180),
          beverageAlcohol: traffic(33, 18, 210),
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
