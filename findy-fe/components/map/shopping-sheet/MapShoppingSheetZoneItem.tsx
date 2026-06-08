import { SPACING, COLORS } from "@/constants/theme";
import type { TripZoneLineItem } from "@/lib/shopping/types";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

const DELETE_SIZE = 26;
const TITLE_LINE_HEIGHT = 20;

type MapShoppingSheetZoneItemProps = {
  zone: TripZoneLineItem;
  onRemove: () => void;
};

export function MapShoppingSheetZoneItem({
  zone,
  onRemove,
}: MapShoppingSheetZoneItemProps) {
  return (
    <View
      className="border-b border-light-gray px-screen"
      style={{
        paddingVertical: SPACING.md,
        gap: SPACING.sm,
      }}
    >
      <View className="flex-row items-center" style={{ gap: SPACING.sm }}>
        <Text style={{ fontSize: 22 }}>{zone.emoji}</Text>

        <View className="min-w-0 flex-1" style={{ gap: 4 }}>
          <View className="flex-row items-start" style={{ gap: SPACING.xs }}>
            <View className="min-w-0 flex-1" style={{ gap: 4 }}>
              <Text className="text-md text-text-sub" style={pretendard(400)}>
                {zone.path}
              </Text>
              <Text className="text-lg text-text-main" style={pretendard(700)}>
                {zone.label}
              </Text>
            </View>

            <Pressable
              onPress={onRemove}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`${zone.label} 삭제`}
              style={{
                width: DELETE_SIZE,
                height: TITLE_LINE_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...pretendard(400),
                  fontSize: DELETE_SIZE,
                  color: COLORS.subText,
                  lineHeight: DELETE_SIZE,
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
