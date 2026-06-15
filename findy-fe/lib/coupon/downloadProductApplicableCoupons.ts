import type { Coupon } from "@/components/coupon/types";
import type { MembershipGrade } from "@/components/mypage/mockUser";
import {
  downloadCoupon,
  fetchAvailableCoupons,
  fetchMyCoupons,
} from "@/lib/coupon/api/coupons";
import { selectDownloadableCouponsForProduct } from "@/lib/coupon/selectProductApplicableCoupons";

export type DownloadProductApplicableCouponsResult = {
  downloadedCount: number;
};

export async function downloadProductApplicableCoupons(
  productPrice: number,
  userGrade?: MembershipGrade | null,
  options?: {
    availableCoupons?: Coupon[];
    ownedCoupons?: Coupon[];
  },
): Promise<DownloadProductApplicableCouponsResult> {
  const [availableCoupons, ownedCoupons] = await Promise.all([
    options?.availableCoupons ?? fetchAvailableCoupons(),
    options?.ownedCoupons ?? fetchMyCoupons(),
  ]);

  const targets = selectDownloadableCouponsForProduct(
    availableCoupons,
    ownedCoupons,
    productPrice,
    userGrade,
  );

  let downloadedCount = 0;

  for (const coupon of targets) {
    await downloadCoupon(coupon.couponId!);
    downloadedCount += 1;
  }

  return { downloadedCount };
}
