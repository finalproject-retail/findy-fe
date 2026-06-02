import { SquareButton } from "@/components/common/SquareButton";
import LogoGrey from "@/assets/icons/logo_grey.svg";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

const LOGO_WIDTH = 62;
const LOGO_HEIGHT = 77;

type CartZoneEmptyStateProps = {
  onPickZones: () => void;
};

export function CartZoneEmptyState({ onPickZones }: CartZoneEmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center px-screen"
      style={{ gap: SPACING.lg }}
    >
      <LogoGrey width={LOGO_WIDTH} height={LOGO_HEIGHT} />
      <View style={{ gap: SPACING.xs, alignItems: "center" }}>
        <Text className="text-lg text-text-main" style={pretendard(700)}>
          담은 구역이 없어요
        </Text>
        <Text
          className="text-center text-md text-text-sub2"
          style={pretendard(400)}
        >
          들르고 싶은 매장 구역을 골라{"\n"}쇼핑 경로를 만들어 보세요
        </Text>
      </View>
      <View className="w-full" style={{ maxWidth: 280 }}>
        <SquareButton onPress={onPickZones}>구역 고르기</SquareButton>
      </View>
    </View>
  );
}
