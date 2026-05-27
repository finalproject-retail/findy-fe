import CartIcon from "@/assets/icons/cart-icon.svg";
import type { Product } from "@/components/product";
import { formatPrice } from "@/components/product/formatPrice";
import { isOutOfStock } from "@/components/product/isOutOfStock";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

const IMAGE_SIZE = 80;

type PurchaseHistoryProductItemProps = {
  product: Product;
  quantity: number;
};

export function PurchaseHistoryProductItem({
  product,
  quantity,
}: PurchaseHistoryProductItemProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const soldOut = isOutOfStock(product);
  const unitPrice = product.couponPrice ?? product.price;

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = () => {
    if (soldOut) return;
    addToCart(product, quantity);
    showToast(TOAST_MESSAGES.addedToCart);
  };

  return (
    <View style={{ gap: SPACING.md }}>
      <View className="flex-row" style={{ gap: SPACING.md }}>
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
        >
          <View style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}>
            <Image
              source={product.image}
              style={{
                width: IMAGE_SIZE,
                height: IMAGE_SIZE,
                borderRadius: RADIUS.xs,
              }}
              contentFit="cover"
            />
            {soldOut ? (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: RADIUS.xs,
                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="text-lg text-white" style={pretendard(700)}>
                  품절
                </Text>
              </View>
            ) : null}
          </View>
        </Pressable>

        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
          className="min-w-0 flex-1 justify-center"
          style={{ gap: SPACING.xs }}
        >
          <Text
            className="text-md text-text-main"
            style={pretendard(500)}
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-md text-text-red" style={pretendard(700)}>
              {product.discountPercent}%
            </Text>
            <Text className="text-md text-text-main" style={pretendard(700)}>
              {formatPrice(unitPrice)}
            </Text>
            <Text className="text-sm text-text-sub2" style={pretendard(400)}>
              |
            </Text>
            <Text className="text-sm text-text-sub2" style={pretendard(400)}>
              {quantity}개
            </Text>
          </View>
        </Pressable>
      </View>

      {!soldOut ? (
        <Pressable
          onPress={handleAddToCart}
          accessibilityRole="button"
          accessibilityLabel="장바구니에 담기"
          className="w-full flex-row items-center justify-center gap-1 rounded-xs border border-light-gray bg-white"
          style={{
            paddingVertical: SPACING.xs,
            borderWidth: BORDER.base,
            borderColor: COLORS.gray,
          }}
        >
          <CartIcon width={18} height={18} />
          <Text className="text-sm text-charcoal" style={pretendard(500)}>
            장바구니 담기
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
