import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

const TRACK_WIDTH = 41;
const TRACK_HEIGHT = 21;
const THUMB_SIZE = 17;
const TRACK_PADDING = 2;

type SettingsToggleRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function SettingsToggleRow({
  label,
  value,
  onValueChange,
}: SettingsToggleRowProps) {
  return (
    <View
      className="flex-row items-center justify-between"
      style={{
        paddingVertical: SPACING.lg,
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
      }}
    >
      <Text className="text-md text-text-main" style={pretendard(500)}>
        {label}
      </Text>
      <Pressable
        onPress={() => onValueChange(!value)}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        accessibilityLabel={label}
        hitSlop={8}
      >
        <View
          style={{
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: TRACK_HEIGHT / 2,
            padding: TRACK_PADDING,
            backgroundColor: value ? COLORS.main : COLORS.gray,
            justifyContent: "center",
            alignItems: value ? "flex-end" : "flex-start",
          }}
        >
          <View
            style={{
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: COLORS.white,
            }}
          />
        </View>
      </Pressable>
    </View>
  );
}
