import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import {
  ExcludeOutOfStockFilter,
  RecentlyViewedProductItem,
  RecentlyViewedSearchBar,
  filterRecentlyViewedProducts,
  useRecentViews,
} from "@/components/recently-viewed";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function RecentlyViewedScreen() {
  const [query, setQuery] = useState("");
  const [excludeOutOfStock, setExcludeOutOfStock] = useState(false);
  const { products, loading, error, reload } = useRecentViews();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const filteredProducts = useMemo(
    () => filterRecentlyViewedProducts(products, query, excludeOutOfStock),
    [products, query, excludeOutOfStock],
  );

  return (
    <SafeView>
      <Header title="최근 본 상품" showBack />
      {loading && products.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.blueText} />
        </View>
      ) : error && products.length === 0 ? (
        <View
          className="flex-1 items-center justify-center px-screen"
          style={{ gap: SPACING.md }}
        >
          <Text
            className="text-center text-md text-text-sub"
            style={pretendard(400)}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => void reload()}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <Text className="text-md text-text-blue" style={pretendard(600)}>
              다시 시도
            </Text>
          </Pressable>
        </View>
      ) : (
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
              {query.trim() || excludeOutOfStock
                ? "검색 결과가 없습니다."
                : "최근 본 상품이 없어요."}
            </Text>
          }
          renderItem={({ item }) => (
            <RecentlyViewedProductItem product={item} />
          )}
        />
      )}
    </SafeView>
  );
}
