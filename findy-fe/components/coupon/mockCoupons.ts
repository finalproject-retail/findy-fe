import type { Coupon, CouponFilter } from "./types";

export const MOCK_COUPONS: Coupon[] = [
  {
    id: "coupon-rice-5k",
    discountAmount: 5000,
    name: "[쌀 20kg] 농축산물할인지원 5천원 쿠폰",
    minPurchaseAmount: 0,
    expiresAtLabel: "26.05.12 23:59까지",
    category: "product",
  },
  {
    id: "coupon-meat-3k",
    discountAmount: 3000,
    name: "[정육] 국내산 한우 3천원 할인",
    minPurchaseAmount: 30000,
    expiresAtLabel: "26.05.20 23:59까지",
    category: "product",
  },
  {
    id: "coupon-shipping",
    discountAmount: 2000,
    name: "배송비 무료 쿠폰",
    minPurchaseAmount: 10000,
    expiresAtLabel: "26.06.01 23:59까지",
    category: "unlimited",
  },
  {
    id: "coupon-brand-dairy",
    discountAmount: 1500,
    name: "[매일유업] 브랜드 전용 1,500원 할인",
    minPurchaseAmount: 8000,
    expiresAtLabel: "26.05.30 23:59까지",
    category: "brand",
  },
  {
    id: "coupon-snack-10",
    discountAmount: 1000,
    name: "스낵·과자 1천원 할인",
    minPurchaseAmount: 5000,
    expiresAtLabel: "26.05.15 23:59까지",
    category: "product",
  },
  {
    id: "coupon-welcome",
    discountAmount: 5000,
    name: "신규 가입 웰컴 5천원 쿠폰",
    minPurchaseAmount: 20000,
    expiresAtLabel: "26.05.31 23:59까지",
    category: "unlimited",
  },
];

export function filterCoupons(
  coupons: Coupon[],
  filter: CouponFilter,
): Coupon[] {
  if (filter === "all") return coupons;
  return coupons.filter((coupon) => coupon.category === filter);
}
