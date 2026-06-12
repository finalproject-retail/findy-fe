import { getUnitPrice } from "@/components/cart/cartItemUtils";
import { formatPrice, hasProductDiscount, type Product } from "@/components/product";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useRef } from "react";
import { MAP_CALLOUT_WIDTH } from "./MapProductMarkerCallout";
import type { MapPixelPoint } from "./types";

const CALLOUT_INSET = SPACING.sm;
const TAIL_HEIGHT = 7;
const TAIL_WIDTH = 12;
const GAP_ABOVE_PIN = 4;
const ROW_GAP = 6;
const THUMB_SIZE = 52;
const SCROLL_ITEM_THRESHOLD = 4;
const MAX_VISIBLE_ITEMS = 3;

export type GroupedCalloutItem = {
  key: string;
  product: Product;
  quantity: number;
};

export function shouldUseGroupedProductCallout(count: number) {
  return count >= 2;
}

function getRowHeight(quantity: number) {
  return quantity > 1 ? 86 : 76;
}

function getListContentHeight(items: ReadonlyArray<GroupedCalloutItem>) {
  if (items.length === 0) {
    return 0;
  }

  return items.reduce((sum, item, index) => {
    const rowHeight = getRowHeight(item.quantity);
    const gap = index > 0 ? ROW_GAP : 0;
    return sum + gap + rowHeight;
  }, 0);
}

function getVisibleListHeight(items: ReadonlyArray<GroupedCalloutItem>) {
  if (items.length < SCROLL_ITEM_THRESHOLD) {
    return getListContentHeight(items);
  }

  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  return getListContentHeight(visibleItems);
}

function ProductRow({
  product,
  quantity,
  showDivider,
}: {
  product: Product;
  quantity: number;
  showDivider: boolean;
}) {
  const unitPrice = getUnitPrice(product);
  const showDiscount = hasProductDiscount(product);
  const rowHeight = getRowHeight(quantity);

  return (
    <View>
      {showDivider ? <View style={styles.divider} /> : null}
      <View style={[styles.row, { minHeight: rowHeight }]}>
        <Image source={product.image} style={styles.thumb} contentFit="cover" />
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
    </View>
  );
}

type MapGroupedProductMarkerCalloutProps = {
  items: GroupedCalloutItem[];
  anchor: MapPixelPoint;
  pinHeight: number;
  zIndex?: number;
};

function stopWheelPropagation(event: {
  stopPropagation?: () => void;
  nativeEvent?: { stopPropagation?: () => void };
}) {
  event.stopPropagation?.();
  event.nativeEvent?.stopPropagation?.();
}

export function MapGroupedProductMarkerCallout({
  items,
  anchor,
  pinHeight,
  zIndex = 20,
}: MapGroupedProductMarkerCalloutProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const isScrollable = items.length >= SCROLL_ITEM_THRESHOLD;
  const listHeight = getVisibleListHeight(items);
  const contentHeight = CALLOUT_INSET * 2 + listHeight;
  const totalHeight = contentHeight + TAIL_HEIGHT + GAP_ABOVE_PIN;
  const left = anchor.x - MAP_CALLOUT_WIDTH / 2;
  const top = anchor.y - pinHeight - totalHeight;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
  };

  const handleWheel = (event: {
    deltaY?: number;
    preventDefault?: () => void;
    stopPropagation?: () => void;
    nativeEvent?: {
      deltaY?: number;
      preventDefault?: () => void;
      stopPropagation?: () => void;
    };
  }) => {
    if (!isScrollable) {
      return;
    }

    stopWheelPropagation(event);

    const deltaY = event.deltaY ?? event.nativeEvent?.deltaY ?? 0;
    if (deltaY === 0) {
      return;
    }

    if (Platform.OS === "web") {
      event.preventDefault?.();
      event.nativeEvent?.preventDefault?.();
    }

    const maxOffset = Math.max(0, getListContentHeight(items) - listHeight);
    const nextOffset = Math.min(
      maxOffset,
      Math.max(0, scrollOffsetRef.current + deltaY),
    );

    if (nextOffset !== scrollOffsetRef.current) {
      scrollOffsetRef.current = nextOffset;
      scrollRef.current?.scrollTo({ y: nextOffset, animated: false });
    }
  };

  const rows = items.map((item, index) => (
    <ProductRow
      key={item.key}
      product={item.product}
      quantity={item.quantity}
      showDivider={index > 0}
    />
  ));

  return (
    <View
      pointerEvents={isScrollable ? "box-none" : "none"}
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
      <View
        style={[styles.card, { height: contentHeight }]}
        pointerEvents={isScrollable ? "auto" : "none"}
        {...(isScrollable && Platform.OS === "web"
          ? { dataSet: { mapCalloutScroll: "true" } }
          : {})}
        onWheel={isScrollable ? handleWheel : undefined}
      >
        {isScrollable ? (
          <ScrollView
            ref={scrollRef}
            style={{ height: listHeight }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onWheel={handleWheel}
          >
            {rows}
          </ScrollView>
        ) : (
          <View style={styles.list}>{rows}</View>
        )}
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
    padding: CALLOUT_INSET,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: "hidden",
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
  list: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: ROW_GAP / 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
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
