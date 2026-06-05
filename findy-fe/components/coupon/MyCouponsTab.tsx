import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
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
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export function MyCouponsTab({
  coupons,
  filter,
  onFilterChange,
  onBrowseCoupons,
  contentPaddingBottom,
  loading = false,
  error = null,
  onRetry,
}: MyCouponsTabProps) {
  const isEmpty = !loading && !error && coupons.length === 0;

  return (
    <View className="flex-1">
      <View
        className="px-screen"
        style={{ paddingTop: SPACING.md, paddingBottom: SPACING.md }}
      >
        <CouponFilterChips value={filter} onChange={onFilterChange} />
      </View>

      {loading && coupons.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.blueText} />
        </View>
      ) : error && coupons.length === 0 ? (
        <View
          className="flex-1 items-center justify-center px-screen"
          style={{ gap: SPACING.md, paddingBottom: contentPaddingBottom }}
        >
          <Text
            className="text-center text-md text-text-sub"
            style={pretendard(400)}
          >
            {error}
          </Text>
          {onRetry ? (
            <Pressable
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="다시 시도"
            >
              <Text className="text-md text-text-blue" style={pretendard(600)}>
                다시 시도
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : isEmpty ? (
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
