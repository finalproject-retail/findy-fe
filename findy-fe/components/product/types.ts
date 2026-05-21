import type { ImageSourcePropType } from "react-native";

/** 상품 상세 — 사용 가능한 할인 쿠폰 (목 데이터·API 연동용) */
export type ProductCoupon = {
  id: string;
  discountPercent: number;
  /** true면 이미 다운로드(보유)한 쿠폰 */
  downloaded: boolean;
};

export type ProductSpec = {
  packagingType: string;
  salesUnit: string;
  weightCapacity: string;
  allergyInfo: string;
  /** 알레르기 교차오염 등 추가 안내 */
  allergyNote?: string;
};

export type Product = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  discountPercent: number;
  price: number;
  /** 상품 상세 — 카테고리 경로 (예: 간편식품 · 농심) */
  category?: string;
  /** 상품 상세 — 쿠폰 적용 전 정가 */
  originalPrice?: number;
  /** 상품 상세 — 쿠폰 적용가 (없으면 price 사용) */
  couponPrice?: number;
  /** 상품 상세 — 남은 재고 */
  stockCount?: number;
  /** 상품 상세 — 스펙 (포장타입, 판매단위 등) */
  spec?: ProductSpec;
  /** 상품 상세 — 하단 상세 이미지 목록 */
  detailImages?: ImageSourcePropType[];
  /** 상품 상세 — 이 상품에 사용 가능한 쿠폰 목록 */
  availableCoupons?: ProductCoupon[];
};
