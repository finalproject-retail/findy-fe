import type { ApiEnvelope } from "@/lib/map/types";

export type { ApiEnvelope };

/**
 * shopping-service ProductResponse
 * GET /api/v1/products/new|popular|findy-recommendations → data: ProductApiDto[]
 */
export type ProductApiDto = {
  productId?: number | string;
  id?: number | string;
  categoryId?: number;
  brandName?: string | null;
  name?: string;
  productName?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string;
  image?: string;
  price?: number;
  salePrice?: number;
  originalPrice?: number;
  discountRate?: number;
  discountPercent?: number;
  badgeText?: string | null;
  saleStatus?: string | null;
  stockCount?: number;
  stockQuantity?: number | null;
  stockStatus?: string | null;
  stockBadgeText?: string | null;
  stock?: number;
  category?: string;
  /** 상품 상세 — 설명 */
  description?: string | null;
  packagingType?: string | null;
  salesUnit?: string | null;
  volume?: string | null;
  allergyInfo?: string | null;
  barcode?: string | null;
  recommendationLogId?: number | null;
  recommendationSourceProductId?: string | null;
  recommendationRank?: number | null;
  gridId?: number | null;
};

/** 목록 API data 필드 — 배열 직접 또는 페이지 래핑 */
export type ProductListApiData =
  | ProductApiDto[]
  | { items?: ProductApiDto[]; products?: ProductApiDto[]; content?: ProductApiDto[] };
