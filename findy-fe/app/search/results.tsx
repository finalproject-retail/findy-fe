import { SafeView } from "@/components/layout";
import type { Product } from "@/components/product";
import {
  getSearchResultsSlice,
  ProductSortFilter,
  searchProducts,
  SearchResultProductItem,
  SearchScreenHeader,
  type ProductSortType,
} from "@/components/search";
import { COLORS, SPACING } from "@/constants/theme";
import { useRecentSearch } from "@/contexts/RecentSearchContext";
import { pretendard } from "@/utils/pretendard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const allResults = useMemo(() => searchProducts(query, sort), [query, sort]);

  const visibleResults = useMemo(
    () => getSearchResultsSlice(allResults, page),
    [allResults, page],
  );

  const hasMore = visibleResults.length < allResults.length;

  useEffect(() => {
    setPage(1);
  }, [query, sort]);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    router.setParams({ q: trimmed });
  }, [addRecentSearch, query, router]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  }, [hasMore, loadingMore]);

  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item }) => <SearchResultProductItem product={item} />,
    [],
  );

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

      <FlatList
        data={visibleResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1, zIndex: 0 }}
        contentContainerStyle={{
          paddingHorizontal: SPACING.screen,
          paddingBottom: SPACING.xl,
        }}
        ListEmptyComponent={
          <Text
            className="text-center text-md text-text-sub"
            style={{ ...pretendard(400), paddingTop: SPACING.xl }}
          >
            검색 결과가 없습니다.
          </Text>
        }
        ListFooterComponent={
          loadingMore && hasMore ? (
            <View style={{ paddingVertical: SPACING.lg }}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </SafeView>
  );
}
