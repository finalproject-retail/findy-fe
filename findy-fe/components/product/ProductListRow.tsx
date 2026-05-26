import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { formatPrice } from "./formatPrice";
import { isOutOfStock } from "./isOutOfStock";
import { RemainingStockText } from "./RemainingStockText";
import type { Product } from "./types";

const IMAGE_SIZE = 100;

type ProductListRowProps = {
  product: Product;
};

export function ProductListRow({ product }: ProductListRowProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const soldOut = isOutOfStock(product);
  const stockCount = product.stockCount ?? 0;
  const originalPrice =
    product.originalPrice ??
    Math.round(product.price / (1 - product.discountPercent / 100));

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = () => {
    if (soldOut) return;
    // TODO: 장바구니 API
    showToast(TOAST_MESSAGES.addedToCart);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: SPACING.md,
        paddingVertical: SPACING.lg,
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
      }}
    >
      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
      >
        <View style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}>
          <Image
            source={product.image}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: RADIUS.xs,
            }}
            contentFit="cover"
          />
          {soldOut ? (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: RADIUS.xs,
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text className="text-lg text-white" style={pretendard(700)}>
                품절
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      <View
        className="min-w-0 flex-1"
        style={{ height: IMAGE_SIZE, justifyContent: "space-between" }}
      >
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
          style={{ gap: SPACING.xs }}
        >
          <Text
            className="text-md text-text-main"
            style={pretendard(500)}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <View className="flex-row flex-wrap items-center gap-1">
            <Text className="text-md text-text-red" style={pretendard(700)}>
              {product.discountPercent}%
            </Text>
            <Text className="text-md text-text-main" style={pretendard(700)}>
              {formatPrice(product.price)}
            </Text>
            <Text
              className="text-sm text-text-sub2"
              style={{ ...pretendard(400), textDecorationLine: "line-through" }}
            >
              {formatPrice(originalPrice)}
            </Text>
          </View>
        </Pressable>

        {!soldOut ? (
          <View className="flex-row items-end justify-between">
            <RemainingStockText stockCount={stockCount} />
            <Pressable
              onPress={handleAddToCart}
              accessibilityRole="button"
              accessibilityLabel="장바구니에 담기"
              style={{
                paddingHorizontal: SPACING.md,
                paddingVertical: SPACING.xs,
                borderRadius: RADIUS.full,
                borderWidth: BORDER.base,
                borderColor: COLORS.gray,
                backgroundColor: COLORS.white,
              }}
            >
              <Text className="text-xs text-charcoal" style={pretendard(500)}>
                장바구니 담기
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
