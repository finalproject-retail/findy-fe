import type { CartZoneItem } from "@/components/category";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

type CartZoneItemRowProps = {
  zone: CartZoneItem;
  onRemove: () => void;
};

export function CartZoneItemRow({ zone, onRemove }: CartZoneItemRowProps) {
  return (
    <View
      className="flex-row items-center border-b border-light-gray px-screen"
      style={{
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
      }}
    >
      <Text style={{ fontSize: 22 }}>{zone.emoji}</Text>
      <View className="flex-1" style={{ gap: 4 }}>
        <Text className="text-md text-text-sub" style={pretendard(400)}>
          {zone.path}
        </Text>
        <Text className="text-lg text-text-main" style={pretendard(700)}>
          {zone.label}
        </Text>
      </View>
      <Pressable
        onPress={onRemove}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${zone.label} 구역 삭제`}
        style={{
          paddingHorizontal: SPACING.sm,
          paddingVertical: SPACING.xs,
        }}
      >
        <Text className="text-md text-text-sub" style={pretendard(500)}>
          삭제
        </Text>
      </Pressable>
    </View>
  );
}
