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
};

export type FetchAdminRecommendationAnalyticsParams = {
  fromDate: string;
  toDate: string;
  recommendationType: string;
  limit?: number;
  productId?: number;
};
