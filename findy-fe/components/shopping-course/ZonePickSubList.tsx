import { CartCheckbox } from "@/components/cart/CartCheckbox";
import type { CategoryMiddle } from "@/components/category";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, ScrollView, Text, View } from "react-native";

type ZonePickSubListProps = {
  middles: CategoryMiddle[];
  selectedIds: Set<number>;
  onToggle: (categoryId: number) => void;
  bottomInset?: number;
};

export function ZonePickSubList({
  middles,
  selectedIds,
  onToggle,
  bottomInset = 100,
}: ZonePickSubListProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: SPACING.md,
        paddingBottom: bottomInset,
      }}
    >
      {middles.map((middle) => (
        <View key={middle.key} style={{ marginBottom: SPACING.lg }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.sm,
            }}
          >
            <Text style={{ fontSize: 18 }}>{middle.emoji}</Text>
            <Text className="text-lg text-text-main" style={pretendard(700)}>
              {middle.label}
            </Text>
          </View>

          {middle.subs.map((sub) => {
            const checked = selectedIds.has(sub.categoryId);

            return (
              <Pressable
                key={sub.categoryId}
                onPress={() => onToggle(sub.categoryId)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={`${sub.label} 구역`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: SPACING.md,
                  paddingVertical: 14,
                  gap: SPACING.sm,
                }}
              >
                <CartCheckbox
                  checked={checked}
                  accessibilityLabel={`${sub.label} 선택`}
                />
                <Text
                  className="flex-1 text-md text-text-main"
                  style={pretendard(checked ? 600 : 400)}
                >
                  {sub.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
