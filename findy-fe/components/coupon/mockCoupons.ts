import type { Coupon } from "./types";

/** @deprecated 결제/쿠폰 API 연동 후 목업 전용 */
export const MOCK_COUPONS: Coupon[] = [
  {
    id: "coupon-rice-5k",
    couponType: "PRODUCT",
    discountAmount: 5000,
    name: "[쌀 20kg] 농축산물할인지원 5천원 쿠폰",
    minPurchaseAmount: 0,
    expiresAtLabel: "26.05.31 23:59까지",
  },
  {
    id: "coupon-meat-3k",
    couponType: "PRODUCT",
    discountAmount: 3000,
    name: "[정육] 국내산 한우 3천원 할인",
    minPurchaseAmount: 30000,
    expiresAtLabel: "26.06.07 23:59까지",
  },
  {
    id: "coupon-shipping",
    couponType: "ALL",
    discountAmount: 2000,
    name: "배송비 무료 쿠폰",
    minPurchaseAmount: 10000,
    expiresAtLabel: "26.06.15 23:59까지",
  },
  {
    id: "coupon-brand-dairy",
    couponType: "BRAND",
    discountAmount: 1500,
    name: "[매일유업] 브랜드 전용 1,500원 할인",
    minPurchaseAmount: 8000,
    expiresAtLabel: "26.06.22 23:59까지",
  },
];
