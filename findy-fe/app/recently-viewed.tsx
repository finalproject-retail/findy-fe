import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import {
  ExcludeOutOfStockFilter,
  RecentlyViewedProductItem,
  RecentlyViewedSearchBar,
  filterRecentlyViewedProducts,
  getRecentlyViewedPageProducts,
} from "@/components/recently-viewed";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";

const PAGE_PRODUCTS = getRecentlyViewedPageProducts();

export default function RecentlyViewedScreen() {
  const [query, setQuery] = useState("");
  const [excludeOutOfStock, setExcludeOutOfStock] = useState(false);

  const filteredProducts = useMemo(
    () => filterRecentlyViewedProducts(PAGE_PRODUCTS, query, excludeOutOfStock),
    [query, excludeOutOfStock],
  );

  return (
    <SafeView>
      <Header title="최근 본 상품" showBack />
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.screen,
          paddingBottom: SPACING.xl,
        }}
        ListHeaderComponent={
          <View style={{ gap: SPACING.md, paddingVertical: SPACING.lg }}>
            <RecentlyViewedSearchBar value={query} onChangeText={setQuery} />
            <ExcludeOutOfStockFilter
              checked={excludeOutOfStock}
              onChange={setExcludeOutOfStock}
            />
          </View>
        }
        ListEmptyComponent={
          <Text
            className="text-center text-md text-text-sub"
            style={{ ...pretendard(400), paddingTop: SPACING.xl }}
          >
            검색 결과가 없습니다.
          </Text>
        }
        renderItem={({ item }) => <RecentlyViewedProductItem product={item} />}
      />
    </SafeView>
  );
}
