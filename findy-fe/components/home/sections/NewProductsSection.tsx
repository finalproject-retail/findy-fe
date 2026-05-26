import { HOME_SECTION_LIMITS } from "@/components/home/constants";
import { HomeSection } from "@/components/home/HomeSection";
import { getInStockProducts } from "@/components/home/mockProducts";
import { ProductCard } from "@/components/product";
import { SPACING } from "@/constants/theme";
import { FlatList, useWindowDimensions } from "react-native";

const CARD_GAP = 12;

export function NewProductsSection() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SPACING.screen * 2 - CARD_GAP) / 2.7;
  const products = getInStockProducts().slice(
    0,
    HOME_SECTION_LIMITS.newProducts,
  );

  return (
    <HomeSection title="✨ 신상품">
      <FlatList
        data={products}
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
