import CartIcon from "@/assets/icons/cart-icon.svg";
import { ProductDiscountPriceRow } from "@/components/product/ProductDiscountPriceRow";
import { ProductThumbnail } from "@/components/product/ProductThumbnail";
import type { Product } from "@/components/product/types";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useCart } from "@/contexts/CartContext";
import { isOutOfStock } from "@/components/product/isOutOfStock";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

const CARD_WIDTH = 140;
const CARD_GAP = 10;
const CART_BUTTON_SIZE = 28;

type ChatbotRecommendedProductsProps = {
  products: Product[];
};

function ChatbotRecommendProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const soldOut = isOutOfStock(product);
  const imageSize = CARD_WIDTH - SPACING.sm * 2;

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
        width: CARD_WIDTH,
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

export function ChatbotRecommendedProducts({
  products,
}: ChatbotRecommendedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: SPACING.sm, gap: SPACING.xs, maxWidth: "100%" }}>
      <Text
        className="text-text-sub"
        style={{ ...pretendard(500), fontSize: TYPOGRAPHY.size.xs }}
      >
        추천 상품
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => `chatbot-rec-${item.id}`}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={CARD_WIDTH + CARD_GAP}
        contentContainerStyle={{ gap: CARD_GAP, paddingRight: SPACING.sm }}
        renderItem={({ item }) => <ChatbotRecommendProductCard product={item} />}
      />
    </View>
  );
}
