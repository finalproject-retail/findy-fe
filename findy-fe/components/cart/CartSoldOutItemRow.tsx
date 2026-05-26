import { formatPrice } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { CartCheckbox } from "./CartCheckbox";
import { getOriginalPrice, getUnitPrice } from "@/components/cart/cartItemUtils";

const THUMB_SIZE = 80;
const DELETE_SIZE = 22;

type CartSoldOutItemRowProps = {
  item: CartLineItem;
  onRemove: () => void;
};

export function CartSoldOutItemRow({ item, onRemove }: CartSoldOutItemRowProps) {
  const { product } = item;
  const unitPrice = getUnitPrice(product);
  const originalPrice = getOriginalPrice(product);

  return (
    <View
      className="border-b border-light-gray px-screen opacity-50"
      style={{ paddingVertical: SPACING.md }}
    >
      <View className="flex-row items-start" style={{ gap: SPACING.sm }}>
        <CartCheckbox
          checked={false}
          disabled
          accessibilityLabel={`${product.name} 품절`}
        />

        <View style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
          <Image
            source={product.image}
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: 3,
            }}
            contentFit="cover"
          />
          <View
            className="absolute inset-0 items-center justify-center rounded-[3px]"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          >
            <Text className="text-sm text-white" style={pretendard(700)}>
              품절
            </Text>
          </View>
        </View>

        <View className="min-w-0 flex-1" style={{ gap: SPACING.xs }}>
          <View className="flex-row items-start justify-between gap-2">
            <Text
              className="flex-1 text-lg text-text-sub"
              numberOfLines={2}
              style={{
                ...pretendard(500),
                textDecorationLine: "line-through",
              }}
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

          <View
            className="flex-row flex-wrap items-center gap-1"
            style={{ opacity: 0.8 }}
          >
            <Text className="text-lg text-text-sub" style={pretendard(700)}>
              {product.discountPercent}%
            </Text>
            <Text className="text-lg text-text-sub" style={pretendard(700)}>
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
        </View>
      </View>
    </View>
  );
}
