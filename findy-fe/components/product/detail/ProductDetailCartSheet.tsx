import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { formatPrice } from "../formatPrice";
import { ProductDiscountPriceRow } from "../ProductDiscountPriceRow";
import { RemainingStockText } from "../RemainingStockText";
import type { Product } from "../types";

const THUMB_SIZE = 72;
const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;
const MIN_QUANTITY = 1;
const STEPPER_SYMBOL_SIZE = 24;

type ProductDetailCartSheetProps = {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

function QuantityStepper({
  quantity,
  maxQuantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  maxQuantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const canDecrease = quantity > MIN_QUANTITY;
  const canIncrease = quantity < maxQuantity;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.text,
        borderRadius: RADIUS.md,
        height: 36,
      }}
    >
      <Pressable
        onPress={onDecrease}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel="수량 줄이기"
        style={{
          width: 32,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          opacity: canDecrease ? 1 : 0.3,
        }}
      >
        <Text
          style={{
            ...pretendard(500),
            fontSize: STEPPER_SYMBOL_SIZE,
            color: COLORS.text,
            lineHeight: STEPPER_SYMBOL_SIZE,
          }}
        >
          −
        </Text>
      </Pressable>

      <Text
        style={{
          ...pretendard(500),
          fontSize: TYPOGRAPHY.size.xl,
          color: COLORS.text,
          minWidth: 24,
          textAlign: "center",
          lineHeight: STEPPER_SYMBOL_SIZE,
        }}
      >
        {quantity}
      </Text>

      <Pressable
        onPress={onIncrease}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel="수량 늘리기"
        style={{
          width: 32,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          opacity: canIncrease ? 1 : 0.3,
        }}
      >
        <Text
          style={{
            ...pretendard(500),
            fontSize: STEPPER_SYMBOL_SIZE,
            color: COLORS.text,
            lineHeight: STEPPER_SYMBOL_SIZE,
          }}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}

export function ProductDetailCartSheet({
  product,
  quantity,
  onQuantityChange,
}: ProductDetailCartSheetProps) {
  const unitPrice = product.couponPrice ?? product.price;
  const stockCount = product.stockCount ?? 99;
  const maxQuantity = Math.max(stockCount, MIN_QUANTITY);
  const totalPrice = unitPrice * quantity;

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderTopLeftRadius: RADIUS.lg,
        borderTopRightRadius: RADIUS.lg,
      }}
    >
      <View
        style={{
          alignItems: "center",
          paddingTop: SPACING.sm,
          paddingBottom: SPACING.md,
        }}
      >
        <View
          style={{
            width: HANDLE_WIDTH,
            height: HANDLE_HEIGHT,
            borderRadius: HANDLE_HEIGHT / 2,
            backgroundColor: COLORS.gray,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACING.sm,
          paddingHorizontal: SPACING.screen,
          paddingBottom: SPACING.md,
        }}
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

        <View className="flex-1" style={{ gap: SPACING.xs }}>
          <Text
            className="text-md text-text-main"
            numberOfLines={2}
            style={pretendard(500)}
          >
            {product.name}
          </Text>

          <ProductDiscountPriceRow
            product={product}
            salePrice={unitPrice}
            size="md"
          />

          <RemainingStockText stockCount={stockCount} size="sm" />
        </View>

        <QuantityStepper
          quantity={quantity}
          maxQuantity={maxQuantity}
          onDecrease={() =>
            onQuantityChange(Math.max(MIN_QUANTITY, quantity - 1))
          }
          onIncrease={() =>
            onQuantityChange(Math.min(maxQuantity, quantity + 1))
          }
        />
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          paddingHorizontal: SPACING.screen,
          paddingVertical: SPACING.sm,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text className="text-md text-text-main" style={pretendard(400)}>
          총 수량 <Text style={pretendard(700)}>{quantity}개</Text>
        </Text>
        <Text className="text-md text-text-main" style={pretendard(400)}>
          총 구매 금액{" "}
          <Text style={pretendard(700)}>{formatPrice(totalPrice)}</Text>
        </Text>
      </View>
    </View>
  );
}
