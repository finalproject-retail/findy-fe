import { AdminContentFrame } from "@/components/admin/AdminContentFrame";
import { AdminProductPerformanceList } from "@/components/admin/AdminProductPerformanceList";
import { AdminScrollView } from "@/components/admin/AdminScrollView";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAdminProductPerformanceList } from "@/hooks/useAdminProductPerformanceList";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import type { AdminProductCategoryFilter } from "@/lib/admin/adminProductPerformanceTypes";
import { getDefaultAdminDateRange } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminProductsScreen() {
  const insets = useSafeAreaInsets();
  const isWide = useAdminWideLayout();
  const dateRange = useMemo(() => getDefaultAdminDateRange(), []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AdminProductCategoryFilter>("all");

  const {
    products,
    isLoading,
    isLoadingMore,
    error,
    performanceWarning,
    hasMore,
    loadMore,
    reload,
  } = useAdminProductPerformanceList(dateRange);

  const isLoadingMoreRef = useRef(isLoadingMore);
  isLoadingMoreRef.current = isLoadingMore;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!hasMore || isLoadingMoreRef.current) return;

      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - (layoutMeasurement.height + contentOffset.y);

      if (distanceFromBottom < 160) {
        void loadMore();
      }
    },
    [hasMore, loadMore],
  );

  return (
    <AdminScrollView
      onScroll={handleScroll}
      scrollEventThrottle={16}
      contentContainerStyle={{
        paddingBottom: Math.max(insets.bottom, 24) + (isWide ? 0 : 72),
        flexGrow: 1,
      }}
    >
      <AdminContentFrame>
        <View
          style={{
            paddingTop: isWide ? 0 : Math.max(insets.top, 12),
          }}
        >
          {isLoading ? (
            <View style={{ paddingVertical: 80, alignItems: "center" }}>
              <ActivityIndicator color={ADMIN_COLORS.navActive} />
            </View>
          ) : error ? (
            <View
              style={{
                paddingVertical: 48,
                paddingHorizontal: 20,
                alignItems: "center",
                gap: 12,
              }}
            >
              <Text
                style={{
                  ...pretendard(500),
                  fontSize: 14,
                  color: ADMIN_COLORS.navyMuted,
                }}
              >
                {error}
              </Text>

              <Pressable onPress={() => void reload()}>
                <Text
                  style={{
                    ...pretendard(600),
                    fontSize: 14,
                    color: ADMIN_COLORS.navActive,
                  }}
                >
                  다시 시도
                </Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 24,
                gap: 12,
              }}
            >
              {performanceWarning ? (
                <Text
                  style={{
                    ...pretendard(500),
                    fontSize: 13,
                    lineHeight: 18,
                    color: ADMIN_COLORS.navyMuted,
                    backgroundColor: "#FFF8E6",
                    borderRadius: 8,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                  }}
                >
                  {performanceWarning}
                </Text>
              ) : null}

              <AdminProductPerformanceList
                products={products}
                stretch={isWide}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                query={query}
                onQueryChange={setQuery}
                category={category}
                onCategoryChange={setCategory}
              />
            </View>
          )}
        </View>
      </AdminContentFrame>
    </AdminScrollView>
  );
}