import { getUnitPrice } from "@/components/cart/cartItemUtils";
import { formatPrice } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type MapShoppingSheetFooterProps = {
  tripLineItems: CartLineItem[];
  pickedQuantityByProductId: Record<string, number>;
  onShopLater: () => void;
  onFinishShopping: () => void;
  bottomInset?: number;
};

export function MapShoppingSheetFooter({
  tripLineItems,
  pickedQuantityByProductId,
  onShopLater,
  onFinishShopping,
  bottomInset = 0,
}: MapShoppingSheetFooterProps) {
  const totalQuantity = tripLineItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const pickedQuantity = tripLineItems.reduce(
    (sum, item) => sum + (pickedQuantityByProductId[item.productId] ?? 0),
    0,
  );
  const totalPrice = tripLineItems.reduce(
    (sum, item) => sum + getUnitPrice(item.product) * item.quantity,
    0,
  );
  const hasTrip = tripLineItems.length > 0;

  return (
    <View
      className="border-t border-light-gray bg-white"
      style={{
        paddingHorizontal: SPACING.screen,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm + bottomInset,
        gap: SPACING.md,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-lg text-text-main" style={pretendard(400)}>
          총 수량{" "}
          <Text style={pretendard(700)}>
            {hasTrip ? `${pickedQuantity} / ${totalQuantity}` : "0"}개
          </Text>
        </Text>
        <Text className="text-lg text-text-main" style={pretendard(400)}>
          총 구매 금액{" "}
          <Text style={pretendard(700)}>{formatPrice(hasTrip ? totalPrice : 0)}</Text>
        </Text>
      </View>

      <View className="flex-row items-center" style={{ gap: SPACING.sm }}>
        <Pressable
          onPress={onShopLater}
          accessibilityRole="button"
          accessibilityLabel="다음에 쇼핑하기"
          className="min-h-[52px] items-center justify-center rounded-full border border-gray bg-white"
          style={{ flex: 0.9, borderColor: COLORS.gray }}
        >
          <Text
            className="text-md text-text-sub"
            style={pretendard(600)}
          >
            다음에 쇼핑하기
          </Text>
        </Pressable>

        <Pressable
          onPress={onFinishShopping}
          accessibilityRole="button"
          accessibilityLabel="쇼핑 완료하기"
          className="min-h-[52px] overflow-hidden rounded-full"
          style={{ flex: 1.55 }}
        >
          <LinearGradient
            colors={[COLORS.main, "#FF7A9A"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              flex: 1,
              minHeight: 52,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: RADIUS.full,
              paddingHorizontal: SPACING.md,
            }}
          >
            <Text
              style={{
                ...pretendard(600),
                fontSize: TYPOGRAPHY.size.lg,
                color: COLORS.white,
              }}
            >
              쇼핑 완료하기
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
