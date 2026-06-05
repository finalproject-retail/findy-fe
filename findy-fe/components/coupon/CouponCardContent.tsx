import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import type { Coupon } from "./types";

type CouponCardContentProps = {
  coupon: Coupon;
  showDiscountChevron?: boolean;
};

/** 최소 구매 조건 유무와 관계없이 카드 높이 맞춤 */
const MIN_PURCHASE_ROW_HEIGHT = 18;

export function CouponCardContent({
  coupon,
  showDiscountChevron = true,
}: CouponCardContentProps) {
  const discountLabel =
    coupon.discountType === "percent"
      ? `${coupon.discountAmount}% 할인`
      : `${coupon.discountAmount.toLocaleString("ko-KR")}원 할인`;

  return (
    <View style={{ gap: SPACING.xs, flex: 1 }}>
      <Text
        style={{
          ...pretendard(700),
          fontSize: TYPOGRAPHY.size.lg,
          color: COLORS.redText,
        }}
      >
        {showDiscountChevron ? `${discountLabel} >` : discountLabel}
      </Text>
      <Text
        className="text-md text-text-main"
        style={pretendard(600)}
        numberOfLines={2}
      >
        {coupon.name}
      </Text>
      <View style={{ minHeight: MIN_PURCHASE_ROW_HEIGHT, justifyContent: "center" }}>
        {coupon.minPurchaseAmount > 0 ? (
          <Text className="text-sm text-text-sub2" style={pretendard(400)}>
            {coupon.minPurchaseAmount.toLocaleString("ko-KR")}원 이상 구매 시
          </Text>
        ) : null}
      </View>
      <Text className="text-sm text-text-sub2" style={pretendard(400)}>
        {coupon.expiresAtLabel}
      </Text>
    </View>
  );
}
