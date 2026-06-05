import type { MembershipGrade } from "@/components/mypage/mockUser";

export type CouponType = "ALL" | "PRODUCT" | "BRAND" | "MEMBERSHIP";

export type CouponFilter = "all" | "product" | "membership" | "brand";

export type CouponTab = "my" | "get";

export type CouponDiscountType = "amount" | "percent";

export type Coupon = {
  id: string;
  couponId?: number;
  userCouponId?: number;
  couponType: CouponType;
  membershipGrade?: MembershipGrade | null;
  discountAmount: number;
  discountType?: CouponDiscountType;
  name: string;
  minPurchaseAmount: number;
  /** 예: 26.05.12 23:59까지 */
  expiresAtLabel: string;
  isUsed?: boolean;
  isDownloaded?: boolean;
  downloadedAt?: string;
  expiresAt?: string;
};
