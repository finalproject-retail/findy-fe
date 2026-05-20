import CartIcon from "@/assets/icons/cart-icon.svg";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text } from "react-native";

type AddToCartButtonProps = {
  onPress?: () => void;
};

export function AddToCartButton({ onPress }: AddToCartButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="장바구니에 담기"
      className="h-9 w-full flex-row items-center justify-center gap-1 rounded-xs border border-light-gray bg-white"
    >
      <CartIcon width={18} height={18} />
      <Text className="text-sm text-charcoal" style={pretendard(500)}>
        담기
      </Text>
    </Pressable>
  );
}
