import CartIcon from "@/assets/icons/cart-icon.svg";
import { formatPrice } from "@/components/product/formatPrice";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { addCartItem } from "@/lib/shopping/api";
import type { OrderItemApiDto } from "@/lib/orders/api/types";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import {
  getOrderItemDiscountPercent,
  getOrderItemUnitPrice,
} from "@/lib/orders/purchaseHistoryUtils";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

const IMAGE_SIZE = 80;

type PurchaseHistoryOrderProductItemProps = {
  item: OrderItemApiDto;
};

export function PurchaseHistoryOrderProductItem({
  item,
}: PurchaseHistoryOrderProductItemProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { refreshCart } = useCart();
  const discountPercent = getOrderItemDiscountPercent(
    item.productPrice,
    item.quantity,
    item.itemDiscountAmount,
  );
  const unitPrice = getOrderItemUnitPrice(item.itemFinalAmount, item.quantity);

  const openProductDetail = () => {
    router.push(`/product/${item.productId}`);
  };

  const handleAddToCart = async () => {
    try {
      await addCartItem(item.productId, item.quantity);
      await refreshCart();
      showToast(TOAST_MESSAGES.addedToCart);
    } catch {
      showToast("장바구니에 담지 못했습니다.");
    }
  };

  return (
    <View style={{ gap: SPACING.md }}>
      <View className="flex-row" style={{ gap: SPACING.md }}>
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${item.productName} 상세 보기`}
        >
          <Image
            source={resolveProductImageSource(item.imageUrl)}
            style={{
              width: IMAGE_SIZE,
              height: IMAGE_SIZE,
              borderRadius: RADIUS.xs,
            }}
            contentFit="cover"
          />
        </Pressable>

        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${item.productName} 상세 보기`}
          className="min-w-0 flex-1 justify-center"
          style={{ gap: SPACING.xs }}
        >
          <Text
            className="text-md text-text-main"
            style={pretendard(500)}
            numberOfLines={2}
          >
            {item.productName}
          </Text>

          <View className="flex-row flex-wrap items-center gap-2">
            {discountPercent != null ? (
              <Text className="text-md text-text-red" style={pretendard(700)}>
                {discountPercent}%
              </Text>
            ) : null}
            <Text className="text-md text-text-main" style={pretendard(700)}>
              {formatPrice(unitPrice)}
            </Text>
            <Text className="text-sm text-text-sub2" style={pretendard(400)}>
              |
            </Text>
            <Text className="text-sm text-text-sub2" style={pretendard(400)}>
              {item.quantity}개
            </Text>
          </View>
        </Pressable>
      </View>

      <Pressable
        onPress={() => void handleAddToCart()}
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
    </View>
  );
}
