import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { AdminProductPerformance } from "@/lib/admin/adminProductPerformanceTypes";
import {
  adminAnalyticsClient,
  adminDateRangeToApiParams,
  unwrapAdminAnalytics,
} from "@/lib/admin/api/adminApiUtils";
import {
  mapAdminProductListItem,
  mapPerformanceDetail,
  mapPerformanceItemToSummary,
} from "@/lib/admin/api/mapProductPerformance";
import type {
  AdminAnalyticsApiEnvelope,
  AdminProductPageDto,
  AdminShoppingProductDto,
  FetchAdminProductsParams,
  ProductPerformanceItemDto,
  ProductPerformanceSummaryDto,
  RecommendationClickRateDto,
  RecommendationPurchaseConversionDto,
} from "@/lib/admin/api/types";
import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import {
  getAdminProductPerformanceList as getMockProductPerformanceList,
  getAdminProductPerformanceListPage as getMockProductPerformanceListPage,
  type AdminProductListPageResult,
} from "@/lib/admin/mockProductPerformanceData";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import type { ApiEnvelope } from "@/lib/shopping/types";

export type { AdminProductListPageResult } from "@/lib/admin/mockProductPerformanceData";

export const ADMIN_PRODUCT_LIST_PAGE_SIZE = 20;
const PERFORMANCE_SUMMARY_LIMIT = 100;

const PERFORMANCE_SUMMARY_PATH = "/api/v1/analytics/products/performance-summary";
const PURCHASE_CONVERSION_PATH = "/api/v1/analytics/purchase-conversion";
const CLICK_RATE_PATH = "/api/v1/analytics/recommendations/click-rate";
const ADMIN_PRODUCT_PATH = "/api/v1/admin/products";

export type AdminProductPerformanceMap = Map<number, ProductPerformanceItemDto>;

function shouldUseAdminPerformanceMock() {
  return process.env.EXPO_PUBLIC_ADMIN_USE_MOCK === "true";
}

function unwrapShopping<T>(envelope: ApiEnvelope<T> | undefined, fallbackMessage: string): T {
  if (!envelope?.success || envelope.data == null) {
    throw new Error(envelope?.message ?? fallbackMessage);
  }
  return envelope.data;
}

async function fetchProductPerformanceSummary(range: AdminDateRange, limit = PERFORMANCE_SUMMARY_LIMIT) {
  const params = {
    ...adminDateRangeToApiParams(range),
    limit,
  };

  const response = await adminAnalyticsClient.get<
    AdminAnalyticsApiEnvelope<ProductPerformanceSummaryDto>
  >(PERFORMANCE_SUMMARY_PATH, { params });

  return unwrapAdminAnalytics(response.data, "상품 성과 목록을 불러오지 못했습니다.");
}

export async function fetchAdminProductPerformanceMap(
  range: AdminDateRange,
): Promise<AdminProductPerformanceMap> {
  const summary = await fetchProductPerformanceSummary(range);
  return new Map(summary.products.map((item) => [item.productId, item]));
}

/** performance-summary 500 등 — 목록은 살리고 성과만 0 처리 */
export async function fetchAdminProductPerformanceMapSafe(
  range: AdminDateRange,
): Promise<{ map: AdminProductPerformanceMap; unavailable: boolean }> {
  try {
    const map = await fetchAdminProductPerformanceMap(range);
    return { map, unavailable: false };
  } catch {
    return { map: new Map(), unavailable: true };
  }
}

async function fetchAdminProductsPage({
  page = 0,
  size = ADMIN_PRODUCT_LIST_PAGE_SIZE,
  keyword,
  categoryId,
  saleStatus,
  sortBy = "createdAt",
  direction = "desc",
}: FetchAdminProductsParams = {}) {
  const response = await shoppingApiClient.get<ApiEnvelope<AdminProductPageDto>>(
    ADMIN_PRODUCT_PATH,
    {
      params: {
        page,
        size,
        keyword: keyword?.trim() || undefined,
        categoryId,
        saleStatus,
        sortBy,
        direction,
      },
    },
  );

  return unwrapShopping(response.data, "상품 목록을 불러오지 못했습니다.");
}

async function fetchAdminShoppingProduct(productId: string) {
  const response = await shoppingApiClient.get<ApiEnvelope<AdminShoppingProductDto>>(
    `${ADMIN_PRODUCT_PATH}/${productId}`,
  );

  return unwrapShopping(response.data, "상품 정보를 불러오지 못했습니다.");
}

