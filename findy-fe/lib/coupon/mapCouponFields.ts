import type { CouponDiscountType } from "@/components/coupon/types";
import { normalizeCouponType } from "@/lib/coupon/filterCoupons";

export function mapCouponDiscountType(
  couponName: string,
  discountType?: string | null,
): CouponDiscountType {
  const normalized = discountType?.trim().toUpperCase();

  if (
    normalized === "PERCENT" ||
    normalized === "RATE" ||
    normalized === "PERCENTAGE"
  ) {
    return "percent";
  }

  if (
    normalized === "FIXED" ||
    normalized === "AMOUNT" ||
    normalized === "WON"
  ) {
    return "amount";
  }

  return couponName.includes("%") ? "percent" : "amount";
}

export { normalizeCouponType };
