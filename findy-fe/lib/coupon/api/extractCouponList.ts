import type { CouponListApiData, CouponItemApiData } from "@/lib/coupon/api/types";

export function extractCouponList<T>(
  data: T[] | CouponListApiData | null | undefined,
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === "object" && Array.isArray(data.coupons)) {
    return data.coupons as T[];
  }

  return [];
}

export function extractCouponItem<T>(data: CouponItemApiData | null | undefined): T | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  if ("coupon" in data && data.coupon && typeof data.coupon === "object") {
    return data.coupon as T;
  }

  if ("couponId" in data) {
    return data as T;
  }

  return null;
}
