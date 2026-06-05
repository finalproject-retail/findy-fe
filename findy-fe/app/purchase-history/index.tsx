import {
  getDefaultPeriodInquiryValue,
  Header,
  PeriodInquiry,
  type PeriodInquiryValue,
} from "@/components/common";
import { SafeView } from "@/components/layout";
import {
  PurchaseHistoryOrderDateSection,
  PurchaseHistorySearchBar,
} from "@/components/purchase-history";
import { COLORS, SPACING } from "@/constants/theme";
import { usePurchaseHistoryOrders } from "@/hooks/usePurchaseHistoryOrders";
import {
  filterPurchaseHistoryOrders,
  groupPurchaseHistoryOrdersByDate,
} from "@/lib/orders/purchaseHistoryUtils";
import { pretendard } from "@/utils/pretendard";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function PurchaseHistoryScreen() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodInquiryValue>(
    getDefaultPeriodInquiryValue,
  );
  const { orders, loading, error, reload } = usePurchaseHistoryOrders();

  useFocusEffect(
    useCallback(() => {
      void reload(period);
    }, [period, reload]),
  );

  const dateGroups = useMemo(() => {
    const filtered = filterPurchaseHistoryOrders(orders, query);
    return groupPurchaseHistoryOrdersByDate(filtered);
  }, [orders, query]);

  return (
    <SafeView>
      <Header title="구매 내역" showBack />
      {loading && orders.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.blueText} />
        </View>
      ) : error && orders.length === 0 ? (
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
            onPress={() => void reload(period)}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <Text className="text-md text-text-blue" style={pretendard(600)}>
              다시 시도
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.screen,
            paddingBottom: SPACING.xl,
          }}
        >
          <View style={{ gap: SPACING.md, paddingVertical: SPACING.lg }}>
            <PurchaseHistorySearchBar value={query} onChangeText={setQuery} />
            <PeriodInquiry value={period} onChange={setPeriod} />
          </View>

          {dateGroups.length === 0 ? (
            <Text
              className="text-center text-md text-text-sub"
              style={{ ...pretendard(400), paddingTop: SPACING.xl }}
            >
              구매 내역이 없습니다.
            </Text>
          ) : (
            dateGroups.map((group) => (
              <PurchaseHistoryOrderDateSection key={group.date} group={group} />
            ))
          )}
        </ScrollView>
      )}
    </SafeView>
  );
}
