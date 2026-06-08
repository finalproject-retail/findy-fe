import { RecommendedProductCard } from "@/components/product/detail/RecommendedProductCard";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import {
  useProductRecommendations,
  type ProductRecommendationVariant,
} from "@/hooks/useProductRecommendations";
import { pretendard } from "@/utils/pretendard";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

const CARD_GAP = 12;

type ProductRecommendSectionProps = {
  productId: string;
  cardWidth: number;
  shoppingListAddMode?: boolean;
  variant?: ProductRecommendationVariant;
  enabled?: boolean;
};

function resolveSectionTitle(variant: ProductRecommendationVariant) {
  return variant === "substitute" ? "대체 상품 추천" : "이 상품은 어때요?";
}

export function ProductRecommendSection({
  productId,
  cardWidth,
  shoppingListAddMode = false,
  variant = "related",
  enabled = true,
}: ProductRecommendSectionProps) {
  const { products, loading } = useProductRecommendations({
    productId,
    variant,
    enabled,
  });

  if (!enabled) {
    return null;
  }

  if (loading) {
    return (
      <View
        style={{
          paddingTop: SPACING.lg,
          paddingBottom: SPACING.lg,
          alignItems: "center",
        }}
      >
        <ActivityIndicator color={COLORS.main} />
      </View>
    );
  }

  if (products.length === 0) {
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
        <Text className="text-lg text-text-main" style={pretendard(700)}>
          {resolveSectionTitle(variant)}
        </Text>
        {variant === "related" ? (
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
        ) : null}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => `${variant}-${productId}-${item.id}`}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: CARD_GAP }}
        renderItem={({ item }) => (
          <RecommendedProductCard
            product={item}
            width={cardWidth}
            shoppingListAddMode={shoppingListAddMode}
          />
        )}
      />
    </View>
  );
}
