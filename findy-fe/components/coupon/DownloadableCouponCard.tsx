import RedCheckIcon from "@/assets/icons/red-check-icon.svg";
import DownloadIcon from "@/assets/icons/download-icon.svg";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { Pressable, View } from "react-native";
import { CouponCardContent } from "./CouponCardContent";
import type { Coupon } from "./types";

const ACTION_WIDTH = 56;

type DownloadableCouponCardProps = {
  coupon: Coupon;
  downloaded: boolean;
  downloading?: boolean;
  onDownload: () => void;
};

export function DownloadableCouponCard({
  coupon,
  downloaded,
  downloading = false,
  onDownload,
}: DownloadableCouponCardProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderWidth: BORDER.base,
        borderColor: COLORS.lightGray,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.white,
        overflow: "hidden",
      }}
    >
      <View style={{ flex: 1, padding: SPACING.md }}>
        <CouponCardContent coupon={coupon} />
      </View>

      <View
        style={{
          width: ACTION_WIDTH,
          borderLeftWidth: BORDER.base,
          borderLeftColor: COLORS.gray,
          borderStyle: "dashed",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={onDownload}
          disabled={downloaded || downloading}
          accessibilityRole="button"
          accessibilityLabel={
            downloaded ? "다운로드 완료" : "쿠폰 다운로드"
          }
          accessibilityState={{ disabled: downloaded || downloading }}
          hitSlop={8}
          style={{ opacity: downloading ? 0.5 : 1 }}
        >
          {downloaded ? (
            <RedCheckIcon width={28} height={28} />
          ) : (
            <DownloadIcon width={28} height={28} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
