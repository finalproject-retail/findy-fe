export type CouponCategory = "product" | "unlimited" | "brand";

export type CouponFilter = "all" | CouponCategory;

export type CouponTab = "my" | "get";

export type Coupon = {
  id: string;
  discountAmount: number;
  name: string;
  minPurchaseAmount: number;
  /** 예: 26.05.12 23:59까지 */
  expiresAtLabel: string;
  category: CouponCategory;
};
