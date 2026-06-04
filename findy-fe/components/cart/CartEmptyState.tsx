import LogoGrey from "@/assets/icons/logo_grey.svg";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

const LOGO_WIDTH = 62;
const LOGO_HEIGHT = 77;

type CartEmptyStateProps = {
  onAddZone?: () => void;
};

export function CartEmptyState({ onAddZone }: CartEmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center px-screen"
      style={{ gap: SPACING.lg }}
    >
      <LogoGrey width={LOGO_WIDTH} height={LOGO_HEIGHT} />
      <View style={{ gap: SPACING.xs, alignItems: "center" }}>
        <Text className="text-lg text-text-main" style={pretendard(700)}>
          장바구니에 담긴 상품이 없습니다
        </Text>
        <Text
          className="text-center text-md text-text-sub2"
          style={pretendard(400)}
        >
          상품 없이도 구역만 골라{"\n"}쇼핑 코스를 만들 수 있어요
        </Text>
      </View>
      {onAddZone ? (
        <Pressable
          onPress={onAddZone}
          accessibilityRole="button"
          accessibilityLabel="구역 고르기"
          style={{
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.xl,
            borderRadius: RADIUS.full,
            borderWidth: BORDER.base,
            borderColor: COLORS.gray,
            backgroundColor: COLORS.white,
          }}
        >
          <Text className="text-md text-charcoal" style={pretendard(500)}>
            구역 고르기
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
