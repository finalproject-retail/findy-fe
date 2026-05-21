import PointIcon from "@/assets/icons/point-icon.svg";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { GRADE_IMAGES, formatPoints, type MypageUser } from "./mockUser";

const GRADE_BENEFIT_GOLD = "#C9A227";
const GRADE_ICON_SIZE = 40;
const CHEVRON_COLOR = COLORS.subText2;

type MypageMembershipCardProps = {
  user: Pick<
    MypageUser,
    | "grade"
    | "gradeLabel"
    | "gradeBenefitPrefix"
    | "gradeBenefitHighlight"
    | "gradeBenefitSuffix"
    | "points"
  >;
  onGetCouponPress?: () => void;
  onPointsPress?: () => void;
};

function ChevronRight() {
  return (
    <Text
      style={{
        ...pretendard(400),
        fontSize: 18,
        color: CHEVRON_COLOR,
        lineHeight: 20,
      }}
    >
      &gt;
    </Text>
  );
}

export function MypageMembershipCard({
  user,
  onGetCouponPress,
  onPointsPress,
}: MypageMembershipCardProps) {
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
            <Text className="text-xl text-text-main" style={pretendard(700)}>
              {user.gradeLabel}
            </Text>
            <Text className="text-md" style={pretendard(400)}>
              <Text style={{ color: COLORS.subText }}>
                {user.gradeBenefitPrefix}
              </Text>
              <Text style={{ color: GRADE_BENEFIT_GOLD }}>
                {user.gradeBenefitHighlight}
              </Text>
              <Text style={{ color: COLORS.subText }}>
                {user.gradeBenefitSuffix}
              </Text>
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onGetCouponPress}
          accessibilityRole="button"
          accessibilityLabel="쿠폰 받기"
          style={{
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.text,
          }}
        >
          <Text className="text-lg text-white" style={pretendard(600)}>
            쿠폰 받기
          </Text>
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
          <Text className="text-lg text-text-main" style={pretendard(700)}>
            포인트
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-lg text-text-main" style={pretendard(700)}>
            {formatPoints(user.points)}
          </Text>
          <ChevronRight />
        </View>
      </Pressable>
    </View>
  );
}
