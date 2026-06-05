import { CartCheckbox } from "@/components/cart/CartCheckbox";
import type { CartLineItem } from "@/contexts/CartContext";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

type MapShoppingSheetCategoryItemProps = {
  item: CartLineItem;
  onToggleChecked: (checked: boolean) => void;
  onRemove: () => void;
};

export function MapShoppingSheetCategoryItem({
  item,
  onToggleChecked,
  onRemove,
}: MapShoppingSheetCategoryItemProps) {
  const categoryName = item.category?.categoryName ?? item.product.name;
  const checked = item.checked ?? false;

  return (
    <View
      className="border-b border-light-gray px-screen"
      style={{ paddingVertical: SPACING.md, gap: SPACING.sm }}
    >
      <View className="flex-row items-center" style={{ gap: SPACING.sm }}>
        <CartCheckbox
          checked={checked}
          onPress={() => onToggleChecked(!checked)}
          accessibilityLabel={`${categoryName} 구역 완료`}
        />
        <View className="flex-1" style={{ gap: 4 }}>
          <Text className="text-md text-text-sub" style={pretendard(400)}>
            구역
          </Text>
          <Text
            className="text-lg text-text-main"
            style={[
              pretendard(700),
              checked
                ? { textDecorationLine: "line-through", color: COLORS.subText }
                : undefined,
            ]}
          >
            {categoryName}
          </Text>
        </View>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${categoryName} 구역 삭제`}
          style={{
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.xs,
            borderWidth: 1,
            borderColor: COLORS.lightGray,
            borderRadius: 8,
          }}
        >
          <Text className="text-md text-text-sub" style={pretendard(500)}>
            삭제
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
