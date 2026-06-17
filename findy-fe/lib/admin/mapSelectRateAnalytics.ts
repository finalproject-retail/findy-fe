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

type AdminPromoProductWithPromotion = AdminPromoProduct & {
  promotionName?: string | null;
  promotionType?: string | null;
  promotionLabel?: string | null;
};

type PromotionProductRow = {
  productId: number;
  name: string;
  promoType: AdminPromoType;
  promotionName?: string | null;
  promotionType?: string | null;
  promotionLabel?: string | null;
  selectionRate: number;
  purchaseRate: number;
  impressionCount: number;
  image: AdminPromoProduct["image"];
};

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

function readNumber(item: unknown, keys: string[]): number | null {
  const record = toRecord(item);

  if (!record) {
    return null;
  }

  for (const key of keys) {
    if (!(key in record)) {
      continue;
    }

    const value = toFiniteNumber(record[key]);

    if (value != null) {
      return value;
    }
  }

  return null;
}

function readRate(item: unknown, keys: string[]): number | null {
  const record = toRecord(item);

  if (!record) {
    return null;
  }

  for (const key of keys) {
    if (!(key in record)) {
      continue;
    }

    const value = normalizeRate(record[key]);

    if (value != null) {
      return value;
    }
  }

  return null;
}

function readString(item: unknown, keys: string[]): string | undefined {
  const record = toRecord(item);

  if (!record) {
    return undefined;
  }

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
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

function rateFromCountKeys(
  item: unknown,
  numeratorKeys: string[],
  denominatorKeys: string[],
): number | null {
  const numerator = readNumber(item, numeratorKeys);
  const denominator = readNumber(item, denominatorKeys);

  return rateFromCounts(numerator, denominator);
}

function getProductId(item: unknown): number {
  return readNumber(item, ["productId"]) ?? 0;
}

function getProductName(...items: unknown[]): string {
  for (const item of items) {
    const value = readString(item, ["productName", "name"]);

    if (value && isValidProductName(value)) {
      return value;
    }
  }

  return "상품명 미등록";
}

function isValidProductName(name: string): boolean {
  const normalized = name.trim();

  if (!normalized) {
    return false;
  }

  if (normalized === "상품명 미등록" || normalized === "상품명 확인 필요") {
    return false;
  }

  if (normalized.startsWith("시드_")) {
    return false;
  }

  return true;
}

function getPromotionName(item: unknown): string | undefined {
  return readString(item, ["promotionName", "promoName", "eventName"]);
}

function getPromotionType(item: unknown): string | undefined {
  return readString(item, ["promotionType", "promoType", "eventType"]);
}

function getPromotionLabel(item: unknown): string | undefined {
  return readString(item, ["promotionLabel", "promoLabel", "eventLabel"]);
}

function getImageSource(
  fallbackIndex: number,
  ...items: unknown[]
): AdminPromoProduct["image"] {
  for (const item of items) {
    const imageUrl = readString(item, [
      "imageUrl",
      "productImageUrl",
      "thumbnailUrl",
      "thumbnail",
    ]);

    if (imageUrl) {
      return { uri: imageUrl } as AdminPromoProduct["image"];
    }
  }

  return getAdminProductImage(fallbackIndex);
}

function inferPromoTypeFromPromotionName(
  promotionName?: string | null,
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
    name.includes("2+1") ||
    name.includes("투플러스") ||
    name.includes("증정") ||
    name.includes("사은") ||
    name.includes("gift") ||
    name.includes("bundle") ||
    name.includes("묶음") ||
    name.includes("덤")
  ) {
    return "bundle";
  }

  return "discount";
}

function toPromoType(
  promotionType?: string | null,
  promotionName?: string | null,
): AdminPromoType {
  const normalized = promotionType?.trim().toUpperCase();

  switch (normalized) {
    case "ONE_PLUS_ONE":
    case "ONE_PLUS":
    case "ONE_PLUS_ONE_EVENT":
    case "1_PLUS_1":
    case "1+1":
    case "BOGO":
      return "onePlusOne";

    case "TWO_PLUS_ONE":
    case "TWO_PLUS":
    case "2_PLUS_1":
    case "2+1":
    case "GIFT":
    case "GIVEAWAY":
    case "BUNDLE":
    case "PACKAGE":
      return "bundle";

    case "DISCOUNT":
    case "COUPON":
    case "CLEARANCE":
      return "discount";

    default:
      return inferPromoTypeFromPromotionName(promotionName);
  }
}

