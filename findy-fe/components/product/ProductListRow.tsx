import { getProductById } from "@/components/home/mockProducts";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { useIsShoppingListMode, useMapNavigation } from "@/contexts/MapNavigationContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { formatPrice } from "./formatPrice";
import { isOutOfStock } from "./isOutOfStock";
import { RemainingStockText } from "./RemainingStockText";
import { resolveCatalogProductId } from "./resolveCatalogProductId";
import type { Product } from "./types";

const IMAGE_SIZE = 100;

type ProductListRowProps = {
  product: Product;
  /** false면 하단 구분선 생략 (목록 래퍼에서 처리) */
  showBorder?: boolean;
};

export function ProductListRow({
  product,
  showBorder = true,
}: ProductListRowProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const isShoppingListMode = useIsShoppingListMode();
  const { addProductToShoppingTrip } = useMapNavigation();
  const catalogProduct = useMemo(() => {
    const catalogId = resolveCatalogProductId(product.id);
    return getProductById(catalogId) ?? product;
  }, [product]);
  const soldOut = isOutOfStock(catalogProduct);
  const stockCount = catalogProduct.stockCount ?? 0;
  const actionLabel = isShoppingListMode
    ? "쇼핑 리스트에 추가"
    : "장바구니 담기";
  const originalPrice =
    catalogProduct.originalPrice ??
    Math.round(
      catalogProduct.price / (1 - catalogProduct.discountPercent / 100),
    );

  const openProductDetail = () => {
    router.push(`/product/${resolveCatalogProductId(product.id)}`);
  };

  const handleAddPress = () => {
    if (soldOut) return;
    if (isShoppingListMode) {
      addProductToShoppingTrip(catalogProduct);
      showToast(TOAST_MESSAGES.addedToShoppingList);
      return;
    }
    addToCart(catalogProduct);
    showToast(TOAST_MESSAGES.addedToCart);
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

          <View className="flex-row flex-wrap items-center gap-1">
            <Text className="text-md text-text-red" style={pretendard(700)}>
              {catalogProduct.discountPercent}%
            </Text>
            <Text className="text-md text-text-main" style={pretendard(700)}>
              {formatPrice(catalogProduct.price)}
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
