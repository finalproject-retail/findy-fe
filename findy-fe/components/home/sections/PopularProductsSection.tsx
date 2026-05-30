import { HOME_SECTION_LIMITS } from "@/components/home/constants";
import { useHomeSectionProducts } from "@/components/home/hooks/useHomeSectionProducts";
import { HomeSection } from "@/components/home/HomeSection";
import { PopularProductCard } from "@/components/product";
import { COLORS } from "@/constants/theme";
import { ActivityIndicator, View } from "react-native";

type PopularProductsSectionProps = {
  storeId: string;
};

export function PopularProductsSection({ storeId }: PopularProductsSectionProps) {
  const { products, loading } = useHomeSectionProducts({
    kind: "popular",
    storeId,
    limit: HOME_SECTION_LIMITS.popularProducts,
  });

  return (
    <HomeSection title="🏆 실시간 인기 상품">
      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={COLORS.main} />
        </View>
      ) : (
        <View className="gap-5">
          {products.map((product, index) => (
            <PopularProductCard
              key={product.id}
              product={product}
              rank={index + 1}
            />
          ))}
        </View>
      )}
    </HomeSection>
  );
}
