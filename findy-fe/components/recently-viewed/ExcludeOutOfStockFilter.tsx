import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

type ExcludeOutOfStockFilterProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const CHECKBOX_SIZE = 18;

export function ExcludeOutOfStockFilter({
  checked,
  onChange,
}: ExcludeOutOfStockFilterProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel="품절 상품 제외"
      className="flex-row items-center"
      style={{ gap: SPACING.sm }}
    >
      <View
        style={{
          width: CHECKBOX_SIZE,
          height: CHECKBOX_SIZE,
          borderWidth: BORDER.base,
          borderColor: COLORS.gray,
          borderRadius: 2,
          backgroundColor: checked ? COLORS.text : COLORS.white,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <Text className="text-xs text-white" style={pretendard(700)}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text className="text-md text-text-sub" style={pretendard(400)}>
        품절 상품 제외
      </Text>
    </Pressable>
  );
}
