import { formatPrice } from "@/components/product/formatPrice";
import { BORDER, COLORS, SPACING } from "@/constants/theme";
import type { OrderSummaryApiDto } from "@/lib/orders/api/types";
import { pretendard } from "@/utils/pretendard";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

type PurchaseHistoryOrderListItemProps = {
  order: OrderSummaryApiDto;
};

function formatOrderTitle(order: OrderSummaryApiDto) {
  if (order.itemCount <= 1) {
    return order.firstProductName;
  }
  return `${order.firstProductName} 외 ${order.itemCount - 1}건`;
}

export function PurchaseHistoryOrderListItem({
  order,
}: PurchaseHistoryOrderListItemProps) {
  const router = useRouter();

  const openOrderDetail = () => {
    router.push(`/purchase-history/${order.orderId}` as Href);
  };

  return (
    <Pressable
      onPress={openOrderDetail}
      accessibilityRole="button"
      accessibilityLabel={`${formatOrderTitle(order)} 구매 상세 보기`}
      style={{
        paddingVertical: SPACING.md,
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
        gap: SPACING.xs,
      }}
    >
      <Text
        className="text-md text-text-main"
        style={pretendard(500)}
        numberOfLines={2}
      >
        {formatOrderTitle(order)}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-text-sub2" style={pretendard(400)}>
          {order.itemCount}종
        </Text>
        <Text className="text-md text-text-main" style={pretendard(700)}>
          {formatPrice(order.finalAmount)}
        </Text>
      </View>
    </Pressable>
  );
}
