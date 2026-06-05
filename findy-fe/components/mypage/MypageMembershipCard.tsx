import PointIcon from "@/assets/icons/point-icon.svg";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import {
  GRADE_IMAGES,
  formatPoints,
  getGradeConfig,
  type MypageUser,
} from "./mockUser";
import { MypageNavigateArrow } from "./MypageNavigateArrow";

const GRADE_ICON_SIZE = 40;

type MypageMembershipCardProps = {
  user: Pick<MypageUser, "grade" | "points">;
  onGetCouponPress?: () => void;
  downloadingMembershipCoupons?: boolean;
  onPointsPress?: () => void;
};

export function MypageMembershipCard({
  user,
  onGetCouponPress,
  downloadingMembershipCoupons = false,
  onPointsPress,
}: MypageMembershipCardProps) {
  const gradeConfig = getGradeConfig(user.grade);

  const handleGetCouponPress = () => {
    if (downloadingMembershipCoupons) {
      return;
    }

    onGetCouponPress?.();
  };

  return (
    <View
      style={{
        borderWidth: BORDER.base,
        borderColor: COLORS.text,
        borderRadius: RADIUS.md,
        overflow: "hidden",
      }}
    >
      <View
        className="flex-row items-center justify-between"
        style={{ padding: SPACING.md, gap: SPACING.sm }}
      >
        <View className="flex-1 flex-row items-center gap-3">
          <Image
            source={GRADE_IMAGES[user.grade]}
            style={{ width: GRADE_ICON_SIZE, height: GRADE_ICON_SIZE }}
            contentFit="contain"
          />
          <View className="flex-1 gap-1">
            <Text className="text-lg text-text-main" style={pretendard(700)}>
              {gradeConfig.label}
            </Text>
            <Text className="text-sm" style={pretendard(400)}>
              <Text style={{ color: COLORS.subText }}>
                {gradeConfig.benefitPrefix}
              </Text>
              <Text style={{ color: gradeConfig.highlightColor }}>
                {gradeConfig.benefitHighlight}
              </Text>
              <Text style={{ color: COLORS.subText }}>
                {gradeConfig.benefitSuffix}
              </Text>
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleGetCouponPress}
          disabled={downloadingMembershipCoupons}
          accessibilityRole="button"
          accessibilityLabel="쿠폰 받기"
          style={{
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.text,
            opacity: downloadingMembershipCoupons ? 0.7 : 1,
            minWidth: 92,
            alignItems: "center",
          }}
        >
          {downloadingMembershipCoupons ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text className="text-sm text-white" style={pretendard(600)}>
              쿠폰 받기
            </Text>
          )}
        </Pressable>
      </View>

      <View
        style={{ height: BORDER.thin, backgroundColor: COLORS.lightGray }}
      />

      <Pressable
        onPress={onPointsPress}
        accessibilityRole="button"
        accessibilityLabel="포인트 상세 보기"
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.md }}
      >
        <View className="flex-row items-center gap-2">
          <PointIcon width={17} height={17} />
          <Text className="text-md text-text-main" style={pretendard(700)}>
            포인트
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-md text-text-main" style={pretendard(700)}>
            {formatPoints(user.points)}
          </Text>
          <MypageNavigateArrow />
        </View>
      </Pressable>
    </View>
  );
}
