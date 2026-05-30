import {
  CategoryProductList,
  CategorySubTabs,
  findMiddleByKey,
  resolveCategoryIdParam,
  useCategoryProducts,
} from "@/components/category";
import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import type { ProductSortType } from "@/components/search/searchTypes";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

export default function CategoryDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    middleKey?: string;
    categoryId?: string;
  }>();

  const middleKey =
    typeof params.middleKey === "string" ? params.middleKey : "";
  const middle = useMemo(() => findMiddleByKey(middleKey), [middleKey]);

  const initialCategoryId = resolveCategoryIdParam(params.categoryId);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(
    initialCategoryId ?? middle?.subs[0]?.categoryId ?? null,
  );
  const [sort, setSort] = useState<ProductSortType>("popularity");

  useEffect(() => {
    if (initialCategoryId != null) {
      setActiveCategoryId(initialCategoryId);
      return;
    }
    if (middle?.subs[0]) {
      setActiveCategoryId(middle.subs[0].categoryId);
    }
  }, [initialCategoryId, middle]);

  const { products, loading, loadingMore, hasMore, error, loadMore } =
    useCategoryProducts({
      categoryId: activeCategoryId,
      sort,
    });

  if (!middle) {
    return (
      <SafeView>
        <Header title="카테고리" showBack />
      </SafeView>
    );
  }

  return (
    <SafeView>
      <Header
        title={middle.label}
        showBack
        rightIcons={["search", "cart"]}
        onSearchPress={() => router.push("/search" as Href)}
      />

      <CategorySubTabs
        subs={middle.subs}
        value={activeCategoryId ?? middle.subs[0]!.categoryId}
        onChange={setActiveCategoryId}
      />

      <View className="flex-1">
        <CategoryProductList
          products={products}
          sort={sort}
          onSortChange={setSort}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          error={error}
          onLoadMore={() => void loadMore()}
        />
      </View>
    </SafeView>
  );
}