async function fetchRecommendationPurchaseConversion(
  range: AdminDateRange,
  productId: string,
) {
  const params = {
    ...adminDateRangeToApiParams(range),
    productId: Number(productId),
    limit: 100,
  };

  const response = await adminAnalyticsClient.get<
    AdminAnalyticsApiEnvelope<RecommendationPurchaseConversionDto>
  >(PURCHASE_CONVERSION_PATH, { params });

  return unwrapAdminAnalytics(response.data, "추천 구매 전환 데이터를 불러오지 못했습니다.");
}

async function fetchRecommendationClickRate(range: AdminDateRange) {
  const params = {
    ...adminDateRangeToApiParams(range),
    limit: 100,
  };

  const response = await adminAnalyticsClient.get<
    AdminAnalyticsApiEnvelope<RecommendationClickRateDto>
  >(CLICK_RATE_PATH, { params });

  return unwrapAdminAnalytics(response.data, "추천 클릭률 데이터를 불러오지 못했습니다.");
}

/** B merge — 상품 목록(페이지) + 성과 summary */
export async function fetchAdminProductPerformanceListPage(
  range: AdminDateRange,
  page: number,
  size = ADMIN_PRODUCT_LIST_PAGE_SIZE,
  options?: {
    keyword?: string;
    categoryId?: number;
    saleStatus?: FetchAdminProductsParams["saleStatus"];
    performanceMap?: AdminProductPerformanceMap;
  },
): Promise<
  AdminProductListPageResult & {
    performanceMap?: AdminProductPerformanceMap;
    performanceUnavailable?: boolean;
  }
> {
  if (shouldUseAdminPerformanceMock()) {
    return getMockProductPerformanceListPage(range, page, size);
  }

  try {
    const [productsPage, performanceResult] = await Promise.all([
      fetchAdminProductsPage({
        page,
        size,
        keyword: options?.keyword,
        categoryId: options?.categoryId,
        saleStatus: options?.saleStatus,
      }),
      options?.performanceMap
        ? Promise.resolve({ map: options.performanceMap, unavailable: false })
        : fetchAdminProductPerformanceMapSafe(range),
    ]);

    const performanceMap = performanceResult.map;
    const products = productsPage.products.map((item) =>
      mapAdminProductListItem(item, performanceMap),
    );

    return {
      products,
      page: productsPage.page,
      hasMore: !productsPage.last,
      totalElements: productsPage.totalElements,
      performanceMap,
      performanceUnavailable: performanceResult.unavailable,
    };
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "상품 목록을 불러오지 못했습니다."));
  }
}

/** @deprecated fetchAdminProductPerformanceListPage 사용 */
export async function fetchAdminProductPerformanceList(
  range: AdminDateRange,
): Promise<AdminProductPerformance[]> {
  if (shouldUseAdminPerformanceMock()) {
    return getMockProductPerformanceList(range);
  }

  const firstPage = await fetchAdminProductPerformanceListPage(range, 0);
  return firstPage.products;
}

/** 상품 상세 — shopping 상품 정보 + analytics 성과/추천 퍼널 */
export async function fetchAdminProductPerformanceDetail(
  productId: string,
  range: AdminDateRange,
): Promise<AdminProductPerformance | null> {
  if (shouldUseAdminPerformanceMock()) {
    return getMockProductPerformanceList(range).find((item) => item.productId === productId) ?? null;
  }

  try {
    const numericId = Number(productId);
    if (!Number.isFinite(numericId)) {
      return null;
    }

    const shoppingProduct = await fetchAdminShoppingProduct(productId);

    const [performanceResult, purchaseConversion, clickRate] = await Promise.all([
      fetchAdminProductPerformanceMapSafe(range),
      fetchRecommendationPurchaseConversion(range, productId).catch(() => null),
      fetchRecommendationClickRate(range).catch(() => null),
    ]);

    const summaryItem = performanceResult.map.get(numericId) ?? null;

    const brand = shoppingProduct.brandName?.trim();
    const productName = shoppingProduct.productName?.trim() ?? summaryItem?.productName ?? "";
    const displayName =
      brand && !productName.startsWith("[") ? `[${brand}] ${productName}` : productName;

    return mapPerformanceDetail(summaryItem, {
      productId,
      name: displayName,
      categoryId: shoppingProduct.categoryId ?? summaryItem?.categoryId ?? null,
      image: resolveProductImageSource(shoppingProduct.imageUrl),
      clickRate,
      purchaseConversion,
    });
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "상품 상세 성과를 불러오지 못했습니다."));
  }
}
