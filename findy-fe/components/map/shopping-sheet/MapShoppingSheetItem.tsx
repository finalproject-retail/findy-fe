import { CartCheckbox } from "@/components/cart/CartCheckbox";
import { CartQuantityStepper } from "@/components/cart/CartQuantityStepper";
import {
  getOriginalPrice,
  getStockCount,
  getUnitPrice,
  isLowStock,
} from "@/components/cart/cartItemUtils";
import { formatPrice } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

const THUMB_SIZE = 72;
const DELETE_SIZE = 22;

type MapShoppingSheetItemProps = {
  item: CartLineItem;
  pickedQuantity: number;
  onRemove: () => void;
  onQuantityChange: (quantity: number) => void;
  /** 바코드 연동 전 목업: 길게 눌러 픽 처리 */
  onSimulatePick?: () => void;
};

export function MapShoppingSheetItem({
  item,
  pickedQuantity,
  onRemove,
  onQuantityChange,
  onSimulatePick,
}: MapShoppingSheetItemProps) {
  const { product, quantity } = item;
  const isFullyPicked = pickedQuantity >= quantity;
  const unitPrice = getUnitPrice(product);
  const originalPrice = getOriginalPrice(product);
  const stockCount = getStockCount(product);
  const maxQuantity = Math.max(stockCount, 1);
  const lowStock = isLowStock(product);
  const struckStyle = isFullyPicked
    ? { textDecorationLine: "line-through" as const, color: COLORS.subText }
    : undefined;

  return (
    <Pressable
      onLongPress={onSimulatePick}
      delayLongPress={400}
      className="border-b border-light-gray px-screen"
      style={{ paddingVertical: SPACING.md }}
    >
      <View className="flex-row items-start" style={{ gap: SPACING.sm }}>
        <CartCheckbox
          checked={false}
          picked={isFullyPicked}
          disabled
          accessibilityLabel={`${product.name} 픽업 상태`}
        />

        <Image
          source={product.image}
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: 3,
            opacity: isFullyPicked ? 0.55 : 1,
          }}
          contentFit="cover"
        />

        <View className="min-w-0 flex-1" style={{ gap: SPACING.xs }}>
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className="flex-1 text-lg"
              numberOfLines={2}
              style={{ ...pretendard(500), ...struckStyle, color: struckStyle?.color ?? COLORS.text }}
            >
              {product.name}
            </Text>
            <Pressable
              onPress={onRemove}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${product.name} 삭제`}
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
            <Text
              className="text-lg text-text-red"
              style={{ ...pretendard(700), ...struckStyle }}
            >
              {product.discountPercent}%
            </Text>
            <Text
              className="text-lg"
              style={{
                ...pretendard(700),
                ...struckStyle,
                color: struckStyle?.color ?? COLORS.text,
              }}
            >
              {formatPrice(unitPrice)}
            </Text>
            <Text
              className="text-sm text-text-sub"
              style={{
                ...pretendard(400),
                textDecorationLine: "line-through",
                opacity: isFullyPicked ? 0.7 : 1,
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
    </Pressable>
  );
}
