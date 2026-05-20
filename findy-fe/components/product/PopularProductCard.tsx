import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice } from "./formatPrice";
import type { Product } from "./types";

const IMAGE_SIZE = 100;

type PopularProductCardProps = {
  product: Product;
  rank: number;
  onAddToCart?: (productId: string) => void;
};

export function PopularProductCard({
  product,
  rank,
  onAddToCart,
}: PopularProductCardProps) {
  return (
    <View className="flex-row items-start gap-3">
      <Text className="w-6 text-2xl text-text-main" style={pretendard(700)}>
        {rank}
      </Text>

      <Image
        source={product.image}
        style={{
          width: IMAGE_SIZE,
          height: IMAGE_SIZE,
          borderRadius: 3,
        }}
        contentFit="cover"
      />

      <View className="min-h-[100px] flex-1 justify-between gap-2">
        <View className="gap-1.5">
          <Text
            className="text-sm text-text-main"
            numberOfLines={2}
            style={pretendard(500)}
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
        </View>

        <AddToCartButton onPress={() => onAddToCart?.(product.id)} />
      </View>
    </View>
  );
}
