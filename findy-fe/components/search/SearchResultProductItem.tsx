import type { Product } from "@/components/product";
import {
  isOutOfStock,
  ProductListRow,
  ProductRecommendSection,
} from "@/components/product";
import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { useWindowDimensions, View } from "react-native";

const RECOMMEND_CARD_GAP = 12;

type SearchResultProductItemProps = {
  product: Product;
};

export function SearchResultProductItem({
  product,
}: SearchResultProductItemProps) {
  const { width: screenWidth } = useWindowDimensions();
  const soldOut = isOutOfStock(product);
  const baseProductId = product.id.split("-search-")[0] ?? product.id;
  const recommendCardWidth =
    (screenWidth - SPACING.screen * 2 - RECOMMEND_CARD_GAP) / 3.1;

  return (
    <View
      style={{
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
      }}
    >
      <ProductListRow product={product} showBorder={false} />
      {soldOut ? (
        <ProductRecommendSection
          productId={baseProductId}
          cardWidth={recommendCardWidth}
        />
      ) : null}
    </View>
  );
}
