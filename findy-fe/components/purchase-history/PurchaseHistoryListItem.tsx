import { isOutOfStock, ProductRecommendSection } from "@/components/product";
import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { useWindowDimensions, View } from "react-native";
import { PurchaseHistoryProductItem } from "./PurchaseHistoryProductItem";
import type { PurchaseHistoryRecord } from "./mockPurchaseHistory";

const RECOMMEND_CARD_GAP = 12;

type PurchaseHistoryListItemProps = {
  record: PurchaseHistoryRecord;
};

export function PurchaseHistoryListItem({
  record,
}: PurchaseHistoryListItemProps) {
  const { width: screenWidth } = useWindowDimensions();
  const soldOut = isOutOfStock(record.product);
  const recommendCardWidth =
    (screenWidth - SPACING.screen * 2 - RECOMMEND_CARD_GAP) / 3.12;

  return (
    <View
      style={{
        paddingTop: SPACING.md,
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
        gap: soldOut ? SPACING.md : 0,
      }}
    >
      <PurchaseHistoryProductItem
        product={record.product}
        quantity={record.quantity}
      />
      {soldOut ? (
        <ProductRecommendSection
          productId={record.product.id}
          cardWidth={recommendCardWidth}
        />
      ) : null}
    </View>
  );
}
