export type CouponTypeApi = "ALL" | "PRODUCT" | "BRAND" | "MEMBERSHIP";

type CouponApiBase = {
  couponId: number;
  couponName: string;
  couponType: CouponTypeApi | string;
  discountType?: string | null;
  discountValue: number;
  minOrderAmount?: number | null;
  endAt: string;
  startAt?: string | null;
  membershipGrade?: string | null;
  grade?: string | null;
  targetGrade?: string | null;
  isActive?: boolean;
  isStackable?: boolean;
  periodType?: string | null;
  daysLimit?: number | null;
};

/** GET /api/v1/coupons/available-for-order */
export type AvailableOrderCouponApiDto = {
  userCouponId: number;
  couponId: number;
  couponName: string;
  couponType: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  expiresAt: string;
  expectedDiscountAmount: number;
  membershipGrade?: string | null;
  grade?: string | null;
  targetGrade?: string | null;
};

/** GET /api/v1/coupons/me */
export type UserCouponApiDto = CouponApiBase & {
  userCouponId: number;
  isUsed: boolean;
  downloadedAt: string;
  isDownloaded?: boolean;
};

/** GET /api/v1/coupons/available, /{couponId} */
export type AvailableCouponApiDto = CouponApiBase & {
  isDownloaded?: boolean;
};

export type CouponListApiData = {
  coupons?: AvailableCouponApiDto[] | UserCouponApiDto[];
};

export type CouponItemApiData =
  | AvailableCouponApiDto
  | UserCouponApiDto
  | { coupon?: AvailableCouponApiDto | UserCouponApiDto };
