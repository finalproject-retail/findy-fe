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
      style={{
        paddingVertical: SPACING.lg,

        gap: SPACING.xs,

        borderBottomWidth: BORDER.thin,

        borderBottomColor: COLORS.lightGray,
      }}
    >
      <Text className="text-sm text-text-sub" style={pretendard(400)}>
        {item.date}
      </Text>

      <View
        className="flex-row items-start justify-between"
        style={{ gap: SPACING.md }}
      >
        <View className="min-w-0 flex-1" style={{ gap: SPACING.xs }}>
          <Text className="text-md text-text-main" style={pretendard(700)}>
            {item.title}
          </Text>

          <Text className="text-sm text-text-sub" style={pretendard(400)}>
            {item.subtitle}
          </Text>
        </View>

        <View className="items-end" style={{ gap: SPACING.xs }}>
          <Text
            className="text-md"
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
    </View>
  );
}
