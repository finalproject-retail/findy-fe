import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { View } from "react-native";
import { CouponCardContent } from "./CouponCardContent";
import type { Coupon } from "./types";

type MyCouponCardProps = {
  coupon: Coupon;
};

export function MyCouponCard({ coupon }: MyCouponCardProps) {
  return (
    <View
      style={{
        borderWidth: BORDER.base,
        borderColor: COLORS.gray,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.white,
        padding: SPACING.md,
      }}
    >
      <CouponCardContent coupon={coupon} showDiscountChevron={false} />
    </View>
  );
}
