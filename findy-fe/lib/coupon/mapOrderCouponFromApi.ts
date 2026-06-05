import type { Coupon } from "@/components/coupon/types";
import type { AvailableOrderCouponApiDto } from "@/lib/coupon/api/types";
import { formatCouponExpireLabel } from "@/lib/coupon/formatCouponExpireLabel";
import { normalizeCouponType } from "@/lib/coupon/filterCoupons";
import { mapCouponDiscountType } from "@/lib/coupon/mapCouponFields";
import { resolveCouponMembershipGrade } from "@/lib/coupon/membershipGrade";

export function mapOrderCouponFromApi(dto: AvailableOrderCouponApiDto): Coupon {
  const discountType = mapCouponDiscountType(dto.couponName, dto.discountType);

  return {
    id: String(dto.userCouponId),
    userCouponId: dto.userCouponId,
    couponId: dto.couponId,
    couponType: normalizeCouponType(dto.couponType),
    membershipGrade: resolveCouponMembershipGrade(dto),
    discountAmount: dto.discountValue,
    discountType,
    name: dto.couponName,
    minPurchaseAmount: dto.minOrderAmount ?? 0,
    expiresAtLabel: formatCouponExpireLabel(dto.expiresAt),
    expiresAt: dto.expiresAt,
    isUsed: false,
    isDownloaded: true,
    downloadedAt: dto.expiresAt,
  };
}

export function mapOrderCouponsFromApi(
  dtos: AvailableOrderCouponApiDto[] | null | undefined,
): Coupon[] {
  if (!Array.isArray(dtos)) {
    return [];
  }

  return dtos.map(mapOrderCouponFromApi);
}
