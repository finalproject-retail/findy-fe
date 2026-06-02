import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

export type CartTab = "products" | "zones";

const TABS: { key: CartTab; label: string }[] = [
  { key: "products", label: "상품" },
  { key: "zones", label: "구역" },
];

type CartTopTabsProps = {
  value: CartTab;
  onChange: (value: CartTab) => void;
  productCount?: number;
  zoneCount?: number;
};

export function CartTopTabs({
  value,
  onChange,
  productCount = 0,
  zoneCount = 0,
}: CartTopTabsProps) {
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
        const count = tab.key === "products" ? productCount : zoneCount;
        const label = count > 0 ? `${tab.label} ${count}` : tab.label;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className="flex-1 items-center"
            style={{
              paddingVertical: SPACING.sm,
              borderBottomWidth: selected ? 2 : 0,
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
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
