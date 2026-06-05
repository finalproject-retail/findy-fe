import { SPACING } from "@/constants/theme";
import type { PurchaseHistoryDateGroup } from "@/lib/orders/purchaseHistoryUtils";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import { PurchaseHistoryOrderListItem } from "./PurchaseHistoryOrderListItem";

type PurchaseHistoryOrderDateSectionProps = {
  group: PurchaseHistoryDateGroup;
};

export function PurchaseHistoryOrderDateSection({
  group,
}: PurchaseHistoryOrderDateSectionProps) {
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
      {group.orders.map((order) => (
        <PurchaseHistoryOrderListItem key={order.orderId} order={order} />
      ))}
    </View>
  );
}
