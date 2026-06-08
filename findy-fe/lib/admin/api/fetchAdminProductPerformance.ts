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
  AdminShoppingProductDto,
  ProductPerformanceSummaryDto,
  RecommendationClickRateDto,
  RecommendationPurchaseConversionDto,
} from "@/lib/admin/api/types";
import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import { getAdminProductPerformanceList as getMockProductPerformanceList } from "@/lib/admin/mockProductPerformanceData";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import type { ApiEnvelope } from "@/lib/shopping/types";

const PERFORMANCE_SUMMARY_PATH = "/api/v1/admin/analytics/products/performance-summary";
const PURCHASE_CONVERSION_PATH = "/api/v1/admin/analytics/recommendations/purchase-conversion";
const CLICK_RATE_PATH = "/api/v1/admin/analytics/recommendations/click-rate";
const ADMIN_PRODUCT_PATH = "/api/v1/admin/products";

function shouldUseAdminPerformanceMock() {
  return process.env.EXPO_PUBLIC_ADMIN_USE_MOCK === "true";
}

function unwrapShopping<T>(envelope: ApiEnvelope<T> | undefined, fallbackMessage: string): T {
  if (!envelope?.success || envelope.data == null) {
    throw new Error(envelope?.message ?? fallbackMessage);
  }
  return envelope.data;
}

async function fetchProductPerformanceSummary(range: AdminDateRange, limit = 100) {
  const params = {
    ...adminDateRangeToApiParams(range),
    limit,
  };

  const response = await adminAnalyticsClient.get<
    AdminAnalyticsApiEnvelope<ProductPerformanceSummaryDto>
  >(PERFORMANCE_SUMMARY_PATH, { params });

  return unwrapAdminAnalytics(response.data, "상품 성과 목록을 불러오지 못했습니다.");
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

/** GET /api/v1/admin/analytics/products/performance-summary */
export async function fetchAdminProductPerformanceList(
  range: AdminDateRange,
): Promise<AdminProductPerformance[]> {
  if (shouldUseAdminPerformanceMock()) {
    return getMockProductPerformanceList(range);
  }

  try {
    const summary = await fetchProductPerformanceSummary(range);
    return summary.products.map((item) => mapPerformanceItemToSummary(item));
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "상품 성과 목록을 불러오지 못했습니다."));
  }
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

    const [summary, shoppingProduct, purchaseConversion, clickRate] = await Promise.all([
      fetchProductPerformanceSummary(range),
      fetchAdminShoppingProduct(productId),
      fetchRecommendationPurchaseConversion(range, productId),
      fetchRecommendationClickRate(range),
    ]);

    const summaryItem =
      summary.products.find((item) => item.productId === numericId) ?? null;

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
