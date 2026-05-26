import { getInStockProducts } from "@/components/home/mockProducts";
import { RecommendedProductCard } from "@/components/product/detail/RecommendedProductCard";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { FlatList, Text, View } from "react-native";
import type { Product } from "./types";

const MAX_RECOMMENDED = 9;
const CARD_GAP = 12;

type ProductRecommendSectionProps = {
  productId: string;
  cardWidth: number;
};

function getRecommendedProducts(productId: string): Product[] {
  return getInStockProducts().filter((item) => item.id !== productId).slice(
    0,
    MAX_RECOMMENDED,
  );
}

export function ProductRecommendSection({
  productId,
  cardWidth,
}: ProductRecommendSectionProps) {
  const recommended = getRecommendedProducts(productId);

  if (recommended.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        gap: SPACING.md,
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xl text-text-main" style={pretendard(700)}>
          이 상품은 어때요?
        </Text>
        <View
          style={{
            paddingHorizontal: SPACING.sm,
            paddingVertical: 3,
            borderRadius: RADIUS.md,
            backgroundColor: COLORS.lightGray,
          }}
        >
          <Text
            style={{
              ...pretendard(400),
              fontSize: TYPOGRAPHY.size.xs,
              color: COLORS.subText2,
            }}
          >
            광고
          </Text>
        </View>
      </View>

      <FlatList
        data={recommended}
        keyExtractor={(item) => `recommend-${productId}-${item.id}`}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: CARD_GAP }}
        renderItem={({ item }) => (
          <RecommendedProductCard product={item} width={cardWidth} />
        )}
      />
    </View>
  );
}
