import { getUnitPrice } from "@/components/cart/cartItemUtils";
import { formatPrice, type Product } from "@/components/product";
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

type MapProductMarkerCalloutProps = {
  product: Product;
  quantity: number;
  anchor: MapPixelPoint;
  pinHeight: number;
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
}: MapProductMarkerCalloutProps) {
  const unitPrice = getUnitPrice(product);
  const calloutHeight = getCalloutHeight(quantity);
  const totalHeight = getCalloutTotalHeight(quantity);
  const left = anchor.x - MAP_CALLOUT_WIDTH / 2;
  const top = anchor.y - pinHeight - totalHeight;

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
            <Text style={styles.discount}>{product.discountPercent}%</Text>
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
    zIndex: 20,
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    padding: CALLOUT_INSET,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    ...Platform.select({
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
    }),
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
