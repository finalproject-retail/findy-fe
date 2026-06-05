import type { Coupon } from "@/components/coupon/types";
import type { AvailableCouponApiDto } from "@/lib/coupon/api/types";
import { formatCouponExpireLabel } from "@/lib/coupon/formatCouponExpireLabel";
import { normalizeCouponType } from "@/lib/coupon/filterCoupons";
import { mapCouponDiscountType } from "@/lib/coupon/mapCouponFields";
import { resolveCouponMembershipGrade } from "@/lib/coupon/membershipGrade";

export function mapAvailableCouponFromApi(dto: AvailableCouponApiDto): Coupon {
  const discountType = mapCouponDiscountType(dto.couponName, dto.discountType);

  return {
    id: String(dto.couponId),
    couponId: dto.couponId,
    couponType: normalizeCouponType(dto.couponType),
    membershipGrade: resolveCouponMembershipGrade(dto),
    discountAmount: dto.discountValue,
    discountType,
    name: dto.couponName,
    minPurchaseAmount: dto.minOrderAmount ?? 0,
    expiresAtLabel: formatCouponExpireLabel(dto.endAt),
    expiresAt: dto.endAt,
    isDownloaded: dto.isDownloaded ?? false,
  };
}

export function mapAvailableCouponsFromApi(
  dtos: AvailableCouponApiDto[] | null | undefined,
): Coupon[] {
  if (!Array.isArray(dtos)) {
    return [];
  }

  return dtos.map(mapAvailableCouponFromApi);
}
