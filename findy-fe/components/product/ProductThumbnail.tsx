import { TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { isOutOfStock } from "./isOutOfStock";
import type { Product } from "./types";

type ProductThumbnailProps = {
  product: Product;
  width: number;
  height?: number;
  borderRadius?: number;
};

export function ProductThumbnail({
  product,
  width,
  height,
  borderRadius = 3,
}: ProductThumbnailProps) {
  const resolvedHeight = height ?? width;
  const soldOut = isOutOfStock(product);

  return (
    <View style={{ width, height: resolvedHeight }}>
      <Image
        source={product.image}
        style={{
          width,
          height: resolvedHeight,
          borderRadius,
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
            borderRadius,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              ...pretendard(700),
              fontSize: TYPOGRAPHY.size.lg,
              color: "#FFFFFF",
            }}
          >
            품절
          </Text>
        </View>
      ) : null}
    </View>
  );
}
