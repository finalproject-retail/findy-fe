import { PopularProductCard } from "@/components/product";
import { MOCK_POPULAR_PRODUCTS } from "@/components/home/mockProducts";
import { HomeSection } from "@/components/home/HomeSection";
import { useCallback, useState } from "react";
import { View } from "react-native";

const POPULAR_COUNT = 5;
const popularProducts = MOCK_POPULAR_PRODUCTS.slice(0, POPULAR_COUNT);

export function PopularProductsSection() {
  const [maxContentHeight, setMaxContentHeight] = useState(0);

  const handleContentLayout = useCallback((height: number) => {
    setMaxContentHeight((prev) => (height > prev ? height : prev));
  }, []);

  return (
    <HomeSection title="🏆 실시간 인기 상품">
      <View className="gap-5">
        {popularProducts.map((product, index) => (
          <PopularProductCard
            key={product.id}
            product={product}
            rank={index + 1}
            contentMinHeight={maxContentHeight || undefined}
            onContentLayout={handleContentLayout}
          />
        ))}
      </View>
    </HomeSection>
  );
}
