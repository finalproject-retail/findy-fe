import CheckOffIcon from "@/assets/icons/check-off.svg";
import CheckOnIcon from "@/assets/icons/check-on.svg";
import { Pressable } from "react-native";

const CHECKBOX_SIZE = 24;

type CartCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function CartCheckbox({
  checked,
  disabled = false,
  onPress,
  accessibilityLabel,
}: CartCheckboxProps) {
  const Icon = checked ? CheckOnIcon : CheckOffIcon;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center"
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <Icon width={CHECKBOX_SIZE} height={CHECKBOX_SIZE} />
    </Pressable>
  );
}
