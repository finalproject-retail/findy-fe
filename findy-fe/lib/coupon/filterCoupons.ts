import type { Coupon, CouponFilter, CouponType } from "@/components/coupon/types";
import type { MembershipGrade } from "@/components/mypage/mockUser";
import { filterMembershipCouponsByGrade } from "@/lib/coupon/membershipGrade";

export function normalizeCouponType(raw?: string | null): CouponType {
  const normalized = raw?.trim().toUpperCase();

  if (
    normalized === "ALL" ||
    normalized === "PRODUCT" ||
    normalized === "BRAND" ||
    normalized === "MEMBERSHIP"
  ) {
    return normalized;
  }

  return "ALL";
}

export function filterCoupons(
  coupons: Coupon[],
  filter: CouponFilter,
  userGrade?: MembershipGrade | null,
): Coupon[] {
  const gradeFiltered = filterMembershipCouponsByGrade(coupons, userGrade);

  if (filter === "all") {
    return gradeFiltered;
  }

  if (filter === "product") {
    return gradeFiltered.filter(
      (coupon) => coupon.couponType === "ALL" || coupon.couponType === "PRODUCT",
    );
  }

  if (filter === "membership") {
    return gradeFiltered.filter((coupon) => coupon.couponType === "MEMBERSHIP");
  }

  if (filter === "brand") {
    return gradeFiltered.filter((coupon) => coupon.couponType === "BRAND");
  }

  return gradeFiltered;
}
