import { usePersonalizedRecommendSection } from "@/components/home/hooks/usePersonalizedRecommendSection";
import { HomeSection } from "@/components/home/HomeSection";
import { ProductCard } from "@/components/product";
import { COLORS, SPACING } from "@/constants/theme";
import { ActivityIndicator, FlatList, useWindowDimensions, View } from "react-native";

const CARD_GAP = 12;

type OnboardingRecommendSectionProps = {
  storeId: number;
};

export function OnboardingRecommendSection({
  storeId,
}: OnboardingRecommendSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SPACING.screen * 2 - CARD_GAP) / 2.7;
  const { products, title, loading, visible } = usePersonalizedRecommendSection({
    storeId,
  });

  if (!visible) {
    return null;
  }

  return (
    <HomeSection title={title}>
      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={COLORS.main} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => `onboarding-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: CARD_GAP }}
          renderItem={({ item }) => (
            <ProductCard product={item} width={cardWidth} />
          )}
        />
      )}
    </HomeSection>
  );
}
