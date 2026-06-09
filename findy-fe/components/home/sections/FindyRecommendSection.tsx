import { HOME_SECTION_LIMITS } from "@/components/home/constants";
import { useHomeSectionProducts } from "@/components/home/hooks/useHomeSectionProducts";
import { HomeLoadMoreButton } from "@/components/home/HomeLoadMoreButton";
import { HomeSection } from "@/components/home/HomeSection";
import { ProductCard } from "@/components/product";
import type { Product } from "@/components/product";
import { COLORS, SPACING } from "@/constants/theme";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View, useWindowDimensions } from "react-native";

const GRID_GAP = 12;
const COLUMN_COUNT = 3;
const { initial, loadMore } = HOME_SECTION_LIMITS.findyRecommend;

function chunkProducts<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

type FindyRecommendSectionProps = {
  storeId: number;
};

export function FindyRecommendSection({ storeId }: FindyRecommendSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth =
    (screenWidth - SPACING.screen * 2 - GRID_GAP * (COLUMN_COUNT - 1)) /
    COLUMN_COUNT;

  const { products: allProducts, loading } = useHomeSectionProducts({
    kind: "findy",
    storeId,
  });

  const [visibleCount, setVisibleCount] = useState<number>(initial);

  useEffect(() => {
    setVisibleCount(initial);
  }, [storeId, allProducts.length]);

  const visibleProducts = allProducts.slice(0, visibleCount);
  const productRows = useMemo(
    () => chunkProducts(visibleProducts, COLUMN_COUNT),
    [visibleProducts],
  );
  const isExpanded = visibleCount > initial;
  const showToggle = allProducts.length > initial;

  const handleToggle = () => {
    if (isExpanded) {
      setVisibleCount(initial);
      return;
    }
    setVisibleCount((count) =>
      Math.min(count + loadMore, allProducts.length),
    );
  };

  return (
    <HomeSection title="👀 핀디만의 추천">
      {loading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={COLORS.main} />
        </View>
      ) : (
        <View style={{ gap: SPACING.lg }}>
          <View style={{ gap: GRID_GAP }}>
            {productRows.map((row, rowIndex) => (
              <View
                key={`findy-row-${rowIndex}`}
                style={{ flexDirection: "row", gap: GRID_GAP }}
              >
                {row.map((product: Product) => (
                  <ProductCard
                    key={`findy-${product.id}`}
                    product={product}
                    width={cardWidth}
                  />
                ))}
              </View>
            ))}
          </View>
          {showToggle ? (
            <HomeLoadMoreButton expanded={isExpanded} onPress={handleToggle} />
          ) : null}
        </View>
      )}
    </HomeSection>
  );
}
