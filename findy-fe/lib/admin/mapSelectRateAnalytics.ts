import type {
  AdminFunnelStep,
  AdminPromoProduct,
  AdminPromoType,
} from "@/lib/admin/mockDashboardData";
import type { PromotionSelectRateApiDto } from "@/lib/admin/api/types";

function toPercentDisplay(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value > 0 && value <= 1) {
    return Math.round(value * 1000) / 10;
  }
  return Math.round(value * 10) / 10;
}

function inferPromoType(promotionName?: string): AdminPromoType {
  const name = promotionName?.trim().toLowerCase() ?? "";
  if (name.includes("1+1") || name.includes("원플러스")) {
    return "onePlusOne";
  }
  if (name.includes("증정")) {
    return "bundle";
  }
  return "discount";
}

export function mapPromotionSelectRatesToProducts(
  items: PromotionSelectRateApiDto[],
): AdminPromoProduct[] {
  const sorted = [...items].sort(
    (a, b) => toPercentDisplay(b.selectRate) - toPercentDisplay(a.selectRate),
  );

  return sorted.map((item, index) => ({
    rank: index + 1,
    name: item.productName,
    productId: String(item.productId),
    promoType: inferPromoType(item.promotionName),
    selectionRate: toPercentDisplay(item.selectRate),
    purchaseRate: toPercentDisplay(item.conversionRate),
  }));
}

export function mapSubstituteSelectRatesToFunnel(items: PromotionSelectRateApiDto[]): {
  steps: AdminFunnelStep[];
  finalConversionRate: string;
} {
  const impressionTotal = items.reduce(
    (sum, item) => sum + Math.max(0, item.impressionCount ?? 0),
    0,
  );
  const selectedTotal = items.reduce(
    (sum, item) => sum + Math.max(0, item.selectedCount ?? 0),
    0,
  );
  const purchaseTotal = items.reduce(
    (sum, item) => sum + Math.max(0, item.purchaseCount ?? 0),
    0,
  );

  const selectionPercent =
    impressionTotal > 0
      ? Math.round((selectedTotal / impressionTotal) * 1000) / 10
      : 0;
  const purchasePercent =
    impressionTotal > 0
      ? Math.round((purchaseTotal / impressionTotal) * 1000) / 10
      : 0;

  return {
    steps: [
      { label: "1. 대체 상품 노출", percent: 100 },
      { label: "2. 대체 상품 선택", percent: selectionPercent },
      { label: "3. 대체 상품 구매", percent: purchasePercent },
    ],
    finalConversionRate: `${purchasePercent}%`,
  };
}
