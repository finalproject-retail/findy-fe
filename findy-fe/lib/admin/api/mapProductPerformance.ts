import { findSubCategory } from "@/components/category/categoryCatalog";
import type {
  AdminMonthlyViewPoint,
  AdminProductCategoryFilter,
  AdminProductPerformance,
  AdminRecommendationFunnelStep,
} from "@/lib/admin/adminProductPerformanceTypes";
import type {
  ProductPerformanceItemDto,
  RecommendationClickRateDto,
  RecommendationDailyTrendDto,
  RecommendationPurchaseConversionDto,
} from "@/lib/admin/api/types";
import { parseAdminRate } from "@/lib/admin/api/adminApiUtils";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import type { ImageSourcePropType } from "react-native";

const TOP_LABEL_TO_FILTER: Record<string, Exclude<AdminProductCategoryFilter, "all">> = {
  "신선 식품": "fresh",
  "가공/냉동 식품": "processed",
  "베이커리/델리": "bakery",
  "음료/주류": "beverage",
  "라이프 스타일": "lifestyle",
};

function mapCategoryIdToFilter(categoryId: number | null): Exclude<AdminProductCategoryFilter, "all"> {
  if (categoryId == null) return "processed";
  const found = findSubCategory(categoryId);
  if (!found) return "processed";
  return TOP_LABEL_TO_FILTER[found.top.label] ?? "processed";
}

function formatProductName(item: ProductPerformanceItemDto) {
  const brand = item.brandName?.trim();
  const name = item.productName?.trim() ?? "";
  if (!brand) return name;
  return name.startsWith("[") ? name : `[${brand}] ${name}`;
}

function formatAdminProductName(brandName: string | null | undefined, productName: string) {
  const brand = brandName?.trim();
  const name = productName.trim();
  if (!brand) return name;
  return name.startsWith("[") ? name : `[${brand}] ${name}`;
}

export function mapAdminProductListItem(
  product: {
    productId: number;
    categoryId: number | null;
    brandName: string | null;
    productName: string;
    imageUrl: string | null;
  },
  performanceById: Map<number, ProductPerformanceItemDto>,
): AdminProductPerformance {
  const perf = performanceById.get(product.productId);
  const conversionRate = perf ? parseAdminRate(perf.viewToPurchaseRate) : 0;

  return {
    productId: String(product.productId),
    name: formatAdminProductName(product.brandName, product.productName),
    category: mapCategoryIdToFilter(product.categoryId),
    image: resolveProductImageSource(product.imageUrl),
    views: perf?.viewCount ?? 0,
    conversionRate,
    todayViews: 0,
    yearlyViews: 0,
    monthlyViews: [],
    funnelSteps: [],
    impressionCount: 0,
    clickCount: 0,
    purchaseCount: 0,
  };
}

function buildMonthlyTrendFromDaily(
  dailyTrends: RecommendationDailyTrendDto[],
): AdminMonthlyViewPoint[] {
  const monthMap = new Map<string, number>();

  for (const trend of dailyTrends) {
    const month = Number(trend.analysisDate.split("-")[1]);
    if (!Number.isFinite(month)) continue;
    const label = `${month}월`;
    monthMap.set(label, (monthMap.get(label) ?? 0) + trend.impressionCount);
  }

  return Array.from({ length: 12 }, (_, index) => {
    const label = `${index + 1}월`;
    return { month: label, value: monthMap.get(label) ?? 0 };
  });
}

function buildFunnelSteps(
  clickRate: RecommendationClickRateDto | null,
  purchaseConversion: RecommendationPurchaseConversionDto | null,
): AdminRecommendationFunnelStep[] {
  const impressionCount = purchaseConversion?.impressionCount ?? clickRate?.impressionCount ?? 0;
  const clickCount = purchaseConversion?.clickCount ?? clickRate?.clickCount ?? 0;
  const purchaseCount = purchaseConversion?.purchaseCount ?? 0;

  const clickPercent =
    impressionCount > 0
      ? Number(((clickCount / impressionCount) * 100).toFixed(1))
      : parseAdminRate(clickRate?.clickRate);
  const purchasePercent = parseAdminRate(purchaseConversion?.purchaseConversionRate);

  return [
    { label: "추천 상품 노출", percent: 100 },
    { label: "클릭률", percent: clickPercent },
    { label: "구매 전환", percent: purchasePercent },
  ];
}

export function mapPerformanceItemToSummary(
  item: ProductPerformanceItemDto,
  image?: ImageSourcePropType,
): AdminProductPerformance {
  const conversionRate = parseAdminRate(item.viewToPurchaseRate);

  return {
    productId: String(item.productId),
    name: formatProductName(item),
    category: mapCategoryIdToFilter(item.categoryId),
    image: image ?? resolveProductImageSource(null),
    views: item.viewCount,
    conversionRate,
    todayViews: 0,
    yearlyViews: 0,
    monthlyViews: [],
    funnelSteps: [],
    impressionCount: 0,
    clickCount: 0,
    purchaseCount: 0,
  };
}

export function mapPerformanceDetail(
  summary: ProductPerformanceItemDto | null,
  options: {
    productId: string;
    name: string;
    categoryId: number | null;
    image: ImageSourcePropType;
    clickRate: RecommendationClickRateDto | null;
    purchaseConversion: RecommendationPurchaseConversionDto | null;
  },
): AdminProductPerformance {
  const conversionRate = summary
    ? parseAdminRate(summary.viewToPurchaseRate)
    : parseAdminRate(options.purchaseConversion?.purchaseConversionRate);

  const funnelSteps = buildFunnelSteps(options.clickRate, options.purchaseConversion);
  const monthlyViews = buildMonthlyTrendFromDaily(
    options.purchaseConversion?.dailyTrends ?? [],
  );

  return {
    productId: options.productId,
    name: options.name,
    category: mapCategoryIdToFilter(options.categoryId ?? summary?.categoryId ?? null),
    image: options.image,
    views: summary?.viewCount ?? 0,
    conversionRate,
    todayViews: 0,
    yearlyViews: 0,
    monthlyViews,
    funnelSteps,
    impressionCount: options.purchaseConversion?.impressionCount ?? 0,
    clickCount: options.purchaseConversion?.clickCount ?? 0,
    purchaseCount: options.purchaseConversion?.purchaseCount ?? 0,
  };
}
