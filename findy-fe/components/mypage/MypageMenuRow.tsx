import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native";
import type { SvgProps } from "react-native-svg";
import { MypageNavigateArrow } from "./MypageNavigateArrow";

const ICON_SIZE = 28;

type MypageMenuRowProps = {
  icon: ComponentType<SvgProps>;
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export function MypageMenuRow({
  icon: Icon,
  title,
  subtitle,
  onPress,
}: MypageMenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-row items-center"
      style={{ gap: SPACING.md, paddingVertical: SPACING.sm }}
    >
      <Icon width={ICON_SIZE} height={ICON_SIZE} />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-lg text-text-main" style={pretendard(600)}>
          {title}
        </Text>
        <Text className="text-sm text-text-sub" style={pretendard(400)}>
          {subtitle}
        </Text>
      </View>
      <MypageNavigateArrow />
    </Pressable>
  );
}
