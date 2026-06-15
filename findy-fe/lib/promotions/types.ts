export type PromotionTypeApi = "DISCOUNT" | "BOGO" | "GIFT";

export type PromotionStatusApi = "SCHEDULED" | "ACTIVE" | "ENDED";

export type PromotionProductApi = {
  /** API 스펙 markerId — 백엔드 필드명 promotionProductId */
  promotionProductId: number;
  promotionId: number;
  promotionName: string;
  promotionType: PromotionTypeApi;
  benefitText: string | null;
  productId: number;
  promotionPrice: number | null;
  gridId: number;
  discountRate: number | string | null;
  minPurchaseAmount: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  giftItem: string | null;
  startAt: string;
  endAt: string;
  status: PromotionStatusApi;
};

export type PromotionProductPageApi = {
  promotionProducts: PromotionProductApi[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

export type ApplicablePromotionApi = {
  promotionId: number;
  promotionProductId: number;
  productId: number;
  promotionName: string;
  promotionType: PromotionTypeApi;
  benefitText: string | null;
  promotionPrice: number | null;
  discountRate: number | string | null;
  minPurchaseAmount: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  giftItem: string | null;
  startAt: string;
  endAt: string;
  status: PromotionStatusApi;
};
