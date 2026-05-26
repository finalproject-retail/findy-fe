import { TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice } from "./formatPrice";
import type { Product } from "./types";

const PRODUCT_NAME_LINE_HEIGHT = 20;
/** 카드 높이 맞춤용 — 고정 height는 네이티브에서 2줄+ellipsis 버그 유발 */
const PRODUCT_NAME_MIN_HEIGHT = PRODUCT_NAME_LINE_HEIGHT * 2;

type ProductCardProps = {
  product: Product;
  width: number;
  onAddToCart?: (productId: string) => void;
};

export function ProductCard({ product, width, onAddToCart }: ProductCardProps) {
  const router = useRouter();

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <View style={{ width, flexShrink: 0 }}>
      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
        style={{ width }}
      >
        <Image
          source={product.image}
          style={{
            width,
            height: width,
            borderRadius: 3,
          }}
          contentFit="cover"
        />

        <View className="mt-2 gap-2" style={{ width }}>
          <View style={{ width, minHeight: PRODUCT_NAME_MIN_HEIGHT }}>
            <Text
              className="text-text-main"
              numberOfLines={2}
              style={{
                width,
                ...pretendard(500),
                fontSize: TYPOGRAPHY.size.sm,
                lineHeight: PRODUCT_NAME_LINE_HEIGHT,
              }}
            >
              {product.name}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Text className="text-md text-text-red" style={pretendard(700)}>
              {product.discountPercent}%
            </Text>
            <Text className="text-md text-text-main" style={pretendard(700)}>
              {formatPrice(product.price)}
            </Text>
          </View>
        </View>
      </Pressable>

      <View className="mt-2">
        <AddToCartButton
          product={product}
          onPress={() => onAddToCart?.(product.id)}
        />
      </View>
    </View>
  );
}
