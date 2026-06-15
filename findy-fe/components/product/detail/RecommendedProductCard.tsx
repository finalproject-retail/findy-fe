import CartIcon from "@/assets/icons/cart-icon.svg";
import { COLORS, RADIUS, TYPOGRAPHY } from "@/constants/theme";
import { SEARCH_ADD_MODE_SHOPPING_LIST } from "@/constants/searchAddMode";
import { useProductAddMode } from "@/components/product/useProductAddMode";
import type { ProductRecommendationVariant } from "@/hooks/useProductRecommendations";
import {
  reportRecommendationClick,
  reportSubstituteSelection,
} from "@/lib/recommendations/recommendationLogTracker";
import { useCart } from "@/contexts/CartContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { isOutOfStock } from "../isOutOfStock";
import { ProductDiscountPriceRow } from "../ProductDiscountPriceRow";
import { ProductThumbnail } from "../ProductThumbnail";
import type { Product } from "../types";

const PRODUCT_NAME_LINE_HEIGHT = 20;
const PRODUCT_NAME_MIN_HEIGHT = PRODUCT_NAME_LINE_HEIGHT * 2;
const CART_BUTTON_SIZE = 32;

type RecommendedProductCardProps = {
  product: Product;
  width: number;
  shoppingListAddMode?: boolean;
  recommendationVariant?: ProductRecommendationVariant;
};

function reportRecommendationInteraction(
  product: Product,
  variant?: ProductRecommendationVariant,
) {
  if (product.recommendationLogId == null) {
    return;
  }

  if (
    variant === "substitute" &&
    product.recommendationSourceProductId
  ) {
    reportSubstituteSelection({
      recommendationLogId: product.recommendationLogId,
      sourceProductId: product.recommendationSourceProductId,
      selectedProductId: product.id,
    });
    return;
  }

  reportRecommendationClick({
    recommendationLogId: product.recommendationLogId,
    productId: product.id,
    sourceProductId: product.recommendationSourceProductId,
  });
}

export function RecommendedProductCard({
  product,
  width,
  shoppingListAddMode = false,
  recommendationVariant,
}: RecommendedProductCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const isShoppingListMode = useProductAddMode(shoppingListAddMode);
  const { addProductToShoppingTrip } = useMapNavigation();
  const soldOut = isOutOfStock(product);

  const openProductDetail = () => {
    reportRecommendationInteraction(product, recommendationVariant);
    router.push(
      isShoppingListMode
        ? {
            pathname: "/product/[id]",
            params: { id: product.id, addMode: SEARCH_ADD_MODE_SHOPPING_LIST },
          }
        : `/product/${product.id}`,
    );
  };

  const handleAddPress = () => {
    if (isShoppingListMode) {
      void addProductToShoppingTrip(product, 1)
        .then(() => showToast(TOAST_MESSAGES.addedToShoppingList))
        .catch(console.error);
      return;
    }
    addToCart(product, 1)
      .then(() => showToast(TOAST_MESSAGES.addedToCart))
      .catch(console.error);
  };

  return (
    <View style={{ width }}>
      <View style={{ width, height: width }}>
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
        >
          <ProductThumbnail product={product} width={width} />
        </Pressable>
        {!soldOut ? (
          <Pressable
            onPress={handleAddPress}
            accessibilityRole="button"
            accessibilityLabel={
              isShoppingListMode ? "쇼핑리스트 담기" : "장바구니에 담기"
            }
            style={{
              position: "absolute",
              right: 6,
              bottom: 6,
              width: CART_BUTTON_SIZE,
              height: CART_BUTTON_SIZE,
              borderRadius: RADIUS.full,
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CartIcon width={18} height={18} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
        className="mt-2 gap-1"
      >
        <Text
          className="text-text-main"
          numberOfLines={2}
          style={{
            ...pretendard(500),
            fontSize: TYPOGRAPHY.size.sm,
            lineHeight: PRODUCT_NAME_LINE_HEIGHT,
            minHeight: PRODUCT_NAME_MIN_HEIGHT,
          }}
        >
          {product.name}
        </Text>

        <ProductDiscountPriceRow product={product} size="md" />
      </Pressable>
    </View>
  );
}
