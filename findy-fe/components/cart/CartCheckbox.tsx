import CheckGreenIcon from "@/assets/icons/check-green.svg";
import CheckOffIcon from "@/assets/icons/check-off.svg";
import CheckOnIcon from "@/assets/icons/check-on.svg";
import { Pressable, View } from "react-native";

const CHECKBOX_SIZE = 24;

type CartCheckboxProps = {
  checked: boolean;
  /** 지도 쇼핑 시트 — 바코드 픽 완료(초록 체크, 비활성) */
  picked?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  accessibilityLabel: string;
};

export function CartCheckbox({
  checked,
  picked = false,
  disabled = false,
  onPress,
  accessibilityLabel,
}: CartCheckboxProps) {
  const Icon = picked
    ? CheckGreenIcon
    : checked
      ? CheckOnIcon
      : CheckOffIcon;
  const isDisabled = disabled || picked;

  // onPress가 없는 경우(부모 Pressable이 토글을 담당) 터치 이벤트를 먹지 않도록 View로 렌더링
  if (!onPress) {
    return (
      <View
        pointerEvents="none"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: checked || picked, disabled: isDisabled }}
        accessibilityLabel={accessibilityLabel}
        className="items-center justify-center"
        style={{ opacity: isDisabled && !picked ? 0.4 : 1 }}
      >
        <Icon width={CHECKBOX_SIZE} height={CHECKBOX_SIZE} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: checked || picked, disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center"
      style={{ opacity: isDisabled && !picked ? 0.4 : 1 }}
    >
      <View pointerEvents="none">
        <Icon width={CHECKBOX_SIZE} height={CHECKBOX_SIZE} />
      </View>
    </Pressable>
  );
}
