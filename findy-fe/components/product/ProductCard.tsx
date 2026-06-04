import { TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { AddToCartButton } from "./AddToCartButton";
import { ProductDiscountPriceRow } from "./ProductDiscountPriceRow";
import { isOutOfStock } from "./isOutOfStock";
import { ProductThumbnail } from "./ProductThumbnail";
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
  const soldOut = isOutOfStock(product);

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
        <ProductThumbnail product={product} width={width} />

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

          <ProductDiscountPriceRow product={product} size="md" />
        </View>
      </Pressable>

      {!soldOut ? (
        <View className="mt-2">
          <AddToCartButton
            product={product}
            onPress={() => onAddToCart?.(product.id)}
          />
        </View>
      ) : null}
    </View>
  );
}
