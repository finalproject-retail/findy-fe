import type { Product } from "@/components/product";
import { ProductSortFilter } from "@/components/search";
import type { ProductSortType } from "@/components/search/searchTypes";
import { SearchResultProductItem } from "@/components/search/SearchResultProductItem";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  type ListRenderItem,
} from "react-native";

type CategoryProductListProps = {
  products: Product[];
  sort: ProductSortType;
  onSortChange: (sort: ProductSortType) => void;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
};

export function CategoryProductList({
  products,
  sort,
  onSortChange,
  loading,
  loadingMore,
  hasMore,
  error,
  onLoadMore,
}: CategoryProductListProps) {
  const renderItem: ListRenderItem<Product> = ({ item }) => (
    <SearchResultProductItem product={item} />
  );

  const listEmpty = !loading && !error && products.length === 0;
  const showInitialLoading = loading && products.length === 0;

  if (showInitialLoading) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingHorizontal: SPACING.screen,
            paddingTop: SPACING.lg,
            paddingBottom: SPACING.sm,
            alignItems: "flex-start",
            backgroundColor: COLORS.white,
          }}
        >
          <ProductSortFilter value={sort} onChange={onSortChange} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          zIndex: 100,
          elevation: 100,
          paddingHorizontal: SPACING.screen,
          paddingTop: SPACING.lg,
          paddingBottom: SPACING.sm,
          alignItems: "flex-start",
          backgroundColor: COLORS.white,
        }}
      >
        <ProductSortFilter value={sort} onChange={onSortChange} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={() => onLoadMore()}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
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
              상품이 없습니다.
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
    </View>
  );
}
