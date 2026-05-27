import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { ScrollView, Text, View } from "react-native";
import { CouponFilterChips } from "./CouponFilterChips";
import { MyCouponCard } from "./MyCouponCard";
import { MyCouponsEmptyState } from "./MyCouponsEmptyState";
import type { Coupon, CouponFilter } from "./types";

type MyCouponsTabProps = {
  coupons: Coupon[];
  filter: CouponFilter;
  onFilterChange: (filter: CouponFilter) => void;
  onBrowseCoupons: () => void;
  contentPaddingBottom: number;
};

export function MyCouponsTab({
  coupons,
  filter,
  onFilterChange,
  onBrowseCoupons,
  contentPaddingBottom,
}: MyCouponsTabProps) {
  const isEmpty = coupons.length === 0;

  return (
    <View className="flex-1">
      <View
        className="px-screen"
        style={{ paddingTop: SPACING.md, paddingBottom: SPACING.md }}
      >
        <CouponFilterChips value={filter} onChange={onFilterChange} />
      </View>

      {isEmpty ? (
        <View style={{ flex: 1, paddingBottom: contentPaddingBottom }}>
          <MyCouponsEmptyState onBrowseCoupons={onBrowseCoupons} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.screen,
            paddingBottom: contentPaddingBottom,
            gap: SPACING.md,
          }}
        >
          <Text className="text-sm text-text-sub" style={pretendard(500)}>
            전체 {coupons.length}장
          </Text>
          {coupons.map((coupon) => (
            <MyCouponCard key={coupon.id} coupon={coupon} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
