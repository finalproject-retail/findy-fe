import type {
  AdminFunnelStep,
  AdminPromoProduct,
  AdminPromoType,
} from "@/lib/admin/mockDashboardData";
import { getAdminProductImage } from "@/lib/admin/mockAdminProductAssets";
import type {
  PromotionSelectRateApiDto,
  RecommendationClickRateData,
  RecommendationClickRateProductDto,
  RecommendationPurchaseConversionData,
  RecommendationPurchaseConversionProductDto,
} from "@/lib/admin/api/types";

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function toFiniteNumber(value: unknown): number | null {
  const numberValue = Number(value ?? 0);

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return numberValue;
}

function roundPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 10) / 10;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, roundPercent(value)));
}

function normalizeRate(value: unknown): number | null {
  const numberValue = toFiniteNumber(value);

  if (numberValue == null) {
    return null;
  }

  if (numberValue > 0 && numberValue <= 1) {
    return clampPercent(numberValue * 100);
  }

  return clampPercent(numberValue);
}

function rateFromCounts(
  numerator: unknown,
  denominator: unknown,
): number | null {
  const n = toFiniteNumber(numerator);
  const d = toFiniteNumber(denominator);

  if (n == null || d == null || d <= 0) {
    return null;
  }

  return clampPercent((n / d) * 100);
}

function getProductId(item: unknown): number {
  const record = toRecord(item);
  const value = toFiniteNumber(record?.productId);

  return value ?? 0;
}

function getProductName(item: unknown): string {
  const record = toRecord(item);
  const value = record?.productName;

  return typeof value === "string" && value.trim().length > 0
    ? value
    : "상품명 미등록";
}

function getPromotionName(item: unknown): string | undefined {
  const record = toRecord(item);
  const value = record?.promotionName;

  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}

function inferPromoTypeFromPromotionName(
  promotionName?: string,
): AdminPromoType {
  const name = promotionName?.trim().toLowerCase() ?? "";

  if (
    name.includes("1+1") ||
    name.includes("원플러스") ||
    name.includes("one plus") ||
    name.includes("bogo")
  ) {
    return "onePlusOne";
  }

  if (
    name.includes("증정") ||
    name.includes("사은") ||
    name.includes("gift") ||
    name.includes("bundle") ||
    name.includes("덤")
  ) {
    return "bundle";
  }

  return "discount";
}

function buildMapByProductId<T extends { productId: number }>(
  items: T[] | undefined,
): Map<number, T> {
  const map = new Map<number, T>();

  for (const item of items ?? []) {
    if (item.productId != null && !map.has(item.productId)) {
      map.set(item.productId, item);
    }
  }

  return map;
}

function getClickRate(
  clickItem?: RecommendationClickRateProductDto,
  conversionItem?: RecommendationPurchaseConversionProductDto,
  selectRateItem?: PromotionSelectRateApiDto,
): number {
  return (
    rateFromCounts(clickItem?.clickCount, clickItem?.impressionCount) ??
    normalizeRate(clickItem?.clickRate) ??
    rateFromCounts(conversionItem?.clickCount, conversionItem?.impressionCount) ??
    rateFromCounts(
      selectRateItem?.selectedCount ?? selectRateItem?.selectionCount,
      selectRateItem?.impressionCount,
    ) ??
    normalizeRate(selectRateItem?.selectRate ?? selectRateItem?.selectionRate) ??
    0
  );
}

function getPurchaseRate(
  conversionItem?: RecommendationPurchaseConversionProductDto,
  selectRateItem?: PromotionSelectRateApiDto,
): number {
  return (
    rateFromCounts(conversionItem?.purchaseCount, conversionItem?.impressionCount) ??
    normalizeRate(conversionItem?.purchaseConversionRate) ??
    rateFromCounts(selectRateItem?.purchaseCount, selectRateItem?.impressionCount) ??
    normalizeRate(selectRateItem?.conversionRate) ??
    0
  );
}

function getImpressionCount(
  clickItem?: RecommendationClickRateProductDto,
  conversionItem?: RecommendationPurchaseConversionProductDto,
  selectRateItem?: PromotionSelectRateApiDto,
): number {
  return (
    toFiniteNumber(clickItem?.impressionCount) ??
    toFiniteNumber(conversionItem?.impressionCount) ??
    toFiniteNumber(selectRateItem?.impressionCount) ??
    0
  );
}

