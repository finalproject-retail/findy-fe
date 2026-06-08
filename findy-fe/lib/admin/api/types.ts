/** analytics-service — GET /api/v1/admin/analytics/products/performance-summary */

export type AdminAnalyticsPeriodDto = {
  fromDate: string;
  toDate: string;
};

export type ProductPerformanceItemDto = {
  rankNo: number;
  productId: number;
  productName: string;
  brandName: string | null;
  categoryId: number | null;
  categoryName: string | null;
  viewCount: number;
  orderCount: number;
  orderQuantity: number;
  salesAmount: number;
  viewToPurchaseRate: number | string;
  salesShareRate: number | string;
};

export type ProductPerformanceSummaryDto = {
  period: AdminAnalyticsPeriodDto;
  storeId: number | null;
  totalProductCount: number;
  viewedProductCount: number;
  orderedProductCount: number;
  totalViewCount: number;
  totalOrderCount: number;
  totalOrderQuantity: number;
  totalSalesAmount: number;
  purchaseConversionRate: number | string;
  averageSalesAmountPerOrder: number | string;
  limit: number;
  products: ProductPerformanceItemDto[];
};

/** shopping-service — GET /api/v1/admin/products/{productId} */

export type AdminShoppingProductDto = {
  productId: number;
  categoryId: number | null;
  brandName: string | null;
  productName: string;
  imageUrl: string | null;
};

/** analytics-service — GET /api/v1/admin/analytics/recommendations/purchase-conversion */

export type RecommendationDailyTrendDto = {
  analysisDate: string;
  impressionCount: number;
  clickCount: number;
  purchaseCount: number;
  purchaseConversionRate: number | string;
  clickToPurchaseRate: number | string;
};

export type RecommendationPurchaseConversionDto = {
  period: AdminAnalyticsPeriodDto;
  recommendationType: string | null;
  productId: number | null;
  impressionCount: number;
  clickCount: number;
  purchaseCount: number;
  purchaseConversionRate: number | string;
  clickToPurchaseRate: number | string;
  dailyTrends: RecommendationDailyTrendDto[];
  products: unknown[];
};

export type RecommendationClickRateDto = {
  period: AdminAnalyticsPeriodDto;
  recommendationType: string | null;
  impressionCount: number;
  clickCount: number;
  clickRate: number | string;
  dailyTrends: {
    analysisDate: string;
    impressionCount: number;
    clickCount: number;
    clickRate: number | string;
  }[];
  products: unknown[];
};

export type AdminAnalyticsApiEnvelope<T> = {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
};
