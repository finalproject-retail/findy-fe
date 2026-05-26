import type { CartLineItem } from "@/contexts/CartContext";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";
import { CartCheckbox } from "./CartCheckbox";

type CartSelectAllRowProps = {
  items: CartLineItem[];
  onToggleAll: () => void;
};

export function CartSelectAllRow({ items, onToggleAll }: CartSelectAllRowProps) {
  const selectedCount = items.filter((item) => item.selected).length;
  const totalCount = items.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <View
      className="flex-row items-center border-b border-light-gray px-screen"
      style={{ paddingVertical: SPACING.md, gap: SPACING.sm }}
    >
      <CartCheckbox
        checked={allSelected && totalCount > 0}
        onPress={onToggleAll}
        accessibilityLabel="전체 선택"
      />
      <Text className="text-lg text-text-main" style={pretendard(500)}>
        전체 선택{" "}
        <Text style={pretendard(700)}>
          {selectedCount}/{totalCount}
        </Text>
      </Text>
    </View>
  );
}
