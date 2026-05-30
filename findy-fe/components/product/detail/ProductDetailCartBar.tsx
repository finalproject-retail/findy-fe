import { SquareButton } from "@/components/common/SquareButton";
import { COLORS, SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import {
  useIsShoppingListMode,
  useMapNavigation,
} from "@/contexts/MapNavigationContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { isOutOfStock } from "../isOutOfStock";
import type { Product } from "../types";
import { ProductDetailCartSheet } from "./ProductDetailCartSheet";

export const PRODUCT_DETAIL_CART_BAR_HEIGHT = 70;

type ProductDetailCartBarProps = {
  product: Product;
  onPress?: () => void;
};

export function ProductDetailCartBar({
  product,
  onPress,
}: ProductDetailCartBarProps) {
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const isShoppingListMode = useIsShoppingListMode();
  const { addProductToShoppingTrip } = useMapNavigation();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const soldOut = isOutOfStock(product);

  const actionLabel = isShoppingListMode ? "쇼핑리스트 담기" : "장바구니 담기";

  const openSheet = () => {
    setQuantity(1);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
  };

  const handleConfirm = async () => {
    if (isShoppingListMode) {
      addProductToShoppingTrip(product, quantity);
      showToast(TOAST_MESSAGES.addedToShoppingList);
    } else {
      try {
        await addToCart(product, quantity);
        showToast(TOAST_MESSAGES.addedToCart);
      } catch (error) {
        console.error(error);
        return;
      }
    }

    closeSheet();
    onPress?.();
  };

  const handleBarPress = () => {
    if (soldOut) return;

    if (sheetVisible) {
      handleConfirm();
      return;
    }

    openSheet();
  };

  return (
    <>
      {sheetVisible ? (
        <View
          style={[StyleSheet.absoluteFillObject, styles.layer]}
          pointerEvents="box-none"
        >
          <Pressable
            style={[
              styles.overlay,
              { marginBottom: PRODUCT_DETAIL_CART_BAR_HEIGHT },
            ]}
            onPress={closeSheet}
            accessibilityRole="button"
            accessibilityLabel="닫기"
          />

          <View
            style={[
              styles.sheetAnchor,
              { bottom: PRODUCT_DETAIL_CART_BAR_HEIGHT },
            ]}
            pointerEvents="box-none"
          >
            <ProductDetailCartSheet
              product={product}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />
          </View>
        </View>
      ) : null}

      <View
        style={{
          height: PRODUCT_DETAIL_CART_BAR_HEIGHT,
          paddingTop: SPACING.sm,
          paddingHorizontal: SPACING.screen,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          zIndex: 2,
        }}
      >
        <SquareButton
          onPress={handleBarPress}
          disabled={soldOut}
          accessibilityLabel={soldOut ? "품절" : actionLabel}
          style={{ flex: 1 }}
        >
          {soldOut ? "품절" : actionLabel}
        </SquareButton>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheetAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
  },
});