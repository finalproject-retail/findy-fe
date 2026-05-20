import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { AddToCartButton } from "./AddToCartButton";
import { formatPrice } from "./formatPrice";
import type { Product } from "./types";

const IMAGE_WIDTH = 100;

type PopularProductCardProps = {
  product: Product;
  rank: number;
  contentMinHeight?: number;
  onContentLayout?: (height: number) => void;
  onAddToCart?: (productId: string) => void;
};

export function PopularProductCard({
  product,
  rank,
  contentMinHeight,
  onContentLayout,
  onAddToCart,
}: PopularProductCardProps) {
  return (
    <View className="flex-row items-stretch gap-3">
      <Text
        className="w-6 self-start text-2xl text-text-main"
        style={pretendard(700)}
      >
        {rank}
      </Text>

      <View
        className="overflow-hidden rounded-[3px]"
        style={{ width: IMAGE_WIDTH, minHeight: IMAGE_WIDTH }}
      >
        <Image
          source={product.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      </View>

      <View
        className="flex-1 justify-between gap-2"
        style={contentMinHeight ? { minHeight: contentMinHeight } : undefined}
        onLayout={(event) =>
          onContentLayout?.(event.nativeEvent.layout.height)
        }
      >
        <View className="gap-1.5">
          <Text
            className="text-lg text-text-main"
            numberOfLines={2}
            style={pretendard(500)}
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
        </View>

        <AddToCartButton onPress={() => onAddToCart?.(product.id)} />
      </View>
    </View>
  );
}
