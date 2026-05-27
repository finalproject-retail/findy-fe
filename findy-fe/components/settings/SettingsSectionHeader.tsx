import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text } from "react-native";

type SettingsSectionHeaderProps = {
  title: string;
};

export function SettingsSectionHeader({ title }: SettingsSectionHeaderProps) {
  return (
    <Text
      className="text-sm text-text-sub2"
      style={{
        ...pretendard(400),
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.sm,
      }}
    >
      {title}
    </Text>
  );
}
