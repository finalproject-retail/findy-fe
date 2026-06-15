import { getUnitPrice } from "@/components/cart/cartItemUtils";
import { formatPrice, hasProductDiscount, type Product } from "@/components/product";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { MapPixelPoint } from "./types";

export const MAP_CALLOUT_WIDTH = 188;
const THUMB_SIZE = 52;
const CALLOUT_INSET = SPACING.sm;
const TAIL_HEIGHT = 7;
const TAIL_WIDTH = 12;
const GAP_ABOVE_PIN = 4;
export const CALLOUT_STACK_GAP = 6;

export const MAP_CALLOUT_CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  android: { elevation: 6 },
  default: {
    boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
  },
});

type MapProductMarkerCalloutProps = {
  product: Product;
  quantity: number;
  anchor: MapPixelPoint;
  pinHeight: number;
  /** 같은 위치 상품 말풍선을 위로 쌓을 때 추가 오프셋(px) */
  stackOffset?: number;
  zIndex?: number;
};

export function getCalloutHeight(quantity: number) {
  return quantity > 1 ? 86 : 76;
}

export function getCalloutTotalHeight(quantity: number) {
  return getCalloutHeight(quantity) + TAIL_HEIGHT + GAP_ABOVE_PIN;
}

export function MapProductMarkerCallout({
  product,
  quantity,
  anchor,
  pinHeight,
  stackOffset = 0,
  zIndex = 20,
}: MapProductMarkerCalloutProps) {
  const unitPrice = getUnitPrice(product);
  const showDiscount = hasProductDiscount(product);
  const calloutHeight = getCalloutHeight(quantity);
  const totalHeight = getCalloutTotalHeight(quantity);
  const left = anchor.x - MAP_CALLOUT_WIDTH / 2;
  const top = anchor.y - pinHeight - totalHeight - stackOffset;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.anchor,
        {
          left,
          top,
          width: MAP_CALLOUT_WIDTH,
          height: totalHeight,
          zIndex,
        },
      ]}
    >
      <View style={[styles.card, { height: calloutHeight }]}>
        <Image
          source={product.image}
          style={styles.thumb}
          contentFit="cover"
        />
        <View style={styles.textCol}>
          <Text numberOfLines={2} style={styles.name}>
            {product.name}
          </Text>
          {quantity > 1 ? (
            <Text style={styles.quantityLine}>{quantity}개</Text>
          ) : null}
          <View style={styles.priceRow}>
            {showDiscount ? (
              <Text style={styles.discount}>{product.discountPercent}%</Text>
            ) : null}
            <Text style={styles.price}>{formatPrice(unitPrice)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    alignItems: "center",
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    padding: CALLOUT_INSET,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    ...MAP_CALLOUT_CARD_SHADOW,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: RADIUS.xs,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text,
    lineHeight: 18,
    textAlign: "right",
  },
  quantityLine: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text,
    lineHeight: 18,
    textAlign: "right",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: SPACING.xs,
    marginTop: 2,
  },
  discount: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.redText,
  },
  price: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.text,
  },
  tail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: TAIL_WIDTH / 2,
    borderRightWidth: TAIL_WIDTH / 2,
    borderTopWidth: TAIL_HEIGHT,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.white,
  },
});
