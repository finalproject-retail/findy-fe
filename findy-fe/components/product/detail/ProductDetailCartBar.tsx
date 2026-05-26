import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  const { addToCart } = useCart();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const openSheet = () => {
    setQuantity(1);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    setSheetVisible(false);
  };

  const handleConfirm = () => {
    addToCart(product, quantity);
    closeSheet();
    showToast(TOAST_MESSAGES.addedToCart);
    onPress?.();
  };

  const handleBarPress = () => {
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
            style={[styles.overlay, { marginBottom: PRODUCT_DETAIL_CART_BAR_HEIGHT }]}
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
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.screen,
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
          zIndex: 2,
        }}
      >
        <Pressable
          onPress={handleBarPress}
          accessibilityRole="button"
          accessibilityLabel="장바구니 담기"
          style={{
            flex: 1,
            borderRadius: RADIUS.md,
            backgroundColor: COLORS.main,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...pretendard(700),
              fontSize: TYPOGRAPHY.size.xl,
              color: COLORS.white,
            }}
          >
            장바구니 담기
          </Text>
        </Pressable>
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