export function mapPromotionAnalyticsToProducts(params: {
  promotionSelectRates: PromotionSelectRateApiDto[];
  clickRateData: RecommendationClickRateData;
  purchaseConversionData: RecommendationPurchaseConversionData;
}): AdminPromoProduct[] {
  const promotionMetaByProductId = buildMapByProductId(
    params.promotionSelectRates,
  );
  const clickByProductId = buildMapByProductId(params.clickRateData.products);
  const conversionByProductId = buildMapByProductId(
    params.purchaseConversionData.products,
  );

  const productIds = Array.from(
    new Set([
      ...params.promotionSelectRates.map((item) => item.productId),
      ...(params.clickRateData.products ?? []).map((item) => item.productId),
      ...(params.purchaseConversionData.products ?? []).map(
        (item) => item.productId,
      ),
    ]),
  ).filter((productId) => productId > 0);

  const rows = productIds.map((productId) => {
    const selectRateItem = promotionMetaByProductId.get(productId);
    const clickItem = clickByProductId.get(productId);
    const conversionItem = conversionByProductId.get(productId);

    const selectionRate = getClickRate(
      clickItem,
      conversionItem,
      selectRateItem,
    );

    const rawPurchaseRate = getPurchaseRate(conversionItem, selectRateItem);

    const purchaseRate =
      selectionRate > 0
        ? Math.min(rawPurchaseRate, selectionRate)
        : rawPurchaseRate;

    return {
      productId,
      name:
        getProductName(selectRateItem) ||
        getProductName(clickItem) ||
        getProductName(conversionItem),
      promoType: inferPromoTypeFromPromotionName(
        getPromotionName(selectRateItem),
      ),
      selectionRate,
      purchaseRate,
      impressionCount: getImpressionCount(
        clickItem,
        conversionItem,
        selectRateItem,
      ),
    };
  });

  const sorted = rows.sort((a, b) => {
    const impressionDiff = b.impressionCount - a.impressionCount;

    if (impressionDiff !== 0) {
      return impressionDiff;
    }

    const selectionDiff = b.selectionRate - a.selectionRate;

    if (selectionDiff !== 0) {
      return selectionDiff;
    }

    return b.purchaseRate - a.purchaseRate;
  });

  return sorted.map((item, index) => ({
    rank: index + 1,
    name: item.name,
    productId: String(item.productId),
    promoType: item.promoType,
    selectionRate: item.selectionRate,
    purchaseRate: item.purchaseRate,
    image: getAdminProductImage(index),
  }));
}

export function mapPromotionSelectRatesToProducts(
  items: PromotionSelectRateApiDto[],
): AdminPromoProduct[] {
  const sorted = [...items].sort((a, b) => {
    const aSelection =
      rateFromCounts(
        a.selectedCount ?? a.selectionCount,
        a.impressionCount,
      ) ??
      normalizeRate(a.selectRate ?? a.selectionRate) ??
      0;

    const bSelection =
      rateFromCounts(
        b.selectedCount ?? b.selectionCount,
        b.impressionCount,
      ) ??
      normalizeRate(b.selectRate ?? b.selectionRate) ??
      0;

    return bSelection - aSelection;
  });

  return sorted.map((item, index) => {
    const selectionRate =
      rateFromCounts(
        item.selectedCount ?? item.selectionCount,
        item.impressionCount,
      ) ??
      normalizeRate(item.selectRate ?? item.selectionRate) ??
      0;

    const purchaseRate =
      rateFromCounts(item.purchaseCount, item.impressionCount) ??
      normalizeRate(item.conversionRate) ??
      0;

    return {
      rank: index + 1,
      name: item.productName,
      productId: String(item.productId),
      promoType: inferPromoTypeFromPromotionName(item.promotionName ?? undefined),
      selectionRate,
      purchaseRate:
        selectionRate > 0 ? Math.min(purchaseRate, selectionRate) : purchaseRate,
      image: getAdminProductImage(index),
    };
  });
}

function sumMetric(items: PromotionSelectRateApiDto[], keys: string[]): number {
  return items.reduce((sum, item) => {
    const record = toRecord(item);

    if (!record) {
      return sum;
    }

    for (const key of keys) {
      const value = toFiniteNumber(record[key]);

      if (value != null && value > 0) {
        return sum + value;
      }
    }

    return sum;
  }, 0);
}

export function mapSubstituteSelectRatesToFunnel(
  items: PromotionSelectRateApiDto[],
): {
  steps: AdminFunnelStep[];
  finalConversionRate: string;
} {
  const impressionTotal = sumMetric(items, ["impressionCount"]);
  const selectedTotal = sumMetric(items, [
    "clickCount",
    "selectedCount",
    "selectionCount",
  ]);
  const purchaseTotal = sumMetric(items, ["purchaseCount"]);

  const selectionPercent =
    impressionTotal > 0
      ? clampPercent((selectedTotal / impressionTotal) * 100)
      : 0;

  const purchasePercent =
    impressionTotal > 0
      ? Math.min(
          clampPercent((purchaseTotal / impressionTotal) * 100),
          selectionPercent,
        )
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