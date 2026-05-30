import { SafeView } from "@/components/layout";
import type { Product } from "@/components/product";
import {
  ProductSortFilter,
  SearchResultProductItem,
  SearchScreenHeader,
  useProductSearch,
  type ProductSortType,
} from "@/components/search";
import { COLORS, SPACING } from "@/constants/theme";
import { useRecentSearch } from "@/contexts/RecentSearchContext";
import { pretendard } from "@/utils/pretendard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  type ListRenderItem,
} from "react-native";

export default function SearchResultsScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const initialQuery = typeof q === "string" ? q : "";
  const { addRecentSearch } = useRecentSearch();

  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<ProductSortType>("popularity");

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { products, loading, loadingMore, hasMore, error, loadMore } =
    useProductSearch({ keyword: query, sort });

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    router.setParams({ q: trimmed });
  }, [addRecentSearch, query, router]);

  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => <SearchResultProductItem product={item} />,
    [],
  );

  const listEmpty = !loading && !error && products.length === 0;
  const showInitialLoading = loading && products.length === 0;

  return (
    <SafeView>
      <SearchScreenHeader
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSubmit}
        onClear={() => setQuery("")}
        showCart
      />

      <View
        style={{
          zIndex: 100,
          elevation: 100,
          overflow: "visible",
          paddingHorizontal: SPACING.screen,
          paddingTop: SPACING.lg,
          paddingBottom: SPACING.sm,
          alignItems: "flex-start",
          backgroundColor: COLORS.white,
        }}
      >
        <ProductSortFilter value={sort} onChange={setSort} />
      </View>

      {showInitialLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1, zIndex: 0 }}
          contentContainerStyle={{
            paddingHorizontal: SPACING.screen,
            paddingBottom: SPACING.xl,
            flexGrow: listEmpty || error ? 1 : undefined,
          }}
          ListEmptyComponent={
            error ? (
              <Text
                className="text-center text-md text-text-red"
                style={{ ...pretendard(400), paddingTop: SPACING.xl }}
              >
                {error}
              </Text>
            ) : listEmpty ? (
              <Text
                className="text-center text-md text-text-sub"
                style={{ ...pretendard(400), paddingTop: SPACING.xl }}
              >
                검색 결과가 없습니다.
              </Text>
            ) : null
          }
          ListFooterComponent={
            loadingMore && hasMore ? (
              <View style={{ paddingVertical: SPACING.lg }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </SafeView>
  );
}
