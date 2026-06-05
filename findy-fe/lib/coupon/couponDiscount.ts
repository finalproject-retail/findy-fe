import type { Coupon } from "@/components/coupon/types";

export function getCouponDiscountLabel(coupon: Coupon): string {
  if (coupon.discountType === "percent") {
    return `${coupon.discountAmount}% 할인`;
  }

  return `${coupon.discountAmount.toLocaleString("ko-KR")}원 할인`;
}

export function isCouponExpired(coupon: Coupon): boolean {
  if (!coupon.expiresAt) {
    return false;
  }

  const expiresAt = new Date(coupon.expiresAt);
  return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() <= Date.now();
}

export function isCouponSelectable(coupon: Coupon, subtotal: number): boolean {
  if (coupon.isUsed) {
    return false;
  }

  if (isCouponExpired(coupon)) {
    return false;
  }

  return subtotal >= coupon.minPurchaseAmount;
}

export function getCouponDiscountAmount(
  coupon: Coupon,
  subtotal: number,
): number {
  if (!isCouponSelectable(coupon, subtotal)) {
    return 0;
  }

  if (coupon.discountType === "percent") {
    return Math.floor((subtotal * coupon.discountAmount) / 100);
  }

  return Math.min(coupon.discountAmount, subtotal);
}
