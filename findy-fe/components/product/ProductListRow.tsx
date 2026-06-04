import { getProductById } from "@/components/home/mockProducts";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { SEARCH_ADD_MODE_SHOPPING_LIST } from "@/constants/searchAddMode";
import { useCart } from "@/contexts/CartContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useProductAddMode } from "@/components/product/useProductAddMode";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { ProductDiscountPriceRow } from "./ProductDiscountPriceRow";
import { isOutOfStock } from "./isOutOfStock";
import { RemainingStockText } from "./RemainingStockText";
import { resolveCatalogProductId } from "./resolveCatalogProductId";
import type { Product } from "./types";

const IMAGE_SIZE = 100;

type ProductListRowProps = {
  product: Product;
  /** false면 하단 구분선 생략 (목록 래퍼에서 처리) */
  showBorder?: boolean;
  /** 지도 검색 결과 등 — 쇼핑리스트 담기 */
  shoppingListAddMode?: boolean;
};

export function ProductListRow({
  product,
  showBorder = true,
  shoppingListAddMode = false,
}: ProductListRowProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const isShoppingListMode = useProductAddMode(shoppingListAddMode);
  const { addProductToShoppingTrip } = useMapNavigation();
  const catalogProduct = useMemo(() => {
    const catalogId = resolveCatalogProductId(product.id);
    return getProductById(catalogId) ?? product;
  }, [product]);
  const soldOut = isOutOfStock(catalogProduct);
  const stockCount = catalogProduct.stockCount ?? 0;
  const actionLabel = isShoppingListMode ? "쇼핑리스트 담기" : "장바구니 담기";

  const openProductDetail = () => {
    const productId = resolveCatalogProductId(product.id);
    router.push(
      isShoppingListMode
        ? {
            pathname: "/product/[id]",
            params: { id: productId, addMode: SEARCH_ADD_MODE_SHOPPING_LIST },
          }
        : `/product/${productId}`,
    );
  };

  const handleAddPress = () => {
    if (soldOut) return;
    if (isShoppingListMode) {
      void addProductToShoppingTrip(catalogProduct)
        .then(() => showToast(TOAST_MESSAGES.addedToShoppingList))
        .catch(console.error);
      return;
    }
    addToCart(catalogProduct)
      .then(() => showToast(TOAST_MESSAGES.addedToCart))
      .catch(console.error);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: SPACING.md,
        paddingVertical: SPACING.lg,
        ...(showBorder
          ? {
              borderBottomWidth: BORDER.thin,
              borderBottomColor: COLORS.lightGray,
            }
          : null),
      }}
    >
      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
      >
        <View style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}>
          <Image
            source={catalogProduct.image}
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
            {catalogProduct.name}
          </Text>

          <ProductDiscountPriceRow
            product={catalogProduct}
            size="md"
            showOriginalPrice
          />
        </Pressable>

        {!soldOut ? (
          <View className="flex-row items-end justify-between">
            <RemainingStockText stockCount={stockCount} />
            <Pressable
              onPress={handleAddPress}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
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
                {actionLabel}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
