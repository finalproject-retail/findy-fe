import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";
import type { CouponFilter } from "./types";

const CHIP_PADDING_VERTICAL = 8;
const CHIP_PADDING_HORIZONTAL = 15;

const FILTER_OPTIONS: { key: CouponFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "product", label: "상품" },
  { key: "membership", label: "멤버십" },
  { key: "brand", label: "브랜드" },
];

type CouponFilterChipsProps = {
  value: CouponFilter;
  onChange: (value: CouponFilter) => void;
};

export function CouponFilterChips({ value, onChange }: CouponFilterChipsProps) {
  return (
    <View className="flex-row flex-wrap" style={{ gap: SPACING.sm }}>
      {FILTER_OPTIONS.map((option) => {
        const selected = value === option.key;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={{
              paddingVertical: CHIP_PADDING_VERTICAL,
              paddingHorizontal: CHIP_PADDING_HORIZONTAL,
              borderRadius: RADIUS.full,
              backgroundColor: selected ? COLORS.text : COLORS.lightGray,
            }}
          >
            <Text
              className="text-sm"
              style={{
                ...pretendard(500),
                color: selected ? COLORS.white : COLORS.subText,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
