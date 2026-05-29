import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";
import type { CategorySub } from "./categoryCatalog";

type CategorySubTabsProps = {
  subs: CategorySub[];
  value: number;
  onChange: (categoryId: number) => void;
};

export function CategorySubTabs({ subs, value, onChange }: CategorySubTabsProps) {
  return (
    <View
      className="flex-row"
      style={{
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
      }}
    >
      {subs.map((sub) => {
        const selected = value === sub.categoryId;
        return (
          <Pressable
            key={sub.categoryId}
            onPress={() => onChange(sub.categoryId)}
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
              className="text-lg text-center"
              numberOfLines={1}
              style={{
                ...pretendard(selected ? 700 : 500),
                color: selected ? COLORS.text : COLORS.subText,
              }}
            >
              {sub.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
