import { ProductCard } from "@/components/product";
import { MOCK_PRODUCTS } from "@/components/home/mockProducts";
import { HomeSection } from "@/components/home/HomeSection";
import { SPACING } from "@/constants/theme";
import { View, useWindowDimensions } from "react-native";

const GRID_GAP = 12;
const COLUMN_COUNT = 3;

export function FindyRecommendSection() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth =
    (screenWidth - SPACING.screen * 2 - GRID_GAP * (COLUMN_COUNT - 1)) /
    COLUMN_COUNT;

  return (
    <HomeSection title="👀 핀디만의 추천">
      <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard
            key={`findy-${product.id}`}
            product={product}
            width={cardWidth}
          />
        ))}
      </View>
    </HomeSection>
  );
}
