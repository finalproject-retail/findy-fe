import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import {
  getAdminProductImage,
  getAdminProductName,
} from "@/lib/admin/mockAdminProductAssets";
import type {
  AdminMonthlyViewPoint,
  AdminProductCategoryFilter,
  AdminProductPerformance,
  AdminRecommendationFunnelStep,
} from "@/lib/admin/adminProductPerformanceTypes";

export type {
  AdminMonthlyViewPoint,
  AdminProductCategoryFilter,
  AdminProductPerformance,
  AdminRecommendationFunnelStep,
} from "@/lib/admin/adminProductPerformanceTypes";

export {
  ADMIN_PRODUCT_CATEGORY_FILTERS,
  formatAdminMetricNumber,
  formatAdminViewCount,
  getAdminProductFinalConversionRate,
} from "@/lib/admin/adminProductPerformanceTypes";

const MOCK_CATEGORIES: Exclude<AdminProductCategoryFilter, "all">[] = [
  "processed",
  "processed",
  "processed",
  "processed",
  "fresh",
  "processed",
  "processed",
  "processed",
  "processed",
  "processed",
  "fresh",
  "fresh",
  "processed",
  "processed",
  "bakery",
  "processed",
  "processed",
  "processed",
  "processed",
  "beverage",
  "bakery",
  "bakery",
  "beverage",
  "beverage",
  "lifestyle",
];

const MONTHLY_VIEWS_TEMPLATE: AdminMonthlyViewPoint[] = [
  { month: "1월", value: 420 },
  { month: "2월", value: 680 },
  { month: "3월", value: 540 },
  { month: "4월", value: 760 },
  { month: "5월", value: 920 },
  { month: "6월", value: 880 },
  { month: "7월", value: 640 },
  { month: "8월", value: 710 },
  { month: "9월", value: 830 },
  { month: "10월", value: 960 },
  { month: "11월", value: 890 },
  { month: "12월", value: 1000 },
];

function buildMonthlyViews(index: number): AdminMonthlyViewPoint[] {
  return MONTHLY_VIEWS_TEMPLATE.map((point, monthIndex) => ({
    ...point,
    value: Math.round(point.value * (0.85 + ((index + monthIndex) % 5) * 0.05)),
  }));
}

function buildFunnelSteps(conversionRate: number): AdminRecommendationFunnelStep[] {
  const clickRate = Number(Math.min(95, conversionRate * 4.1).toFixed(1));
  const cartRate = Number(Math.min(clickRate - 4, conversionRate * 2.1).toFixed(1));

  return [
    { label: "추천 상품 노출", percent: 100 },
    { label: "클릭률", percent: clickRate },
    { label: "쇼핑리스트 추가", percent: cartRate },
    { label: "구매 전환", percent: conversionRate },
  ];
}

function buildMockProduct(index: number): AdminProductPerformance {
  const rank = index + 1;
  const views = 1432 - index * 47 + (index % 3) * 18;
  const conversionRate = Number(
    Math.max(13.2 - index * 0.35 + (index % 4) * 0.4, 2.1).toFixed(1),
  );
  const todayViews = 120 + (index % 40);
  const yearlyViews = 18000 + (index % 12) * 420 + index * 110;
  const monthlyViews = buildMonthlyViews(index);
  const funnelSteps = buildFunnelSteps(conversionRate);

  return {
    productId: `fdsdf-${String(rank).padStart(3, "0")}`,
    name: getAdminProductName(index),
    category: MOCK_CATEGORIES[index % MOCK_CATEGORIES.length]!,
    image: getAdminProductImage(index),
    views: Math.max(views, 120),
    conversionRate,
    todayViews,
    yearlyViews,
    monthlyViews,
    funnelSteps,
    impressionCount: 0,
    clickCount: 0,
    purchaseCount: 0,
  };
}

function buildMockCatalog(count = 25): AdminProductPerformance[] {
  return Array.from({ length: count }, (_, index) => buildMockProduct(index));
}

/** 날짜 범위별 목업 캐시 — API 연동 시 React Query/SWR 키로 대체 */
const catalogCache = new Map<string, AdminProductPerformance[]>();

function getCatalogCacheKey(range: AdminDateRange) {
  return `${range.start}_${range.end}`;
}

function getAdminProductPerformanceCatalog(range: AdminDateRange): AdminProductPerformance[] {
  const cacheKey = getCatalogCacheKey(range);
  const cached = catalogCache.get(cacheKey);
  if (cached) return cached;

  const catalog = buildMockCatalog(25);
  catalogCache.set(cacheKey, catalog);
  return catalog;
}

/** GET /admin/products/performance — 목록 */
export function getAdminProductPerformanceList(
  range: AdminDateRange,
): AdminProductPerformance[] {
  return getAdminProductPerformanceCatalog(range);
}

/** GET /admin/products/performance/:productId — 상세 */
export function getAdminProductPerformanceDetail(
  productId: string,
  range: AdminDateRange,
): AdminProductPerformance | null {
  return (
    getAdminProductPerformanceCatalog(range).find(
      (product) => product.productId === productId,
    ) ?? null
  );
}

/** @deprecated getAdminProductPerformanceList 사용 */
export function getAdminProductPerformanceMock(
  range: AdminDateRange,
): AdminProductPerformance[] {
  return getAdminProductPerformanceList(range);
}

export function filterAdminProductPerformance(
  products: AdminProductPerformance[],
  query: string,
  category: AdminProductCategoryFilter,
): AdminProductPerformance[] {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    if (!matchesCategory) return false;
    if (!normalizedQuery) return true;

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.productId.toLowerCase().includes(normalizedQuery)
    );
  });
}
