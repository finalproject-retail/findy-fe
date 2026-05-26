import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";
import { FaqQuestionIcon } from "./FaqQuestionIcon";
import type { FaqItem } from "./mockFaq";

type FaqListItemProps = {
  item: FaqItem;
  expanded: boolean;
  onPress: () => void;
};

export function FaqListItem({ item, expanded, onPress }: FaqListItemProps) {
  return (
    <View
      style={{
        borderBottomWidth: BORDER.thin,
        borderBottomColor: COLORS.lightGray,
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={item.question}
        className="flex-row items-center"
        style={{
          gap: SPACING.md,
          paddingVertical: SPACING.lg,
        }}
      >
        <FaqQuestionIcon />
        <Text
          className="min-w-0 flex-1 text-md text-text-main"
          style={pretendard(500)}
        >
          {item.question}
        </Text>
      </Pressable>

      {expanded ? (
        <View
          style={{
            marginBottom: SPACING.lg,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.md,
            borderRadius: RADIUS.xs,
            backgroundColor: COLORS.lightGray,
          }}
        >
          <Text
            className="text-sm text-charcoal"
            style={{
              ...pretendard(400),
              lineHeight: 22,
            }}
          >
            {item.answer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
