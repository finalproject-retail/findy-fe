import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import { PurchaseHistoryListItem } from "./PurchaseHistoryListItem";
import type { PurchaseHistoryDateGroup } from "./mockPurchaseHistory";

type PurchaseHistoryDateSectionProps = {
  group: PurchaseHistoryDateGroup;
};

export function PurchaseHistoryDateSection({
  group,
}: PurchaseHistoryDateSectionProps) {
  return (
    <View style={{ marginBottom: SPACING.lg }}>
      <View>
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
        {group.items.map((record) => (
          <PurchaseHistoryListItem key={record.id} record={record} />
        ))}
      </View>
    </View>
  );
}
