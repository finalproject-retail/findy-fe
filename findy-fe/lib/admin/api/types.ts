export type AdminAnalyticsApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type AdminShoppingProductDto = {
  brandName?: string | null;
  productName?: string | null;
  categoryId?: number | null;
  imageUrl?: string | null;
};

export type ProductPerformanceItemDto = {
  productId: number;
  productName?: string;
  brandName?: string | null;
  categoryId: number | null;
  viewCount: number;
  viewToPurchaseRate: number | string;
};

export type ProductPerformanceSummaryDto = {
  period?: AdminAnalyticsPeriod;
  products: ProductPerformanceItemDto[];
};

export type RecommendationDailyTrendDto = {
  analysisDate: string;
  impressionCount: number;
};

export type PromotionSelectRateApiDto = {
  promotionId?: number;
  promotionName?: string;
  productId: number;
  productName: string;
  impressionCount: number;
  selectedCount: number;
  selectRate: number;
  purchaseCount: number;
  conversionRate: number;
};

export type PromotionSelectRateApiData = {
  promotionSelectRates?: PromotionSelectRateApiDto[];
  substituteSelectRates?: PromotionSelectRateApiDto[];
};

export type FetchPromotionSelectRateParams = {
  startDate: string;
  endDate: string;
  promotionId?: number;
  productId?: number;
};

export type AdminAnalyticsPeriod = {
  fromDate: string;
  toDate: string;
};

export type RecommendationClickRateProductDto = {
  recommendationType?: string;
  productId: number;
  productName: string;
  impressionCount: number;
  clickCount: number;
  clickRate: number;
};

export type RecommendationClickRateData = {
  period?: AdminAnalyticsPeriod;
  recommendationType?: string | null;
  impressionCount: number;
  clickCount: number;
  clickRate: number;
  products?: RecommendationClickRateProductDto[];
};

export type RecommendationPurchaseConversionProductDto = {
  recommendationType?: string;
  productId: number;
  productName: string;
  impressionCount: number;
  clickCount: number;
  purchaseCount: number;
  purchaseConversionRate: number;
  clickToPurchaseRate: number;
};

export type RecommendationPurchaseConversionData = {
  period?: AdminAnalyticsPeriod;
  recommendationType?: string | null;
  productId?: number | null;
  impressionCount: number;
  clickCount: number;
  purchaseCount: number;
  purchaseConversionRate: number;
  clickToPurchaseRate: number;
  products?: RecommendationPurchaseConversionProductDto[];
  dailyTrends?: RecommendationDailyTrendDto[];
};

/** 상품 성과 상세 API 응답 (click-rate) */
export type RecommendationClickRateDto = RecommendationClickRateData;

/** 상품 성과 상세 API 응답 (purchase-conversion) */
export type RecommendationPurchaseConversionDto = RecommendationPurchaseConversionData;

export type FetchAdminRecommendationAnalyticsParams = {
  fromDate: string;
  toDate: string;
  recommendationType: string;
  limit?: number;
  productId?: number;
};

export type FetchAdminDashboardAnalyticsParams = {
  startDate: string;
  endDate: string;
  storeId?: number;
  zoneId?: number;
};

export type AnalyticsSummaryDto = {
  totalVisitorCount: number;
  outOfStockCount: number;
  routeUsageCount: number;
  recommendationConversionRate: number;
  totalSalesAmount: number;
  totalOrderCount: number;
  averageOrderAmount: number;
};

export type AnalyticsSummaryData = {
  summary: AnalyticsSummaryDto;
};

export type GridVisitRateDto = {
  gridId: number;
  gridType: string;
  visitCount: number;
  visitRate: number;
  averageStayDuration: number;
  rankNo: number;
};

export type ZoneVisitRateData = {
  gridVisitRates: GridVisitRateDto[];
};
