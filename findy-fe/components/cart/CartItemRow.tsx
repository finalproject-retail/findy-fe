import { ProductDiscountPriceRow } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { CartCheckbox } from "./CartCheckbox";
import { CartQuantityStepper } from "./CartQuantityStepper";
import {
  getStockCount,
  getUnitPrice,
  isLowStock,
} from "@/components/cart/cartItemUtils";

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
  const router = useRouter();
  const { product, quantity, selected } = item;
  const unitPrice = getUnitPrice(product);
  const stockCount = getStockCount(product);
  const maxQuantity = Math.max(stockCount, 1);
  const lowStock = isLowStock(product);

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

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

        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
        >
          <Image
            source={product.image}
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: 3,
            }}
            contentFit="cover"
          />
        </Pressable>

        <View className="min-w-0 flex-1" style={{ gap: SPACING.xs }}>
          <View className="flex-row items-start justify-between gap-2">
            <Pressable
              onPress={openProductDetail}
              className="flex-1"
              accessibilityRole="button"
              accessibilityLabel={`${product.name} 상세 보기`}
            >
              <Text
                className="text-lg text-text-main"
                numberOfLines={2}
                style={pretendard(500)}
              >
                {product.name}
              </Text>
            </Pressable>
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

          <ProductDiscountPriceRow
            product={product}
            salePrice={unitPrice}
            size="lg"
          />

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
