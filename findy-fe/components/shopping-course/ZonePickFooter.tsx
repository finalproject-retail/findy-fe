import { SquareButton } from "@/components/common/SquareButton";
import { CART_ZONE_FOOTER_HEIGHT } from "@/components/cart";
import { MAX_SHOPPING_ZONES } from "@/constants/shoppingCourse";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

/** 장바구니 구역 탭 푸터와 동일 높이 (스크롤 여백) */
export const ZONE_PICK_FOOTER_HEIGHT = CART_ZONE_FOOTER_HEIGHT;

type ZonePickFooterProps = {
  selectedCount: number;
  onConfirm: () => void;
};

export function ZonePickFooter({
  selectedCount,
  onConfirm,
}: ZonePickFooterProps) {
  const canConfirm = selectedCount > 0;
  const buttonLabel =
    selectedCount > 0 ? `${selectedCount}개 구역 담기` : "구역 담기";

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-light-gray bg-white"
      style={{
        paddingHorizontal: SPACING.screen,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
        gap: SPACING.md,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg text-text-main" style={pretendard(400)}>
          최대 방문 구역{" "}
          <Text style={pretendard(700)}>
            {selectedCount} / {MAX_SHOPPING_ZONES}
          </Text>
        </Text>
      </View>

      {canConfirm ? (
        <SquareButton onPress={onConfirm}>{buttonLabel}</SquareButton>
      ) : (
        <SquareButton
          disabled
          accessibilityLabel={buttonLabel}
          accessibilityState={{ disabled: true }}
        >
          {buttonLabel}
        </SquareButton>
      )}
    </View>
  );
}
