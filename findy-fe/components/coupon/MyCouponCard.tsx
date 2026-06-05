import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import { CouponCardContent } from "./CouponCardContent";
import type { Coupon } from "./types";

type MyCouponCardProps = {
  coupon: Coupon;
};

export function MyCouponCard({ coupon }: MyCouponCardProps) {
  const isUsed = coupon.isUsed === true;

  return (
    <View
      style={{
        borderWidth: BORDER.base,
        borderColor: COLORS.gray,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        opacity: isUsed ? 0.55 : 1,
      }}
    >
      <CouponCardContent coupon={coupon} showDiscountChevron={false} />
      {isUsed ? (
        <Text
          style={{
            ...pretendard(600),
            fontSize: TYPOGRAPHY.size.sm,
            color: COLORS.subText2,
            marginTop: SPACING.sm,
            textAlign: "right",
          }}
        >
          사용 완료
        </Text>
      ) : null}
    </View>
  );
}
