import type { Coupon } from "@/components/coupon/types";
import type { MembershipGrade } from "@/components/mypage/mockUser";
import { getCouponDiscountAmount } from "@/lib/coupon/couponDiscount";
import { excludeAlreadyDownloadedCoupons } from "@/lib/coupon/filterCoupons";
import {
  canDownloadMembershipCoupon,
  filterMembershipCouponsByGrade,
} from "@/lib/coupon/membershipGrade";

function isCouponApplicableAtPrice(coupon: Coupon, productPrice: number): boolean {
  if (productPrice < coupon.minPurchaseAmount) {
    return false;
  }

  if (
    coupon.couponType === "ALL" ||
    coupon.couponType === "PRODUCT" ||
    coupon.couponType === "BRAND"
  ) {
    return true;
  }

  if (coupon.couponType === "MEMBERSHIP") {
    return true;
  }

  return false;
}

/** 이 상품 가격에 적용 가능한 쿠폰 (보유·미보유 공통) */
export function selectApplicableCouponsForProduct(
  coupons: Coupon[],
  productPrice: number,
  userGrade?: MembershipGrade | null,
): Coupon[] {
  const gradeFiltered = filterMembershipCouponsByGrade(coupons, userGrade);

  return gradeFiltered.filter((coupon) => {
    if (!isCouponApplicableAtPrice(coupon, productPrice)) {
      return false;
    }

    if (coupon.couponType === "MEMBERSHIP") {
      return canDownloadMembershipCoupon(coupon, userGrade);
    }

    return true;
  });
}

/** 상품 상세 — 아직 받지 않은 적용 가능 쿠폰 */
export function selectDownloadableCouponsForProduct(
  availableCoupons: Coupon[],
  ownedCoupons: Coupon[],
  productPrice: number,
  userGrade?: MembershipGrade | null,
): Coupon[] {
  return selectApplicableCouponsForProduct(
    excludeAlreadyDownloadedCoupons(availableCoupons, ownedCoupons),
    productPrice,
    userGrade,
  ).filter((coupon) => coupon.couponId != null && !coupon.isDownloaded);
}

export function getMaxProductCouponDiscountPercent(
  coupons: Coupon[],
  productPrice: number,
): number {
  if (coupons.length === 0 || productPrice <= 0) {
    return 0;
  }

  let maxPercent = 0;

  for (const coupon of coupons) {
    if (coupon.discountType === "percent") {
      maxPercent = Math.max(maxPercent, coupon.discountAmount);
      continue;
    }

    const discountAmount = getCouponDiscountAmount(coupon, productPrice);
    if (discountAmount <= 0) {
      continue;
    }

    maxPercent = Math.max(
      maxPercent,
      Math.round((discountAmount / productPrice) * 100),
    );
  }

  return maxPercent;
}
