import { COLORS } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";
import type { CategoryTop } from "./categoryCatalog";

const SIDEBAR_WIDTH = 120;

type CategorySidebarProps = {
  tops: CategoryTop[];
  activeTopKey: string;
  onSelect: (topKey: string) => void;
};

export function CategorySidebar({
  tops,
  activeTopKey,
  onSelect,
}: CategorySidebarProps) {
  return (
    <View
      style={{
        width: SIDEBAR_WIDTH,
        backgroundColor: "#F5F5F5",
      }}
    >
      {tops.map((top) => {
        const selected = top.key === activeTopKey;
        return (
          <Pressable
            key={top.key}
            onPress={() => onSelect(top.key)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={{
              paddingVertical: 25,
              paddingHorizontal: 12,
              backgroundColor: selected ? COLORS.white : "#F5F5F5",
            }}
          >
            <Text
              className="text-md text-center"
              style={{
                ...pretendard(selected ? 700 : 500),
                color: COLORS.text,
              }}
            >
              {top.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const CATEGORY_SIDEBAR_WIDTH = SIDEBAR_WIDTH;
