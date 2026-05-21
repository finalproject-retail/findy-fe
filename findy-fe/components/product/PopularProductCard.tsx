import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  const router = useRouter();

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <View className="flex-row items-stretch gap-3">
      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
        className="w-6 self-start"
      >
        <Text className="text-2xl text-text-main" style={pretendard(700)}>
          {rank}
        </Text>
      </Pressable>

      <Pressable
        onPress={openProductDetail}
        accessibilityRole="button"
        accessibilityLabel={`${product.name} 상세 보기`}
        className="self-stretch"
      >
        <View
          className="flex-1 overflow-hidden rounded-[3px]"
          style={{ width: IMAGE_WIDTH, minHeight: IMAGE_WIDTH }}
        >
          <Image
            source={product.image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </View>
      </Pressable>

      <View
        className="flex-1 justify-between gap-2"
        style={contentMinHeight ? { minHeight: contentMinHeight } : undefined}
        onLayout={(event) =>
          onContentLayout?.(event.nativeEvent.layout.height)
        }
      >
        <Pressable
          onPress={openProductDetail}
          accessibilityRole="button"
          accessibilityLabel={`${product.name} 상세 보기`}
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
        </Pressable>

        <AddToCartButton onPress={() => onAddToCart?.(product.id)} />
      </View>
    </View>
  );
}
