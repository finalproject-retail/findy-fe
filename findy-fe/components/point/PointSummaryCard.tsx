import { formatPoints } from "@/components/mypage/mockUser";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type PointSummaryCardProps = {
  balance: number;
  expiringThisMonth: number;
};

export function PointSummaryCard({
  balance,
  expiringThisMonth,
}: PointSummaryCardProps) {
  const month = new Date().getMonth() + 1;

  return (
    <View
      style={{
        backgroundColor: COLORS.text,
        padding: SPACING.screen,
      }}
    >
      <View
        style={{
          backgroundColor: COLORS.white,
          borderWidth: BORDER.thin,
          borderColor: COLORS.gray,
          borderRadius: RADIUS.md,
          padding: SPACING.lg,
          gap: SPACING.md,
        }}
      >
        <View style={{ gap: SPACING.xs }}>
          <Text className="text-sm text-text-sub" style={pretendard(400)}>
            내 핀디 포인트
          </Text>
          <Text className="text-2xl text-text-main" style={pretendard(700)}>
            {formatPoints(balance)}
          </Text>
        </View>

        <View style={{ height: BORDER.thin, backgroundColor: COLORS.gray }} />

        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-text-sub" style={pretendard(400)}>
            {month}월 내 소멸 예정
          </Text>
          <Text className="text-sm text-text-sub" style={pretendard(400)}>
            {formatPoints(expiringThisMonth)}
          </Text>
        </View>
      </View>
    </View>
  );
}
