import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { AddToCartButton } from "./AddToCartButton";
import { ProductDiscountPriceRow } from "./ProductDiscountPriceRow";
import { isOutOfStock } from "./isOutOfStock";
import { ProductThumbnail } from "./ProductThumbnail";
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
  const soldOut = isOutOfStock(product);

  const openProductDetail = () => {
    router.push(`/product/${product.id}`);
  };

  return (
    <View className="flex-row items-stretch gap-3">
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
        <ProductThumbnail product={product} width={IMAGE_SIZE} />
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

            <ProductDiscountPriceRow product={product} size="md" />
          </View>
        </Pressable>

        {!soldOut ? (
          <AddToCartButton
            product={product}
            onPress={() => onAddToCart?.(product.id)}
          />
        ) : null}
      </View>
    </View>
  );
}
