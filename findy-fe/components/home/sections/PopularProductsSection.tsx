import { HOME_SECTION_LIMITS } from "@/components/home/constants";
import { HomeSection } from "@/components/home/HomeSection";
import { MOCK_POPULAR_PRODUCTS } from "@/components/home/mockProducts";
import { PopularProductCard } from "@/components/product";
import { View } from "react-native";

const popularProducts = MOCK_POPULAR_PRODUCTS.slice(
  0,
  HOME_SECTION_LIMITS.popularProducts,
);

export function PopularProductsSection() {
  return (
    <HomeSection title="🏆 실시간 인기 상품">
      <View className="gap-5">
        {popularProducts.map((product, index) => (
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
