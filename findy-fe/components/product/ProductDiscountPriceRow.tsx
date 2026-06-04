import { pretendard } from "@/utils/pretendard";
import { Text, View, type TextStyle, type ViewStyle } from "react-native";
import { formatPrice } from "./formatPrice";
import {
  getDisplayOriginalPrice,
  getSalePrice,
  hasProductDiscount,
} from "./productPricing";
import type { Product } from "./types";

type PriceTextSize = "sm" | "md" | "lg" | "xl";

const SIZE_STYLES: Record<
  PriceTextSize,
  { discount: TextStyle; sale: TextStyle; original: TextStyle }
> = {
  sm: {
    discount: { fontSize: 14 },
    sale: { fontSize: 14 },
    original: { fontSize: 12 },
  },
  md: {
    discount: { fontSize: 16 },
    sale: { fontSize: 16 },
    original: { fontSize: 14 },
  },
  lg: {
    discount: { fontSize: 18 },
    sale: { fontSize: 18 },
    original: { fontSize: 14 },
  },
  xl: {
    discount: { fontSize: 20 },
    sale: { fontSize: 20 },
    original: { fontSize: 16 },
  },
};

type ProductDiscountPriceRowProps = {
  product: Product;
  /** 기본: couponPrice ?? price */
  salePrice?: number;
  size?: PriceTextSize;
  style?: ViewStyle;
  /** 검색 목록 등 — 취소선 원가 표시 (홈·추천 카드는 false) */
  showOriginalPrice?: boolean;
};

export function ProductDiscountPriceRow({
  product,
  salePrice: salePriceOverride,
  size = "md",
  style,
  showOriginalPrice = false,
}: ProductDiscountPriceRowProps) {
  const salePrice = salePriceOverride ?? getSalePrice(product);
  const showDiscount = hasProductDiscount(product);
  const originalPrice = getDisplayOriginalPrice(product);
  const textStyles = SIZE_STYLES[size];

  return (
    <View className="flex-row flex-wrap items-center gap-1" style={style}>
      {showDiscount ? (
        <Text
          className="text-text-red"
          style={{ ...pretendard(700), ...textStyles.discount }}
        >
          {Math.round(product.discountPercent)}%
        </Text>
      ) : null}
      <Text
        className="text-text-main"
        style={{ ...pretendard(700), ...textStyles.sale }}
      >
        {formatPrice(salePrice)}
      </Text>
      {showOriginalPrice && showDiscount ? (
        <Text
          className="text-text-sub"
          style={{
            ...pretendard(400),
            ...textStyles.original,
            textDecorationLine: "line-through",
          }}
        >
          {formatPrice(originalPrice)}
        </Text>
      ) : null}
    </View>
  );
}
