import type { Coupon } from "@/components/coupon/types";
import type { MembershipGrade } from "@/components/mypage/mockUser";
import {
  downloadCoupon,
  fetchAvailableCoupons,
} from "@/lib/coupon/api/coupons";
import { canDownloadMembershipCoupon } from "@/lib/coupon/membershipGrade";

export type DownloadMembershipCouponsResult = {
  downloadedCount: number;
  skippedCount: number;
};

export async function downloadMembershipCouponsForGrade(
  grade: MembershipGrade,
  availableCoupons?: Coupon[],
): Promise<DownloadMembershipCouponsResult> {
  const coupons = availableCoupons ?? (await fetchAvailableCoupons());
  const targets = coupons.filter(
    (coupon) =>
      coupon.couponType === "MEMBERSHIP" &&
      canDownloadMembershipCoupon(coupon, grade) &&
      !coupon.isDownloaded &&
      coupon.couponId != null,
  );

  let downloadedCount = 0;

  for (const coupon of targets) {
    await downloadCoupon(coupon.couponId!);
    downloadedCount += 1;
  }

  return {
    downloadedCount,
    skippedCount: coupons.filter(
      (coupon) =>
        coupon.couponType === "MEMBERSHIP" &&
        coupon.membershipGrade === grade &&
        coupon.isDownloaded,
    ).length,
  };
}
