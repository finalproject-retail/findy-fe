import { getUnitPrice } from "@/components/cart/cartItemUtils";
import { formatPrice, isOutOfStock } from "@/components/product";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import type { CartLineItem } from "@/contexts/CartContext";
import { isProductLineItem } from "@/lib/shopping/shoppingListItemUtils";
import type { TripZoneLineItem } from "@/lib/shopping/types";
import { pretendard } from "@/utils/pretendard";
import { StyleSheet, Text, View } from "react-native";
import { MapShoppingSheetFooterButton } from "./MapShoppingSheetFooterButton";

type MapShoppingSheetFooterProps = {
  tripLineItems: CartLineItem[];
  tripZoneItems?: TripZoneLineItem[];
  pickedQuantityByProductId: Record<string, number>;
  onShopLater: () => void;
  onFinishShopping: () => void;
  bottomInset?: number;
};

export function MapShoppingSheetFooter({
  tripLineItems,
  tripZoneItems = [],
  pickedQuantityByProductId,
  onShopLater,
  onFinishShopping,
  bottomInset = 0,
}: MapShoppingSheetFooterProps) {
  const productItems = tripLineItems.filter(
    (item) => isProductLineItem(item) && !isOutOfStock(item.product),
  );
  const totalQuantity =
    productItems.reduce((sum, item) => sum + item.quantity, 0) +
    tripZoneItems.length;
  const pickedQuantity = productItems.reduce(
    (sum, item) => sum + (pickedQuantityByProductId[item.productId] ?? 0),
    0,
  );
  const totalPrice = productItems.reduce(
    (sum, item) => sum + getUnitPrice(item.product) * item.quantity,
    0,
  );
  const hasTrip = productItems.length > 0 || tripZoneItems.length > 0;

  return (
    <View
      style={[
        styles.root,
        {
          paddingBottom: bottomInset,
        },
      ]}
    >
      <View style={styles.summaryRow}>
        <Text
          style={{
            ...pretendard(400),
            fontSize: TYPOGRAPHY.size.md,
            color: COLORS.text,
          }}
        >
          총 수량{" "}
          <Text style={pretendard(700)}>
            {hasTrip ? `${pickedQuantity} / ${totalQuantity}` : "0"}개
          </Text>
        </Text>
        <Text
          style={{
            ...pretendard(400),
            fontSize: TYPOGRAPHY.size.md,
            color: COLORS.text,
          }}
        >
          총 구매 금액{" "}
          <Text style={pretendard(700)}>
            {formatPrice(hasTrip ? totalPrice : 0)}
          </Text>
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionCellOutline}>
          <MapShoppingSheetFooterButton
            variant="outline"
            onPress={onShopLater}
            accessibilityLabel="다음에 쇼핑하기"
          >
            다음에 쇼핑하기
          </MapShoppingSheetFooterButton>
        </View>

        <View style={styles.actionCellPrimary}>
          <MapShoppingSheetFooterButton
            variant="primary"
            onPress={onFinishShopping}
            accessibilityLabel="쇼핑 완료하기"
          >
            쇼핑 완료하기
          </MapShoppingSheetFooterButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.lightGray,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: SPACING.sm,
  },
  actionCellOutline: {
    flex: 3,
    flexShrink: 0,
    minWidth: 0,
  },
  actionCellPrimary: {
    flex: 7,
    flexShrink: 0,
    minWidth: 0,
  },
});
