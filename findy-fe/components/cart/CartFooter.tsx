import { SquareButton } from "@/components/common/SquareButton";
import { formatPrice } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import { getUnitPrice } from "@/components/cart/cartItemUtils";

export const CART_FOOTER_HEIGHT = 155;

type CartFooterProps = {
  availableItems: CartLineItem[];
  zoneCount: number;
  onCheckout: () => void;
};

export function CartFooter({
  availableItems,
  zoneCount,
  onCheckout,
}: CartFooterProps) {
  const selectedItems = availableItems.filter((item) => item.selected);
  const selectedProductCount = selectedItems.length;
  const selectedQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalItemQuantity = availableItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const totalPrice = selectedItems.reduce(
    (sum, item) => sum + getUnitPrice(item.product) * item.quantity,
    0,
  );
  const hasSelection = selectedQuantity > 0 || zoneCount > 0;

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
      <Text className="text-md text-text-sub" style={pretendard(500)}>
        상품 {selectedProductCount}개 · 구역 {zoneCount}개
      </Text>

      <View className="flex-row items-center justify-between">
        <Text className="text-lg text-text-main" style={pretendard(400)}>
          총 수량{" "}
          <Text style={pretendard(700)}>
            {selectedQuantity} / {totalItemQuantity}
          </Text>
        </Text>
        <Text className="text-lg text-text-main" style={pretendard(400)}>
          총 구매 금액{" "}
          <Text style={pretendard(700)}>{formatPrice(totalPrice)}</Text>
        </Text>
      </View>

      {hasSelection ? (
        <SquareButton onPress={onCheckout}>쇼핑 시작하기</SquareButton>
      ) : (
        <SquareButton
          disabled
          accessibilityLabel="쇼핑 시작하기"
          accessibilityState={{ disabled: true }}
        >
          쇼핑 시작하기
        </SquareButton>
      )}
    </View>
  );
}
