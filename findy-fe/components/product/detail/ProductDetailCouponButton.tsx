import CouponIcon from "@/assets/icons/coupon-icon.svg";
import DownloadIcon from "@/assets/icons/download-icon.svg";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

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
  maxDiscountPercent: number;
  allDownloaded: boolean;
  downloading?: boolean;
  onDownload: () => void;
};

export function ProductDetailCouponButton({
  maxDiscountPercent,
  allDownloaded,
  downloading = false,
  onDownload,
}: ProductDetailCouponButtonProps) {
  if (allDownloaded) {
    return (
      <View
        accessibilityRole="text"
        accessibilityLabel={`${maxDiscountPercent}% 할인쿠폰 보유`}
        style={{
          ...COUPON_BUTTON_STYLE,
          borderColor: COLORS.redText,
        }}
      >
        <CouponIcon width={22} height={22} color={COLORS.redText} />
        <Text
          style={{
            ...pretendard(500),
            fontSize: TYPOGRAPHY.size.lg,
            color: COLORS.redText,
          }}
        >
          {maxDiscountPercent}% 할인쿠폰 보유
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onDownload}
      disabled={downloading}
      accessibilityRole="button"
      accessibilityLabel="최대 할인쿠폰 받기"
      accessibilityState={{ disabled: downloading, busy: downloading }}
      style={{
        ...COUPON_BUTTON_STYLE,
        borderColor: COLORS.text,
        opacity: downloading ? 0.7 : 1,
      }}
    >
      {downloading ? (
        <ActivityIndicator size="small" color={COLORS.text} />
      ) : (
        <DownloadIcon width={22} height={22} />
      )}
      <Text
        style={{
          ...pretendard(500),
          fontSize: TYPOGRAPHY.size.lg,
          color: COLORS.text,
        }}
      >
        최대 할인쿠폰 받기
      </Text>
    </Pressable>
  );
}
