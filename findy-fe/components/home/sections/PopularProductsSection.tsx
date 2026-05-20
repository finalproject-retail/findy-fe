import { PopularProductCard } from "@/components/product";
import { MOCK_POPULAR_PRODUCTS } from "@/components/home/mockProducts";
import { HomeSection } from "@/components/home/HomeSection";
import { View } from "react-native";

const POPULAR_COUNT = 5;

export function PopularProductsSection() {
  return (
    <HomeSection title="🏆 실시간 인기 상품">
      <View className="gap-5">
        {MOCK_POPULAR_PRODUCTS.slice(0, POPULAR_COUNT).map((product, index) => (
          <PopularProductCard
            key={product.id}
            product={product}
            rank={index + 1}
          />
        ))}
      </View>
    </HomeSection>
  );
}