function resolvePromotionLabel(
  promotionType?: string | null,
  promotionLabel?: string | null,
  promotionName?: string | null,
): string | null {
  if (promotionLabel && promotionLabel.trim().length > 0) {
    return promotionLabel.trim();
  }

  const normalized = promotionType?.trim().toUpperCase();

  switch (normalized) {
    case "ONE_PLUS_ONE":
    case "ONE_PLUS":
    case "ONE_PLUS_ONE_EVENT":
    case "1_PLUS_1":
    case "1+1":
    case "BOGO":
      return "1+1";

    case "TWO_PLUS_ONE":
    case "TWO_PLUS":
    case "2_PLUS_1":
    case "2+1":
      return "2+1";

    case "GIFT":
    case "GIVEAWAY":
      return "증정 행사";

    case "BUNDLE":
    case "PACKAGE":
      return "묶음 행사";

    case "COUPON":
      return "쿠폰 행사";

    case "CLEARANCE":
      return "마감 할인";

    case "DISCOUNT":
      return "할인 행사";

    default:
      break;
  }

  const name = promotionName?.trim();

  if (name?.includes("1+1")) {
    return "1+1";
  }

  if (name?.includes("2+1")) {
    return "2+1";
  }

  if (name?.includes("증정") || name?.includes("사은")) {
    return "증정 행사";
  }

  if (name?.includes("묶음")) {
    return "묶음 행사";
  }

  return null;
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

function getSelectionRate(
  selectRateItem?: PromotionSelectRateApiDto,
  clickItem?: RecommendationClickRateProductDto,
  conversionItem?: RecommendationPurchaseConversionProductDto,
): number {
  return (
    rateFromCountKeys(
      selectRateItem,
      ["selectedCount", "selectionCount", "clickCount"],
      ["impressionCount"],
    ) ??
    readRate(selectRateItem, ["selectRate", "selectionRate", "clickRate"]) ??
    rateFromCountKeys(clickItem, ["clickCount"], ["impressionCount"]) ??
    readRate(clickItem, ["clickRate"]) ??
    rateFromCountKeys(conversionItem, ["clickCount"], ["impressionCount"]) ??
    0
  );
}

function getPurchaseRate(
  selectRateItem?: PromotionSelectRateApiDto,
  conversionItem?: RecommendationPurchaseConversionProductDto,
): number {
  return (
    rateFromCountKeys(selectRateItem, ["purchaseCount"], ["impressionCount"]) ??
    readRate(selectRateItem, [
      "purchaseRate",
      "conversionRate",
      "purchaseConversionRate",
    ]) ??
    rateFromCountKeys(conversionItem, ["purchaseCount"], ["impressionCount"]) ??
    readRate(conversionItem, ["purchaseConversionRate", "clickToPurchaseRate"]) ??
    0
  );
}

function getImpressionCount(
  selectRateItem?: PromotionSelectRateApiDto,
  clickItem?: RecommendationClickRateProductDto,
  conversionItem?: RecommendationPurchaseConversionProductDto,
): number {
  return (
    readNumber(selectRateItem, ["impressionCount"]) ??
    readNumber(clickItem, ["impressionCount"]) ??
    readNumber(conversionItem, ["impressionCount"]) ??
    0
  );
}

function shouldShowPromotionRow(row: PromotionProductRow): boolean {
  if (row.productId <= 0) {
    return false;
  }

  if (!isValidProductName(row.name)) {
    return false;
  }

  if (row.impressionCount < 10) {
    return false;
  }

  if (row.selectionRate <= 0 || row.purchaseRate <= 0) {
    return false;
  }

  if (row.purchaseRate > row.selectionRate) {
    return false;
  }

  return true;
}

function sortPromotionRows(
  rows: PromotionProductRow[],
): PromotionProductRow[] {
  return [...rows].sort((a, b) => {
    const purchaseDiff = b.purchaseRate - a.purchaseRate;

    if (purchaseDiff !== 0) {
      return purchaseDiff;
    }

    const selectionDiff = b.selectionRate - a.selectionRate;

    if (selectionDiff !== 0) {
      return selectionDiff;
    }

    const impressionDiff = b.impressionCount - a.impressionCount;

    if (impressionDiff !== 0) {
      return impressionDiff;
    }

    return a.productId - b.productId;
  });
}

function toAdminPromoProducts(
  rows: PromotionProductRow[],
): AdminPromoProduct[] {
  const mapped: AdminPromoProductWithPromotion[] = rows.map((item, index) => ({
    rank: index + 1,
    name: item.name,
    productId: String(item.productId),
    promoType: item.promoType,
    promotionName: item.promotionName,
    promotionType: item.promotionType,
    promotionLabel: item.promotionLabel,
    selectionRate: item.selectionRate,
    purchaseRate: item.purchaseRate,
    image: item.image,
  }));

  return mapped;
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

  const sourceProductIds = params.promotionSelectRates.length > 0
    ? params.promotionSelectRates.map((item) => item.productId)
    : [
        ...(params.clickRateData.products ?? []).map((item) => item.productId),
        ...(params.purchaseConversionData.products ?? []).map(
          (item) => item.productId,
        ),
      ];

  const productIds = Array.from(new Set(sourceProductIds)).filter(
    (productId) => productId > 0,
  );

  const rows = productIds.map((productId, index) => {
    const selectRateItem = promotionMetaByProductId.get(productId);
    const clickItem = clickByProductId.get(productId);
    const conversionItem = conversionByProductId.get(productId);

    const promotionName = getPromotionName(selectRateItem);
    const promotionType = getPromotionType(selectRateItem);
    const promotionLabel = resolvePromotionLabel(
      promotionType,
      getPromotionLabel(selectRateItem),
      promotionName,
    );

    const selectionRate = getSelectionRate(
      selectRateItem,
      clickItem,
      conversionItem,
    );

    const rawPurchaseRate = getPurchaseRate(selectRateItem, conversionItem);

    const purchaseRate =
      selectionRate > 0
        ? Math.min(rawPurchaseRate, selectionRate)
        : rawPurchaseRate;

    return {
      productId,
      name: getProductName(selectRateItem, clickItem, conversionItem),
      promoType: toPromoType(promotionType, promotionName),
      promotionName,
      promotionType,
      promotionLabel,
      selectionRate,
      purchaseRate,
      impressionCount: getImpressionCount(
        selectRateItem,
        clickItem,
        conversionItem,
      ),
      image: getImageSource(index, selectRateItem, clickItem, conversionItem),
    };
  });

  const strictRows = rows.filter(shouldShowPromotionRow);

  return toAdminPromoProducts(sortPromotionRows(strictRows));
}

export function mapPromotionSelectRatesToProducts(
  items: PromotionSelectRateApiDto[],
): AdminPromoProduct[] {
  const rows = items.map((item, index) => {
    const promotionName = getPromotionName(item);
    const promotionType = getPromotionType(item);
    const promotionLabel = resolvePromotionLabel(
      promotionType,
      getPromotionLabel(item),
      promotionName,
    );

    const selectionRate = getSelectionRate(item);
    const rawPurchaseRate = getPurchaseRate(item);
    const purchaseRate =
      selectionRate > 0
        ? Math.min(rawPurchaseRate, selectionRate)
        : rawPurchaseRate;

    return {
      productId: getProductId(item),
      name: getProductName(item),
      promoType: toPromoType(promotionType, promotionName),
      promotionName,
      promotionType,
      promotionLabel,
      selectionRate,
      purchaseRate,
      impressionCount: readNumber(item, ["impressionCount"]) ?? 0,
      image: getImageSource(index, item),
    };
  });

  const strictRows = rows.filter(shouldShowPromotionRow);

  return toAdminPromoProducts(sortPromotionRows(strictRows));
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