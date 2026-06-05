import type { Coupon } from "@/components/coupon/types";
import type { MembershipGrade } from "@/components/mypage/mockUser";

export function normalizeMembershipGrade(
  raw?: string | null,
): MembershipGrade | null {
  const normalized = raw?.trim().toLowerCase() ?? "";

  if (normalized === "vip") {
    return "vip";
  }
  if (normalized === "gold") {
    return "gold";
  }
  if (normalized === "silver") {
    return "silver";
  }
  if (normalized === "bronze") {
    return "bronze";
  }

  return null;
}

export function inferMembershipGradeFromCouponName(
  couponName: string,
): MembershipGrade | null {
  const text = couponName.toLowerCase();

  if (text.includes("vip")) {
    return "vip";
  }
  if (text.includes("gold") || text.includes("골드")) {
    return "gold";
  }
  if (text.includes("silver") || text.includes("실버")) {
    return "silver";
  }
  if (text.includes("bronze") || text.includes("브론즈")) {
    return "bronze";
  }

  return null;
}

type CouponGradeSource = {
  couponName: string;
  membershipGrade?: string | null;
  grade?: string | null;
  targetGrade?: string | null;
};

export function resolveCouponMembershipGrade(
  dto: CouponGradeSource,
): MembershipGrade | null {
  return (
    normalizeMembershipGrade(dto.membershipGrade) ??
    normalizeMembershipGrade(dto.grade) ??
    normalizeMembershipGrade(dto.targetGrade) ??
    inferMembershipGradeFromCouponName(dto.couponName)
  );
}

export function filterMembershipCouponsByGrade<T extends Coupon>(
  coupons: T[],
  userGrade?: MembershipGrade | null,
): T[] {
  return coupons.filter((coupon) => {
    if (coupon.couponType !== "MEMBERSHIP") {
      return true;
    }

    if (!userGrade) {
      return false;
    }

    return coupon.membershipGrade === userGrade;
  });
}

export function canDownloadMembershipCoupon(
  coupon: Coupon,
  userGrade?: MembershipGrade | null,
): boolean {
  if (coupon.couponType !== "MEMBERSHIP") {
    return true;
  }

  if (!userGrade) {
    return false;
  }

  return coupon.membershipGrade === userGrade;
}
