import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import {
  PurchaseHistoryOrderProductItem,
  PurchaseHistoryOrderSummary,
} from "@/components/purchase-history";
import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { formatOrderDisplayDate } from "@/lib/orders/formatOrderDate";
import { pretendard } from "@/utils/pretendard";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

function parseOrderId(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function PurchaseHistoryDetailScreen() {
  const { orderId: orderIdParam } = useLocalSearchParams<{
    orderId?: string;
  }>();
  const orderId = useMemo(() => parseOrderId(orderIdParam), [orderIdParam]);
  const { order, loading, error, reload } = useOrderDetail(orderId);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return (
    <SafeView>
      <Header title="구매 내역" showBack />
      {loading && !order ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.blueText} />
        </View>
      ) : error && !order ? (
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
      ) : order ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.screen,
            paddingBottom: SPACING.xl,
          }}
        >
          <Text
            className="text-lg text-text-main"
            style={{
              ...pretendard(700),
              paddingTop: SPACING.lg,
              paddingBottom: SPACING.md,
            }}
          >
            {formatOrderDisplayDate(order.orderedAt)}
          </Text>

          <View style={{ gap: SPACING.lg }}>
            {order.items.map((item, index) => (
              <View
                key={item.orderItemId}
                style={
                  index < order.items.length - 1
                    ? {
                        paddingBottom: SPACING.lg,
                        borderBottomWidth: BORDER.thin,
                        borderBottomColor: COLORS.lightGray,
                      }
                    : undefined
                }
              >
                <PurchaseHistoryOrderProductItem item={item} />
              </View>
            ))}
          </View>

          <PurchaseHistoryOrderSummary
            discountAmount={order.discountAmount}
            finalAmount={order.finalAmount}
            earnedReward={order.earnedReward}
          />
        </ScrollView>
      ) : null}
    </SafeView>
  );
}
