import {
  CATEGORY_TREE,
  CategoryMiddleList,
  CategorySidebar,
  type CategoryMiddle,
} from "@/components/category";
import { Header } from "@/components/common";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

function navigateToCategoryDetail(
  router: ReturnType<typeof useRouter>,
  middle: CategoryMiddle,
  categoryId: number,
) {
  router.push({
    pathname: "/category/detail",
    params: {
      middleKey: middle.key,
      categoryId: String(categoryId),
    },
  } as Href);
}

export default function CategoryScreen() {
  const router = useRouter();
  const [activeTopKey, setActiveTopKey] = useState(CATEGORY_TREE[0]?.key ?? "");

  const activeTop = useMemo(
    () => CATEGORY_TREE.find((top) => top.key === activeTopKey) ?? CATEGORY_TREE[0],
    [activeTopKey],
  );

  const handlePressMiddle = (middle: CategoryMiddle) => {
    const firstSub = middle.subs[0];
    if (!firstSub) {
      return;
    }
    navigateToCategoryDetail(router, middle, firstSub.categoryId);
  };

  const handlePressSub = (middle: CategoryMiddle, categoryId: number) => {
    navigateToCategoryDetail(router, middle, categoryId);
  };

  return (
    <SafeView edges={TAB_SCREEN_EDGES}>
      <Header title="카테고리" rightIcons={["cart"]} />

      <View className="flex-1 flex-row">
        <CategorySidebar
          tops={CATEGORY_TREE}
          activeTopKey={activeTop?.key ?? ""}
          onSelect={setActiveTopKey}
        />
        <View className="flex-1 bg-white">
          {activeTop ? (
            <CategoryMiddleList
              middles={activeTop.middles}
              onPressMiddle={handlePressMiddle}
              onPressSub={handlePressSub}
            />
          ) : null}
        </View>
      </View>
    </SafeView>
  );
}
