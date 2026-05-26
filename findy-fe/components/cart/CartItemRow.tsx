import { formatPrice } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { CartCheckbox } from "./CartCheckbox";
import { CartQuantityStepper } from "./CartQuantityStepper";
import {
  getOriginalPrice,
  getStockCount,
  getUnitPrice,
  isLowStock,
} from "./utils";

const THUMB_SIZE = 80;
const DELETE_SIZE = 22;

type CartItemRowProps = {
  item: CartLineItem;
  onToggleSelect: () => void;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
};

export function CartItemRow({
  item,
  onToggleSelect,
  onRemove,
  onQuantityChange,
}: CartItemRowProps) {
  const { product, quantity, selected } = item;
  const unitPrice = getUnitPrice(product);
  const originalPrice = getOriginalPrice(product);
  const stockCount = getStockCount(product);
  const maxQuantity = Math.max(stockCount, 1);
  const lowStock = isLowStock(product);

  return (
    <View
      className="border-b border-light-gray px-screen"
      style={{ paddingVertical: SPACING.md }}
    >
      <View className="flex-row items-start" style={{ gap: SPACING.sm }}>
        <CartCheckbox
          checked={selected}
          onPress={onToggleSelect}
          accessibilityLabel={`${product.name} 선택`}
        />

        <Image
          source={product.image}
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: 3,
          }}
          contentFit="cover"
        />

        <View className="min-w-0 flex-1" style={{ gap: SPACING.xs }}>
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className="flex-1 text-lg text-text-main"
              numberOfLines={2}
              style={pretendard(500)}
            >
              {product.name}
            </Text>
            <Pressable
              onPress={onRemove}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${product.name} 삭제`}
              className="items-center justify-center"
            >
              <Text
                style={{
                  ...pretendard(400),
                  fontSize: DELETE_SIZE,
                  color: COLORS.subText,
                  lineHeight: DELETE_SIZE,
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>

          <View className="flex-row flex-wrap items-center gap-1">
            <Text className="text-lg text-text-red" style={pretendard(700)}>
              {product.discountPercent}%
            </Text>
            <Text className="text-lg text-text-main" style={pretendard(700)}>
              {formatPrice(unitPrice)}
            </Text>
            <Text
              className="text-sm text-text-sub"
              style={{
                ...pretendard(400),
                textDecorationLine: "line-through",
              }}
            >
              {formatPrice(originalPrice)}
            </Text>
          </View>

          {lowStock ? (
            <Text className="text-sm text-text-red" style={pretendard(400)}>
              품절임박 {stockCount}개 남음
            </Text>
          ) : (
            <Text className="text-sm text-text-blue" style={pretendard(400)}>
              남은 재고 {stockCount}개
            </Text>
          )}

          <View className="flex-row justify-end pt-1">
            <CartQuantityStepper
              quantity={quantity}
              maxQuantity={maxQuantity}
              onDecrease={() => onQuantityChange(quantity - 1)}
              onIncrease={() => onQuantityChange(quantity + 1)}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
