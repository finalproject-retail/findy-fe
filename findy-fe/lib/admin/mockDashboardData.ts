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
  | "produce"
  | "bakery"
  | "seafood"
  | "petGarden"
  | "processed"
  | "kitchen"
  | "meat";

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
  produce: "농산물",
  bakery: "베이커리",
  seafood: "수산물",
  petGarden: "애완·원예",
  processed: "조리·가공식품",
  kitchen: "주방·욕실",
  meat: "축산물",
};

export const ADMIN_ZONE_ORDER: AdminZoneKey[] = [
  "produce",
  "bakery",
  "seafood",
  "petGarden",
  "processed",
  "kitchen",
  "meat",
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
  return { start: "26.05.01", end: "26.05.31" };
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
      produce: {
        visitors: traffic(239, 66, 73),
        flows: {
          bakery: traffic(28, 12, 64),
          seafood: traffic(19, 8, 58),
          petGarden: traffic(12, 5, 50),
          processed: traffic(35, 15, 71),
          kitchen: traffic(81, 34, 69),
          meat: traffic(22, 9, 55),
        },
      },
      bakery: {
        visitors: traffic(112, 31, 62),
        flows: {
          produce: traffic(41, 37, 66),
          processed: traffic(38, 34, 74),
          kitchen: traffic(21, 19, 57),
        },
      },
      seafood: {
        visitors: traffic(98, 27, 68),
        flows: {
          produce: traffic(44, 45, 70),
          meat: traffic(31, 32, 65),
          kitchen: traffic(15, 15, 60),
        },
      },
      petGarden: {
        visitors: traffic(76, 21, 55),
        flows: {
          produce: traffic(29, 38, 62),
          kitchen: traffic(18, 24, 56),
        },
      },
      processed: {
        visitors: traffic(140, 39, 86),
        flows: {
          produce: traffic(84, 60, 90),
          bakery: traffic(22, 16, 77),
          kitchen: traffic(19, 14, 84),
        },
      },
      kitchen: {
        visitors: traffic(158, 44, 75),
        flows: {
          produce: traffic(52, 33, 71),
          processed: traffic(41, 26, 80),
          meat: traffic(28, 18, 68),
        },
      },
      meat: {
        visitors: traffic(124, 34, 70),
        flows: {
          produce: traffic(48, 39, 73),
          seafood: traffic(26, 21, 65),
          kitchen: traffic(31, 25, 71),
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
