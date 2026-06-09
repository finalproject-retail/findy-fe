import CartIcon from "@/assets/icons/cart-icon.svg";
import { ProductDiscountPriceRow } from "@/components/product/ProductDiscountPriceRow";
import { ProductThumbnail } from "@/components/product/ProductThumbnail";
import type { Product } from "@/components/product/types";
import { isOutOfStock } from "@/components/product/isOutOfStock";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export const CHATBOT_PRODUCT_CARD_WIDTH = 140;
const CART_BUTTON_SIZE = 28;

type ChatbotRecommendProductCardProps = {
  product: Product;
};

export function ChatbotRecommendProductCard({
  product,
}: ChatbotRecommendProductCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const soldOut = isOutOfStock(product);
  const imageSize = CHATBOT_PRODUCT_CARD_WIDTH - SPACING.sm * 2;

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddPress = () => {
    addToCart(product, 1)
      .then(() => showToast(TOAST_MESSAGES.addedToCart))
      .catch(console.error);
  };

  return (
    <View
      style={{
        width: CHATBOT_PRODUCT_CARD_WIDTH,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
        backgroundColor: COLORS.white,
        padding: SPACING.sm,
        gap: SPACING.xs,
      }}
    >
      <View style={{ width: imageSize, height: imageSize }}>
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
        >
          <ProductThumbnail product={product} width={imageSize} />
        </Pressable>

        {!soldOut ? (
          <Pressable
            onPress={handleAddPress}
            accessibilityRole="button"
            accessibilityLabel="장바구니에 담기"
            style={{
              position: "absolute",
              right: 4,
              bottom: 4,
              width: CART_BUTTON_SIZE,
              height: CART_BUTTON_SIZE,
              borderRadius: RADIUS.full,
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CartIcon width={16} height={16} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
        style={{ gap: 4 }}
      >
        <Text
          className="text-text-main"
          numberOfLines={2}
          style={{
            ...pretendard(500),
            fontSize: TYPOGRAPHY.size.xs,
            lineHeight: 18,
            minHeight: 36,
          }}
        >
          {product.name}
        </Text>

        <ProductDiscountPriceRow product={product} size="sm" />
      </Pressable>
    </View>
  );
}
