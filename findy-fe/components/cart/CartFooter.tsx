import { Button } from "@/components/common/Button";
import { formatPrice } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";
import { getUnitPrice } from "./utils";

export const CART_FOOTER_HEIGHT = 125;

type CartFooterProps = {
  availableItems: CartLineItem[];
  onCheckout: () => void;
  onStartShopping: () => void;
};

export function CartFooter({
  availableItems,
  onCheckout,
  onStartShopping,
}: CartFooterProps) {
  const selectedItems = availableItems.filter((item) => item.selected);
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
  const hasSelection = selectedQuantity > 0;
  const isEmpty = availableItems.length === 0;

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
        <Button onPress={onCheckout}>쇼핑 시작하기</Button>
      ) : (
        <Pressable
          onPress={onStartShopping}
          disabled={!isEmpty && availableItems.length > 0}
          accessibilityRole="button"
          accessibilityLabel="쇼핑 시작하기"
          accessibilityState={{
            disabled: !isEmpty && availableItems.length > 0,
          }}
          className="w-full min-h-[52px] items-center justify-center rounded-full px-lg py-lg"
          style={{
            backgroundColor: COLORS.gray,
            borderRadius: RADIUS.full,
            opacity: !isEmpty && availableItems.length > 0 ? 0.6 : 1,
          }}
        >
          <Text
            style={{
              ...pretendard(600),
              fontSize: TYPOGRAPHY.size.lg,
              color: COLORS.white,
            }}
          >
            쇼핑 시작하기
          </Text>
        </Pressable>
      )}
    </View>
  );
}
