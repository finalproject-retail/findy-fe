import { SquareButton } from "@/components/common/SquareButton";
import { COLORS, SPACING } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { isOutOfStock } from "../isOutOfStock";
import type { Product } from "../types";
import { ProductDetailCartSheet } from "./ProductDetailCartSheet";

export const PRODUCT_DETAIL_CART_BAR_HEIGHT = 65;

type ProductDetailCartBarProps = {
  product: Product;
  onPress?: () => void;
};

export function ProductDetailCartBar({
  product,
  onPress,
}: ProductDetailCartBarProps) {
  const { showToast } = useToast();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const soldOut = isOutOfStock(product);

  const openSheet = () => {
    setQuantity(1);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
  };

  const handleConfirm = () => {
    // TODO: 장바구니 API — 상품 quantity개 담기
    closeSheet();
    showToast(TOAST_MESSAGES.addedToCart);
    onPress?.();
  };

  const handleBarPress = () => {
    if (soldOut) return;
    if (sheetVisible) {
      handleConfirm();
    } else {
      openSheet();
    }
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
          justifyContent: "center",
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
          accessibilityLabel={soldOut ? "품절" : "장바구니 담기"}
          style={{ flex: 1 }}
        >
          {soldOut ? "품절" : "장바구니 담기"}
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
