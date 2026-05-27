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
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

const CHECKBOX_SIZE = 24;
const THUMB_SIZE = 60;
const DELETE_SIZE = 26;
const ROW_GAP = SPACING.sm;
const TITLE_LINE_HEIGHT = 20;

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
      style={{ paddingVertical: SPACING.sm }}
    >
      <View className="flex-row items-start" style={{ gap: ROW_GAP }}>
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

        <View className="min-w-0 flex-1" style={{ gap: 3 }}>
          <View className="flex-row items-start" style={{ gap: SPACING.xs }}>
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                ...pretendard(500),
                fontSize: TYPOGRAPHY.size.md,
                lineHeight: TITLE_LINE_HEIGHT,
                ...struckStyle,
                color: struckStyle?.color ?? COLORS.text,
              }}
            >
              {product.name}
            </Text>

            <Pressable
              onPress={onRemove}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`${product.name} 삭제`}
              style={{
                width: DELETE_SIZE,
                height: TITLE_LINE_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
              }}
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

          {lowStock ? (
            <Text
              style={{
                ...pretendard(400),
                fontSize: TYPOGRAPHY.size.xs,
                color: COLORS.redText,
              }}
            >
              품절임박 {stockCount}개 남음
            </Text>
          ) : (
            <Text
              style={{
                ...pretendard(400),
                fontSize: TYPOGRAPHY.size.xs,
                color: COLORS.blueText,
              }}
            >
              남은 재고 {stockCount}개
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "nowrap",
              gap: SPACING.xs,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...pretendard(700),
                fontSize: TYPOGRAPHY.size.md,
                color: COLORS.redText,
                flexShrink: 0,
                ...struckStyle,
              }}
            >
              {product.discountPercent}%
            </Text>
            <Text
              numberOfLines={1}
              style={{
                ...pretendard(700),
                fontSize: TYPOGRAPHY.size.md,
                flexShrink: 0,
                ...struckStyle,
                color: struckStyle?.color ?? COLORS.text,
              }}
            >
              {formatPrice(unitPrice)}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                ...pretendard(400),
                fontSize: TYPOGRAPHY.size.sm,
                color: COLORS.subText,
                textDecorationLine: "line-through",
                opacity: isFullyPicked ? 0.7 : 1,
                flexShrink: 1,
              }}
            >
              {formatPrice(originalPrice)}
            </Text>
          </View>

          <View
            style={{
              alignSelf: "flex-end",
              marginTop: SPACING.xs,
            }}
          >
            <CartQuantityStepper
              compact
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
