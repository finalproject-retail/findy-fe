import CartIcon from "@/assets/icons/cart-icon.svg";
import { useCart } from "@/contexts/CartContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { COLORS, RADIUS } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { formatPrice } from "../formatPrice";
import type { Product } from "../types";

const PRODUCT_NAME_HEIGHT = 40;
const PRODUCT_NAME_LINE_HEIGHT = 20;
const CART_BUTTON_SIZE = 32;

type RecommendedProductCardProps = {
  product: Product;
  width: number;
};

export function RecommendedProductCard({
  product,
  width,
}: RecommendedProductCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = () => {
    addToCart(product, 1);
    showToast(TOAST_MESSAGES.addedToCart);
  };

  return (
    <View style={{ width }}>
      <View style={{ width, height: width }}>
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
        >
          <Image
            source={product.image}
            style={{ width, height: width, borderRadius: 3 }}
            contentFit="cover"
          />
        </Pressable>
        <Pressable
          onPress={handleAddToCart}
          accessibilityRole="button"
          accessibilityLabel="장바구니에 담기"
          style={{
            position: "absolute",
            right: 6,
            bottom: 6,
            width: CART_BUTTON_SIZE,
            height: CART_BUTTON_SIZE,
            borderRadius: RADIUS.full,
            backgroundColor: COLORS.white,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CartIcon width={18} height={18} />
        </Pressable>
      </View>

      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
        className="mt-2 gap-1"
      >
        <Text
          className="text-lg text-text-main"
          numberOfLines={2}
          style={{
            ...pretendard(500),
            height: PRODUCT_NAME_HEIGHT,
            lineHeight: PRODUCT_NAME_LINE_HEIGHT,
          }}
        >
          {product.name}
        </Text>

        <View className="flex-row items-center gap-1">
          <Text className="text-lg text-text-red" style={pretendard(700)}>
            {product.discountPercent}%
          </Text>
          <Text className="text-lg text-text-main" style={pretendard(700)}>
            {formatPrice(product.price)}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
