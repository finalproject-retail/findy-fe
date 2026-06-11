import CartIcon from "@/assets/icons/cart-icon.svg";
import { useCart } from "@/contexts/CartContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text } from "react-native";
import type { Product } from "./types";

type AddToCartButtonProps = {
  product: Product;
  onPress?: () => void;
};

export function AddToCartButton({ product, onPress }: AddToCartButtonProps) {
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const handlePress = async () => {
    try {
      await addToCart(product, 1);
      showToast(TOAST_MESSAGES.addedToCart);
      onPress?.();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "장바구니에 담지 못했습니다.";
      showToast(message);
      console.error(error);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="장바구니에 담기"
      className="h-9 w-full flex-row items-center justify-center gap-1 rounded-xs border border-light-gray bg-white"
    >
      <CartIcon width={18} height={18} />
      <Text className="text-xs text-charcoal" style={pretendard(500)}>
        담기
      </Text>
    </Pressable>
  );
}
