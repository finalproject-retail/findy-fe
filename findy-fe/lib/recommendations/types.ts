import type { ProductApiDto } from "@/lib/products/types";

/** 연관·대체 상품 추천 항목 */
export type ProductRecommendationApiDto = {
  productId: number;
  productName: string;
  brandName?: string | null;
  imageUrl?: string | null;
  originalPrice?: number | null;
  salePrice?: number | null;
  stockStatus?: string | null;
  reason?: string | null;
  recommendationLogId?: number | null;
  recommendationRank?: number | null;
};

/** GET /api/v1/recommendations/personalized 응답 data */
export type PersonalizedRecommendationsApiData = {
  userId?: number;
  baseType?: string;
  preferredCategories?: string[];
  shoppingStyles?: string[];
  recommendations?: ProductApiDto[];
};

/** POST /api/v1/recommendations/logs/clicks 응답 data */
export type RecommendationClickLogApiData = {
  status?: string;
  updatedAt?: string;
  isClicked?: boolean | string;
  recommendationLogId: number;
};

/** POST /api/v1/recommendations/logs/substitute-selections 응답 data */
export type RecommendationSubstituteSelectionLogApiData = {
  recommendationLogId: number;
  userId: number;
  productId: number;
  sourceProductId: number;
  storeId?: number | null;
  recommendationType?: string;
  logType?: string;
  displayLocation?: string | null;
  recommendationRank?: number | null;
  score?: number | null;
  createdAt?: string;
};

/** PATCH /api/v1/recommendations/logs/purchase-conversions 응답 data */
export type RecommendationPurchaseConversionLogApiData = {
  userId: number;
  orderId: number;
  convertedCount: number;
};

export type SaveRecommendationClickLogRequest = {
  recommendationLogId: number;
};

export type SaveSubstituteSelectionLogRequest = {
  recommendationLogId: number;
  userId: number;
  sourceProductId: number;
  selectedProductId: number;
};

export type SavePurchaseConversionLogRequest = {
  userId: number;
  orderId: number;
  recommendationLogIds: number[];
  purchasedProductIds: number[];
};

export type RecommendationType =
  | "PERSONALIZED"
  | "RELATED"
  | "SUBSTITUTE"
  | "PROMOTION"
  | "AI_PERSONALIZED_PROMOTION";

/** POST /api/v1/recommendations/logs — 추천 노출 로그 저장 */
export type SaveRecommendationImpressionLogRequest = {
  userId: number;
  productId: number;
  sourceProductId?: string | null;
  storeId?: number | null;
  recommendationType: RecommendationType;
  displayLocation: string;
  recommendationRank?: number | null;
  score?: number | null;
  reason?: string | null;
};

export type RecommendationImpressionLogApiData = {
  recommendationLogId: number;
  userId?: number;
  productId: number;
  sourceProductId?: number | null;
  storeId?: number | null;
  recommendationType?: RecommendationType;
  logType?: string;
  displayLocation?: string | null;
  recommendationRank?: number | null;
  score?: number | null;
  createdAt?: string;
  status?: string;
};
