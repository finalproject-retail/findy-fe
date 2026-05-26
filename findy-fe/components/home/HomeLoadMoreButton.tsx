import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View, type ViewStyle } from "react-native";

const ARROW_ICON_WIDTH = 13;
const ARROW_ICON_HEIGHT = 17;
const ARROW_SLOT_SIZE = 17;

const buttonSurfaceStyle: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: SPACING.xs,
  paddingVertical: SPACING.sm,
  paddingHorizontal: SPACING.xl,
  borderRadius: RADIUS.full,
  borderWidth: 1,
  borderColor: COLORS.lightGray,
  backgroundColor: COLORS.white,
};

type HomeLoadMoreButtonProps = {
  expanded: boolean;
  onPress: () => void;
};

export function HomeLoadMoreButton({
  expanded,
  onPress,
}: HomeLoadMoreButtonProps) {
  const label = expanded ? "닫기" : "더보기";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="self-center"
      style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
    >
      <View
        className="flex-row items-center justify-center gap-xs rounded-full border border-light-gray bg-white"
        style={buttonSurfaceStyle}
      >
        <Text
          className="text-md text-charcoal"
          style={{
            ...pretendard(600),
            fontSize: TYPOGRAPHY.size.md,
            color: COLORS.charcoal,
          }}
        >
          {label}
        </Text>
        <View
          style={{
            width: ARROW_SLOT_SIZE,
            height: ARROW_SLOT_SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ transform: [{ scaleY: expanded ? -1 : 1 }] }}>
            <DownArrowIcon
              width={ARROW_ICON_WIDTH}
              height={ARROW_ICON_HEIGHT}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
