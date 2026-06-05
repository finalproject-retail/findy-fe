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
import { DownloadableCouponCard } from "./DownloadableCouponCard";
import type { Coupon, CouponFilter } from "./types";

type GetCouponsTabProps = {
  coupons: Coupon[];
  filter: CouponFilter;
  onFilterChange: (filter: CouponFilter) => void;
  onDownload: (couponId: string) => void;
  contentPaddingBottom: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  downloadingCouponId?: string | null;
};

export function GetCouponsTab({
  coupons,
  filter,
  onFilterChange,
  onDownload,
  contentPaddingBottom,
  loading = false,
  error = null,
  onRetry,
  downloadingCouponId = null,
}: GetCouponsTabProps) {
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
        <View
          className="flex-1 items-center justify-center px-screen"
          style={{ paddingBottom: contentPaddingBottom }}
        >
          <Text
            className="text-center text-md text-text-sub"
            style={pretendard(400)}
          >
            받을 수 있는 쿠폰이 없습니다.
          </Text>
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
          {coupons.map((coupon) => (
            <DownloadableCouponCard
              key={coupon.id}
              coupon={coupon}
              downloaded={coupon.isDownloaded === true}
              downloading={downloadingCouponId === coupon.id}
              onDownload={() => onDownload(coupon.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
