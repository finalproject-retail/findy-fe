import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
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
  const router = useRouter();

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <View className="flex-row items-stretch` gap-3">
      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
        className="w-6"
      >
        <Text className="text-2xl text-text-main" style={pretendard(700)}>
          {rank}
        </Text>
      </Pressable>

      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
      >
        <Image
          source={product.image}
          style={{
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            borderRadius: 3,
          }}
          contentFit="cover"
        />
      </Pressable>

      <View className="min-w-0 flex-1 justify-between gap-2">
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
        >
          <View className="gap-1.5">
            <Text
              className="text-sm text-text-main"
              numberOfLines={2}
              style={pretendard(500)}
            >
              {product.name}
            </Text>

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

        <AddToCartButton onPress={() => onAddToCart?.(product.id)} />
      </View>
    </View>
  );
}
