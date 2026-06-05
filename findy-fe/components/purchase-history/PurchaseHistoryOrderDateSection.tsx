import { BORDER, COLORS, SPACING } from "@/constants/theme";
import type { OrderDetailApiDto } from "@/lib/orders/api/types";
import type { PurchaseHistoryDateGroup } from "@/lib/orders/purchaseHistoryUtils";
import { pretendard } from "@/utils/pretendard";
import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { PurchaseHistoryOrderPreview } from "./PurchaseHistoryOrderPreview";

type PurchaseHistoryOrderDateSectionProps = {
  group: PurchaseHistoryDateGroup;
  orderDetails: Map<number, OrderDetailApiDto>;
};

export function PurchaseHistoryOrderDateSection({
  group,
  orderDetails,
}: PurchaseHistoryOrderDateSectionProps) {
  const router = useRouter();

  return (
    <View style={{ marginBottom: SPACING.lg }}>
      <Text
        className="text-lg text-text-main"
        style={{
          ...pretendard(700),
          paddingTop: SPACING.md,
          paddingBottom: SPACING.xs,
        }}
      >
        {group.date}
      </Text>

      {group.orders.map((order) => {
        const detail = orderDetails.get(order.orderId);
        const items = detail?.items ?? [];

        if (items.length === 0) {
          return (
            <Pressable
              key={order.orderId}
              onPress={() =>
                router.push(`/purchase-history/${order.orderId}` as Href)
              }
              accessibilityRole="button"
              accessibilityLabel={`${order.firstProductName} 구매 상세 보기`}
              style={{
                paddingVertical: SPACING.md,
                borderBottomWidth: BORDER.thin,
                borderBottomColor: COLORS.lightGray,
              }}
            >
              <Text className="text-md text-text-main" style={pretendard(500)}>
                {order.firstProductName}
              </Text>
              <Text
                className="text-sm text-text-sub2"
                style={{ ...pretendard(600), marginTop: SPACING.xs }}
              >
                상세보기
              </Text>
            </Pressable>
          );
        }

        return (
          <PurchaseHistoryOrderPreview
            key={order.orderId}
            orderId={order.orderId}
            items={items}
            finalAmount={detail?.finalAmount ?? order.finalAmount}
          />
        );
      })}
    </View>
  );
}
