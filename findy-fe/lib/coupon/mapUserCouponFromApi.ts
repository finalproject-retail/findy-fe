import type { Coupon } from "@/components/coupon/types";
import type { UserCouponApiDto } from "@/lib/coupon/api/types";
import { formatCouponExpireLabel } from "@/lib/coupon/formatCouponExpireLabel";
import { normalizeCouponType } from "@/lib/coupon/filterCoupons";
import { mapCouponDiscountType } from "@/lib/coupon/mapCouponFields";
import { resolveCouponMembershipGrade } from "@/lib/coupon/membershipGrade";

function resolveUserCouponExpiresAt(dto: UserCouponApiDto): string {
  const raw = dto.expiresAt ?? dto.endAt;
  return typeof raw === "string" ? raw.trim() : "";
}

export function mapUserCouponFromApi(dto: UserCouponApiDto): Coupon {
  const discountType = mapCouponDiscountType(dto.couponName, dto.discountType);
  const expiresAt = resolveUserCouponExpiresAt(dto);

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
    expiresAtLabel: expiresAt
      ? formatCouponExpireLabel(expiresAt)
      : "유효기간 정보 없음",
    isUsed: dto.isUsed,
    downloadedAt: dto.downloadedAt,
    expiresAt: expiresAt || undefined,
    isDownloaded: dto.isDownloaded ?? true,
  };
}

export function mapUserCouponsFromApi(
  dtos: UserCouponApiDto[] | null | undefined,
): Coupon[] {
  if (!Array.isArray(dtos)) {
    return [];
  }

  return dtos.map(mapUserCouponFromApi);
}
