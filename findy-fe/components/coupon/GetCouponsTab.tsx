import { SPACING } from "@/constants/theme";
import { ScrollView, View } from "react-native";
import { CouponFilterChips } from "./CouponFilterChips";
import { DownloadableCouponCard } from "./DownloadableCouponCard";
import type { Coupon, CouponFilter } from "./types";

type GetCouponsTabProps = {
  coupons: Coupon[];
  filter: CouponFilter;
  onFilterChange: (filter: CouponFilter) => void;
  downloadedIds: Set<string>;
  onDownload: (couponId: string) => void;
  contentPaddingBottom: number;
};

export function GetCouponsTab({
  coupons,
  filter,
  onFilterChange,
  downloadedIds,
  onDownload,
  contentPaddingBottom,
}: GetCouponsTabProps) {
  return (
    <View className="flex-1">
      <View
        className="px-screen"
        style={{ paddingTop: SPACING.md, paddingBottom: SPACING.md }}
      >
        <CouponFilterChips value={filter} onChange={onFilterChange} />
      </View>

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
            downloaded={downloadedIds.has(coupon.id)}
            onDownload={() => onDownload(coupon.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
