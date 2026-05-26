import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import type { PointHistoryItem as PointHistoryItemType } from "./mockPointHistory";

function formatHistoryAmount(
  amount: number,
  type: PointHistoryItemType["type"],
) {
  const absolute = Math.abs(amount).toLocaleString("ko-KR");
  if (type === "earned") return `${absolute}P`;
  return `- ${absolute}P`;
}

function getStatusLabel(type: PointHistoryItemType["type"]) {
  if (type === "earned") return "적립";
  if (type === "expired") return "소멸";
  return "사용";
}

type PointHistoryItemProps = {
  item: PointHistoryItemType;
};

export function PointHistoryItem({ item }: PointHistoryItemProps) {
  const isEarned = item.type === "earned";

  return (
    <View
      className="flex-row justify-between"
      style={{
        paddingVertical: SPACING.lg,
        gap: SPACING.md,
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
      }}
    >
      <View className="min-w-0 flex-1" style={{ gap: SPACING.xs }}>
        <Text className="text-sm text-text-sub" style={pretendard(400)}>
          {item.date}
        </Text>
        <Text className="text-lg text-text-main" style={pretendard(700)}>
          {item.title}
        </Text>
        <Text className="text-sm text-text-sub" style={pretendard(400)}>
          {item.subtitle}
        </Text>
      </View>

      <View className="items-end justify-center" style={{ gap: SPACING.xs }}>
        <Text
          className="text-lg"
          style={{
            ...pretendard(700),
            color: isEarned ? COLORS.main : COLORS.text,
          }}
        >
          {formatHistoryAmount(item.amount, item.type)}
        </Text>
        <Text
          className="text-xs"
          style={{
            ...pretendard(500),
            color: isEarned ? COLORS.main : COLORS.subText,
          }}
        >
          {getStatusLabel(item.type)}
        </Text>
      </View>
    </View>
  );
}
