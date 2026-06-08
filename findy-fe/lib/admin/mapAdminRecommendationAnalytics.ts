import type {
  RecommendationPurchaseConversionData,
  RecommendationPurchaseConversionProductDto,
} from "@/lib/admin/api/types";
import { getAdminProductImage } from "@/lib/admin/mockAdminProductAssets";
import type {
  AdminFunnelStep,
  AdminPromoProduct,
} from "@/lib/admin/mockDashboardData";

function toPercentDisplay(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value > 0 && value <= 1) {
    return Math.round(value * 1000) / 10;
  }
  return Math.round(value * 10) / 10;
}

function rateFromCounts(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }
  return Math.round((numerator / denominator) * 1000) / 10;
}

/** 품절 대응 — SUBSTITUTE 구매 전환 요약 */
export function mapSubstituteConversionToFunnel(
  data: RecommendationPurchaseConversionData,
): {
  steps: AdminFunnelStep[];
  finalConversionRate: string;
} {
  const impression = Math.max(0, data.impressionCount ?? 0);
  const click = Math.max(0, data.clickCount ?? 0);
  const purchase = Math.max(0, data.purchaseCount ?? 0);

  const selectionPercent = rateFromCounts(click, impression);
  const purchasePercent = rateFromCounts(purchase, impression);

  return {
    steps: [
      { label: "1. 대체 상품 노출", percent: 100 },
      { label: "2. 대체 상품 선택", percent: selectionPercent },
      { label: "3. 대체 상품 구매", percent: purchasePercent },
    ],
    finalConversionRate: `${purchasePercent}%`,
  };
}

function mapPromoProduct(
  item: RecommendationPurchaseConversionProductDto,
  rank: number,
): AdminPromoProduct {
  const selectionRate =
    item.impressionCount > 0
      ? rateFromCounts(item.clickCount, item.impressionCount)
      : toPercentDisplay(Number(item.clickToPurchaseRate));

  return {
    rank,
    name: item.productName,
    productId: String(item.productId),
    promoType: "discount",
    selectionRate,
    purchaseRate: toPercentDisplay(Number(item.purchaseConversionRate)),
    image: getAdminProductImage(rank - 1),
  };
}

/** 행사 상품 — AI_PERSONALIZED_PROMOTION 상품 목록 */
export function mapPromotionConversionToProducts(
  data: RecommendationPurchaseConversionData,
): AdminPromoProduct[] {
  const products = data.products ?? [];
  const sorted = [...products].sort((a, b) => {
    const rateA =
      a.impressionCount > 0 ? a.clickCount / a.impressionCount : 0;
    const rateB =
      b.impressionCount > 0 ? b.clickCount / b.impressionCount : 0;
    return rateB - rateA;
  });

  return sorted.map((item, index) => mapPromoProduct(item, index + 1));
}
