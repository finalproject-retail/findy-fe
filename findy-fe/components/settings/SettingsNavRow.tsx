import { MypageNavigateArrow } from "@/components/mypage/MypageNavigateArrow";
import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text } from "react-native";

type SettingsNavRowProps = {
  label: string;
  onPress: () => void;
};

export function SettingsNavRow({ label, onPress }: SettingsNavRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
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
      <MypageNavigateArrow />
    </Pressable>
  );
}
