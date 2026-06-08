import type { ImageSourcePropType } from "react-native";

export type AdminProductCategoryFilter =
  | "all"
  | "fresh"
  | "processed"
  | "bakery"
  | "beverage"
  | "lifestyle";

export const ADMIN_PRODUCT_CATEGORY_FILTERS: {
  key: AdminProductCategoryFilter;
  label: string;
}[] = [
  { key: "all", label: "전체" },
  { key: "fresh", label: "신선" },
  { key: "processed", label: "가공/냉동" },
  { key: "bakery", label: "베이커리/델리" },
  { key: "beverage", label: "음료/주류" },
  { key: "lifestyle", label: "라이프" },
];

export type AdminMonthlyViewPoint = {
  month: string;
  value: number;
};

export type AdminRecommendationFunnelStep = {
  label: string;
  percent: number;
};

/** 목록·상세 공통 상품 성과 (API 응답 스키마 기준) */
export type AdminProductPerformance = {
  productId: string;
  name: string;
  category: Exclude<AdminProductCategoryFilter, "all">;
  image: ImageSourcePropType;
  /** 목록·상세 — performance-summary.viewCount (기간 조회수) */
  views: number;
  /** 목록·상세 — viewToPurchaseRate 또는 추천 구매 전환율 */
  conversionRate: number;
  /** mock 전용 — API 연동 시 0 */
  todayViews: number;
  /** mock 전용 — API 연동 시 0 */
  yearlyViews: number;
  /** 상세 — dailyTrends 기반 월별 추이 (API) */
  monthlyViews: AdminMonthlyViewPoint[];
  /** 상세 — 추천 후 구매 전환 퍼널 */
  funnelSteps: AdminRecommendationFunnelStep[];
  /** 상세 — purchase-conversion.impressionCount */
  impressionCount: number;
  /** 상세 — purchase-conversion.clickCount */
  clickCount: number;
  /** 상세 — purchase-conversion.purchaseCount */
  purchaseCount: number;
};

export function getAdminProductFinalConversionRate(product: AdminProductPerformance) {
  return `${product.conversionRate}%`;
}

export function formatAdminViewCount(value: number) {
  return `${value.toLocaleString("ko-KR")} 회`;
}

export function formatAdminMetricNumber(value: number) {
  return value.toLocaleString("ko-KR");
}
