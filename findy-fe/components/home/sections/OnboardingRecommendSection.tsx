import { HOME_SECTION_LIMITS } from "@/components/home/constants";
import { useHomeSectionProducts } from "@/components/home/hooks/useHomeSectionProducts";
import { HomeSection } from "@/components/home/HomeSection";
import { ProductCard } from "@/components/product";
import { COLORS, SPACING } from "@/constants/theme";
import { ActivityIndicator, FlatList, useWindowDimensions, View } from "react-native";

const CARD_GAP = 12;

type OnboardingRecommendSectionProps = {
  storeId: string;
};

export function OnboardingRecommendSection({
  storeId,
}: OnboardingRecommendSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SPACING.screen * 2 - CARD_GAP) / 2.7;
  const { products, loading } = useHomeSectionProducts({
    kind: "personalized",
    storeId,
    limit: HOME_SECTION_LIMITS.onboardingRecommend,
  });

  return (
    <HomeSection title="🔎 1인 가구 김핀디님을 위해 골라왔어요">
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
