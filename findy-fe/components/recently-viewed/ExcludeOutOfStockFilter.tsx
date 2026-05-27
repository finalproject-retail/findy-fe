import CheckOffIcon from "@/assets/icons/check-off.svg";
import CheckOnIcon from "@/assets/icons/check-on.svg";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text } from "react-native";

type ExcludeOutOfStockFilterProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const CHECKBOX_SIZE = 22;

export function ExcludeOutOfStockFilter({
  checked,
  onChange,
}: ExcludeOutOfStockFilterProps) {
  const CheckboxIcon = checked ? CheckOnIcon : CheckOffIcon;

  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="품절 상품 제외"
      className="flex-row items-center"
      style={{ gap: SPACING.sm }}
    >
      <CheckboxIcon width={CHECKBOX_SIZE} height={CHECKBOX_SIZE} />
      <Text className="text-md text-text-sub" style={pretendard(400)}>
        품절 상품 제외
      </Text>
    </Pressable>
  );
}
