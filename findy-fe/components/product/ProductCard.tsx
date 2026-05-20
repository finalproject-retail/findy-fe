import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice } from "./formatPrice";
import type { Product } from "./types";

const PRODUCT_NAME_HEIGHT = 40;
const PRODUCT_NAME_LINE_HEIGHT = 20;

type ProductCardProps = {
  product: Product;
  width: number;
  onAddToCart?: (productId: string) => void;
};

export function ProductCard({ product, width, onAddToCart }: ProductCardProps) {
  return (
    <View style={{ width }}>
      <Image
        source={product.image}
        style={{
          width,
          height: width,
          borderRadius: 3,
        }}
        contentFit="cover"
      />

      <View className="mt-2 gap-2">
        <Text
          className="text-sm text-text-main"
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
          <Text className="text-sm text-text-red" style={pretendard(700)}>
            {product.discountPercent}%
          </Text>
          <Text className="text-sm text-text-main" style={pretendard(700)}>
            {formatPrice(product.price)}
          </Text>
        </View>

        <AddToCartButton onPress={() => onAddToCart?.(product.id)} />
      </View>
    </View>
  );
}
