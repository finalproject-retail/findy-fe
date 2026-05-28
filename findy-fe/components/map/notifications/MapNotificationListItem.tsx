import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Platform, Pressable, Text, View } from "react-native";
import type { MapShoppingNotification } from "./types";

const THUMB_SIZE = 72;

type MapNotificationListItemProps = {
  item: MapShoppingNotification;
  onPress?: () => void;
};

export function MapNotificationListItem({
  item,
  onPress,
}: MapNotificationListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        gap: SPACING.md,
        paddingVertical: SPACING.lg,
      }}
    >
      <Image
        source={item.relatedProduct.image}
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: RADIUS.xs,
        }}
        contentFit="cover"
      />
      <View style={{ flex: 1, gap: SPACING.xs }}>
        <Text
          style={{
            ...pretendard(600),
            fontSize: TYPOGRAPHY.size.sm,
            lineHeight: 20,
            color: COLORS.text,
            ...(Platform.OS === "android" && { includeFontPadding: false }),
          }}
        >
          {item.headline}
        </Text>
        <Text
          style={{
            ...pretendard(400),
            fontSize: TYPOGRAPHY.size.xs,
            lineHeight: 18,
            color: COLORS.subText,
            ...(Platform.OS === "android" && { includeFontPadding: false }),
          }}
        >
          {item.description}
        </Text>
      </View>
    </Pressable>
  );
}
