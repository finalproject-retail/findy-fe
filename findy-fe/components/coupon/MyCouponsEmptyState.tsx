import CouponIcon from "@/assets/icons/coupon-icon.svg";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

const COUPON_ICON_SIZE = 90;

type MyCouponsEmptyStateProps = {
  onBrowseCoupons: () => void;
};

export function MyCouponsEmptyState({
  onBrowseCoupons,
}: MyCouponsEmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center px-screen"
      style={{ flex: 1 }}
    >
      <CouponIcon
        width={COUPON_ICON_SIZE}
        height={COUPON_ICON_SIZE}
        color={COLORS.subText2}
      />
      <Text
        className="mt-lg text-center text-lg text-text-sub2"
        style={pretendard(500)}
      >
        사용할 수 있는 쿠폰이 없어요 😭
      </Text>
      <Pressable
        onPress={onBrowseCoupons}
        accessibilityRole="button"
        accessibilityLabel="새로운 쿠폰 보러가기"
        style={{
          marginTop: SPACING.lg,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.xl,
          borderRadius: RADIUS.full,
          borderWidth: BORDER.base,
          borderColor: COLORS.gray,
          backgroundColor: COLORS.white,
        }}
      >
        <Text className="text-md text-charcoal" style={pretendard(500)}>
          새로운 쿠폰 보러가기
        </Text>
      </Pressable>
    </View>
  );
}
