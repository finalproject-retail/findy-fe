import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";
import type { CouponTab } from "./types";

const TABS: { key: CouponTab; label: string }[] = [
  { key: "my", label: "나의 쿠폰" },
  { key: "get", label: "쿠폰 받기" },
];

type CouponTopTabsProps = {
  value: CouponTab;
  onChange: (value: CouponTab) => void;
};

export function CouponTopTabs({ value, onChange }: CouponTopTabsProps) {
  return (
    <View
      className="flex-row"
      style={{
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
      }}
    >
      {TABS.map((tab) => {
        const selected = value === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="flex-1 items-center"
            style={{
              paddingVertical: SPACING.sm,
              borderBottomWidth: selected ? 1 : 0,
              borderBottomColor: COLORS.text,
            }}
          >
            <Text
              className="text-lg"
              style={{
                ...pretendard(selected ? 700 : 500),
                color: selected ? COLORS.text : COLORS.subText,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
