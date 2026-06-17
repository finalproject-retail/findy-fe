import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { AdminProductPerformance } from "@/lib/admin/adminProductPerformanceTypes";
import {
  adminAnalyticsClient,
  adminDateRangeToApiParams,
  unwrapAdminAnalytics,
} from "@/lib/admin/api/adminApiUtils";
import {
  mapPerformanceDetail,
  mapPerformanceItemToSummary,
} from "@/lib/admin/api/mapProductPerformance";
import type {
  AdminAnalyticsApiEnvelope,
  AdminProductSaleStatus,
  AdminShoppingProductDto,
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

const PERFORMANCE_SUMMARY_PATH =
  "/api/v1/analytics/products/performance-summary";
const PURCHASE_CONVERSION_PATH = "/api/v1/analytics/purchase-conversion";
const CLICK_RATE_PATH = "/api/v1/analytics/recommendations/click-rate";
const ADMIN_PRODUCT_PATH = "/api/v1/admin/products";

const BALANCED_CATEGORY_GROUPS: number[][] = [
  // 신선
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  // 가공/냉동
  [14, 15, 16, 17, 18, 19, 20, 21, 22],
  // 베이커리/델리
  [23, 24, 25, 26, 27, 28],
  // 음료/주류
  [29, 30, 31, 32, 33, 34],
  // 라이프
  [35, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46],
];

export type AdminProductPerformanceMap = Map<
  number,
  ProductPerformanceItemDto
>;

function shouldUseAdminPerformanceMock() {
  return process.env.EXPO_PUBLIC_ADMIN_USE_MOCK === "true";
}

function unwrapShopping<T>(
  envelope: ApiEnvelope<T> | undefined,
  fallbackMessage: string,
): T {
  if (!envelope?.success || envelope.data == null) {
    throw new Error(envelope?.message ?? fallbackMessage);
  }

  return envelope.data;
}

function normalizeCategoryIds(categoryIds?: number[]) {
  if (!categoryIds || categoryIds.length === 0) {
    return undefined;
  }

  const normalized = categoryIds
    .map((categoryId) => Number(categoryId))
    .filter((categoryId) => Number.isFinite(categoryId) && categoryId > 0);

  return normalized.length > 0 ? [...new Set(normalized)] : undefined;
}

async function fetchProductPerformanceSummary(
  range: AdminDateRange,
  limit = PERFORMANCE_SUMMARY_LIMIT,
  categoryIds?: number[],
) {
  const normalizedCategoryIds = normalizeCategoryIds(categoryIds);

  const params = {
    ...adminDateRangeToApiParams(range),
    limit,
    categoryIds:
      normalizedCategoryIds && normalizedCategoryIds.length > 0
        ? normalizedCategoryIds.join(",")
        : undefined,
  };

  const response = await adminAnalyticsClient.get<
    AdminAnalyticsApiEnvelope<ProductPerformanceSummaryDto>
  >(PERFORMANCE_SUMMARY_PATH, { params });

  return unwrapAdminAnalytics(
    response.data,
    "상품 성과 목록을 불러오지 못했습니다.",
  );
}

function interleavePerformanceItems(
  groups: ProductPerformanceItemDto[][],
  limit: number,
) {
  const result: ProductPerformanceItemDto[] = [];
  const seenProductIds = new Set<number>();
  let cursor = 0;

  while (result.length < limit) {
    let appended = false;

    for (const group of groups) {
      const item = group[cursor];

      if (!item) {
        continue;
      }

      if (!seenProductIds.has(item.productId)) {
        result.push(item);
        seenProductIds.add(item.productId);
        appended = true;
      }

      if (result.length >= limit) {
        break;
      }
    }

    if (!appended) {
      break;
    }

    cursor += 1;
  }

  return result;
}

async function fetchBalancedPerformanceItems(
  range: AdminDateRange,
  limit: number,
) {
  const perCategoryLimit = Math.min(
    Math.ceil(limit / BALANCED_CATEGORY_GROUPS.length) + 2,
    PERFORMANCE_SUMMARY_LIMIT,
  );

  const summaries = await Promise.all(
    BALANCED_CATEGORY_GROUPS.map((categoryIds) =>
      fetchProductPerformanceSummary(range, perCategoryLimit, categoryIds),
    ),
  );

  return interleavePerformanceItems(
    summaries.map((summary) => summary.products),
    limit,
  );
}

async function fetchPerformanceItemsForList(
  range: AdminDateRange,
  limit: number,
  categoryIds?: number[],
) {
  const normalizedCategoryIds = normalizeCategoryIds(categoryIds);

  if (normalizedCategoryIds && normalizedCategoryIds.length > 0) {
    const summary = await fetchProductPerformanceSummary(
      range,
      Math.min(limit, PERFORMANCE_SUMMARY_LIMIT),
      normalizedCategoryIds,
    );

    return summary.products;
  }

  return fetchBalancedPerformanceItems(
    range,
    Math.min(limit, PERFORMANCE_SUMMARY_LIMIT),
  );
}

export async function fetchAdminProductPerformanceMap(
  range: AdminDateRange,
  categoryIds?: number[],
): Promise<AdminProductPerformanceMap> {
  const summary = await fetchProductPerformanceSummary(
    range,
    PERFORMANCE_SUMMARY_LIMIT,
    categoryIds,
  );

  return new Map(summary.products.map((item) => [item.productId, item]));
}

/** performance-summary 500 등 — 목록은 살리고 성과만 0 처리 */
export async function fetchAdminProductPerformanceMapSafe(
  range: AdminDateRange,
  categoryIds?: number[],
): Promise<{ map: AdminProductPerformanceMap; unavailable: boolean }> {
  try {
    const map = await fetchAdminProductPerformanceMap(range, categoryIds);
    return { map, unavailable: false };
  } catch {
    return { map: new Map(), unavailable: true };
  }
}

async function fetchAdminShoppingProduct(productId: string) {
  const response = await shoppingApiClient.get<
    ApiEnvelope<AdminShoppingProductDto>
  >(`${ADMIN_PRODUCT_PATH}/${productId}`);

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

  return unwrapAdminAnalytics(
    response.data,
    "추천 구매 전환 데이터를 불러오지 못했습니다.",
  );
}

async function fetchRecommendationClickRate(range: AdminDateRange) {
  const params = {
    ...adminDateRangeToApiParams(range),
    limit: 100,
  };

  const response = await adminAnalyticsClient.get<
    AdminAnalyticsApiEnvelope<RecommendationClickRateDto>
  >(CLICK_RATE_PATH, { params });

  return unwrapAdminAnalytics(
    response.data,
    "추천 클릭률 데이터를 불러오지 못했습니다.",
  );
}

/**
 * 상품 목록 페이지
 *
 * 기준 변경:
 * - 기존: /api/v1/admin/products 최신순 조회 후 성과 map을 붙임
 * - 변경: /performance-summary 성과순 응답을 목록 기준으로 사용
 */
export async function fetchAdminProductPerformanceListPage(
  range: AdminDateRange,
  page: number,
  size = ADMIN_PRODUCT_LIST_PAGE_SIZE,
  options?: {
    keyword?: string;
    categoryId?: number;
    categoryIds?: number[];
    saleStatus?: AdminProductSaleStatus;
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
    const requestLimit = Math.min(
      (page + 1) * size + 1,
      PERFORMANCE_SUMMARY_LIMIT,
    );

    const performanceItems = await fetchPerformanceItemsForList(
      range,
      requestLimit,
      options?.categoryIds,
    );

    const keyword = options?.keyword?.trim().toLowerCase();

    const filteredItems = keyword
      ? performanceItems.filter((item) => {
          const productId = String(item.productId);
          const productName = item.productName?.toLowerCase() ?? "";
          const brandName = item.brandName?.toLowerCase() ?? "";

          return (
            productId.includes(keyword) ||
            productName.includes(keyword) ||
            brandName.includes(keyword)
          );
        })
      : performanceItems;

    const startIndex = page * size;
    const endIndex = startIndex + size;
    const pageItems = filteredItems.slice(startIndex, endIndex);

    const imageEntries = await Promise.all(
      pageItems.map(async (item) => {
        try {
          const shoppingProduct = await fetchAdminShoppingProduct(
            String(item.productId),
          );

          return [
            item.productId,
            resolveProductImageSource(shoppingProduct.imageUrl),
          ] as const;
        } catch {
          return [
            item.productId,
            resolveProductImageSource(null),
          ] as const;
        }
      }),
    );

    const imageMap = new Map(imageEntries);

    const products = pageItems.map((item) =>
      mapPerformanceItemToSummary(item, imageMap.get(item.productId)),
    );

    const performanceMap = new Map(
      performanceItems.map((item) => [item.productId, item]),
    );

    return {
      products,
      page,
      hasMore: filteredItems.length > endIndex,
      totalElements: filteredItems.length,
      performanceMap,
      performanceUnavailable: false,
    };
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "상품 목록을 불러오지 못했습니다."),
    );
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
    return (
      getMockProductPerformanceList(range).find(
        (item) => item.productId === productId,
      ) ?? null
    );
  }

  try {
    const numericId = Number(productId);

    if (!Number.isFinite(numericId)) {
      return null;
    }

    const shoppingProduct = await fetchAdminShoppingProduct(productId);

    const [performanceResult, purchaseConversion, clickRate] =
      await Promise.all([
        fetchAdminProductPerformanceMapSafe(range),
        fetchRecommendationPurchaseConversion(range, productId).catch(
          () => null,
        ),
        fetchRecommendationClickRate(range).catch(() => null),
      ]);

    const summaryItem = performanceResult.map.get(numericId) ?? null;

    const brand = shoppingProduct.brandName?.trim();
    const productName =
      shoppingProduct.productName?.trim() ?? summaryItem?.productName ?? "";
    const displayName =
      brand && !productName.startsWith("[")
        ? `[${brand}] ${productName}`
        : productName;

    return mapPerformanceDetail(summaryItem, {
      productId,
      name: displayName,
      categoryId: shoppingProduct.categoryId ?? summaryItem?.categoryId ?? null,
      image: resolveProductImageSource(shoppingProduct.imageUrl),
      clickRate,
      purchaseConversion,
    });
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "상품 상세 성과를 불러오지 못했습니다."),
    );
  }
}