import { formatPrice } from "@/components/product/formatPrice";
import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type PurchaseHistoryOrderSummaryProps = {
  discountAmount: number;
  finalAmount: number;
  earnedReward: number;
};

type SummaryRowProps = {
  label: string;
  value: string;
  emphasize?: boolean;
};

function SummaryRow({ label, value, emphasize = false }: SummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-md text-text-sub2" style={pretendard(400)}>
        {label}
      </Text>
      <Text
        className={emphasize ? "text-lg text-text-main" : "text-md text-text-main"}
        style={pretendard(emphasize ? 700 : 500)}
      >
        {value}
      </Text>
    </View>
  );
}

export function PurchaseHistoryOrderSummary({
  discountAmount,
  finalAmount,
  earnedReward,
}: PurchaseHistoryOrderSummaryProps) {
  return (
    <View
      style={{
        marginTop: SPACING.lg,
        paddingTop: SPACING.lg,
        borderTopWidth: BORDER.thin,
        borderTopColor: COLORS.lightGray,
        gap: SPACING.sm,
      }}
    >
      <SummaryRow
        label="총 할인 금액"
        value={formatPrice(discountAmount)}
      />
      <SummaryRow
        label="최종 결제 금액"
        value={formatPrice(finalAmount)}
        emphasize
      />
      <SummaryRow
        label="발생한 적립금"
        value={`${earnedReward.toLocaleString("ko-KR")}P`}
      />
    </View>
  );
}
