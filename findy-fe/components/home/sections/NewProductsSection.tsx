import { HomeSection } from "@/components/home/HomeSection";
import { MOCK_PRODUCTS } from "@/components/home/mockProducts";
import { ProductCard } from "@/components/product";
import { SPACING } from "@/constants/theme";
import { FlatList, useWindowDimensions } from "react-native";

const CARD_GAP = 12;

export function NewProductsSection() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SPACING.screen * 2 - CARD_GAP) / 2.5;

  return (
    <HomeSection title="✨ 신상품">
      <FlatList
        data={MOCK_PRODUCTS}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: CARD_GAP }}
        renderItem={({ item }) => (
          <ProductCard product={item} width={cardWidth} />
        )}
      />
    </HomeSection>
  );
}
