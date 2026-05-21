import CouponIcon from "@/assets/icons/coupon-icon.svg";
import DownloadIcon from "@/assets/icons/download-icon.svg";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { ProductCoupon } from "../types";

function getMaxCouponDiscountPercent(coupons: ProductCoupon[]) {
  if (coupons.length === 0) return 0;
  return Math.max(...coupons.map((coupon) => coupon.discountPercent));
}

function hasAllCouponsDownloaded(coupons: ProductCoupon[]) {
  return coupons.length > 0 && coupons.every((coupon) => coupon.downloaded);
}

function hasDownloadableCoupons(coupons: ProductCoupon[]) {
  return coupons.some((coupon) => !coupon.downloaded);
}

function downloadAllCoupons(coupons: ProductCoupon[]) {
  return coupons.map((coupon) => ({ ...coupon, downloaded: true }));
}

const COUPON_BUTTON_STYLE = {
  marginTop: SPACING.sm,
  marginBottom: SPACING.sm,
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  gap: SPACING.xs,
  borderWidth: 1,
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.sm,
  paddingHorizontal: SPACING.lg,
  backgroundColor: COLORS.white,
};

type ProductDetailCouponButtonProps = {
  availableCoupons: ProductCoupon[];
  onCouponPress?: () => void;
};

export function ProductDetailCouponButton({
  availableCoupons,
  onCouponPress,
}: ProductDetailCouponButtonProps) {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState(availableCoupons);

  useEffect(() => {
    setCoupons(availableCoupons);
  }, [availableCoupons]);

  if (coupons.length === 0) {
    return null;
  }

  const maxDiscount = getMaxCouponDiscountPercent(coupons);
  const allDownloaded = hasAllCouponsDownloaded(coupons);

  const handleDownload = () => {
    if (!hasDownloadableCoupons(coupons)) {
      return;
    }

    // TODO: 쿠폰 다운로드 API
    setCoupons(downloadAllCoupons(coupons));
    showToast(TOAST_MESSAGES.couponDownloaded);
    onCouponPress?.();
  };

  if (allDownloaded) {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={`${maxDiscount}% 할인쿠폰 보유`}
        style={{
          ...COUPON_BUTTON_STYLE,
          borderColor: COLORS.redText,
        }}
      >
        <CouponIcon width={22} height={22} color={COLORS.redText} />
        <Text
          style={{
            ...pretendard(500),
            fontSize: TYPOGRAPHY.size.xl,
            color: COLORS.redText,
          }}
        >
          {maxDiscount}% 할인쿠폰 보유
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handleDownload}
      accessibilityRole="button"
      accessibilityLabel="최대 할인쿠폰 받기"
      style={{
        ...COUPON_BUTTON_STYLE,
        borderColor: COLORS.text,
      }}
    >
      <DownloadIcon width={22} height={22} />
      <Text
        style={{
          ...pretendard(500),
          fontSize: TYPOGRAPHY.size.xl,
          color: COLORS.text,
        }}
      >
        최대 할인쿠폰 받기
      </Text>
    </Pressable>
  );
}
