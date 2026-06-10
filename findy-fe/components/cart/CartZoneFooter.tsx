import { SquareButton } from "@/components/common/SquareButton";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

export const CART_ZONE_FOOTER_HEIGHT = 125;

type CartZoneFooterProps = {
  zoneCount: number;
  onPickZones: () => void;
  onStartRoute: () => void;
};

export function CartZoneFooter({
  zoneCount,
  onPickZones,
  onStartRoute,
}: CartZoneFooterProps) {
  const canStart = zoneCount > 0;

  return (
    <View
      className="border-t border-light-gray bg-white"
      style={{
        paddingHorizontal: SPACING.screen,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
        gap: SPACING.md,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg text-text-main" style={pretendard(400)}>
          총 방문 구역{" "}
          <Text style={pretendard(700)}>{zoneCount}개</Text>
        </Text>
        {zoneCount > 0 ? (
          <Pressable
            onPress={onPickZones}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="구역 추가 또는 수정"
          >
            <Text className="text-md text-text-blue" style={pretendard(600)}>
              추가·수정
            </Text>
          </Pressable>
        ) : null}
      </View>

      {canStart ? (
        <SquareButton onPress={onStartRoute}>
          이 구역으로 경로 만들기
        </SquareButton>
      ) : (
        <SquareButton
          disabled
          accessibilityLabel="이 구역으로 경로 만들기"
          accessibilityState={{ disabled: true }}
        >
          이 구역으로 경로 만들기
        </SquareButton>
      )}
    </View>
  );
}
