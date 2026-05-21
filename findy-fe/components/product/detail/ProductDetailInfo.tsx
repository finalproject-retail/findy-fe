import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View, useWindowDimensions } from "react-native";
import { formatPrice } from "../formatPrice";
import type { Product } from "../types";
import { ProductDetailCouponButton } from "./ProductDetailCouponButton";
import { ProductDetailRecommend } from "./ProductDetailRecommend";
import { ProductDetailSpec } from "./ProductDetailSpec";

const RECOMMEND_CARD_GAP = 12;

type ProductDetailInfoProps = {
  product: Product;
  onCouponPress?: () => void;
};

export function ProductDetailInfo({
  product,
  onCouponPress,
}: ProductDetailInfoProps) {
  const { width: screenWidth } = useWindowDimensions();
  const recommendCardWidth =
    (screenWidth - SPACING.screen * 2 - RECOMMEND_CARD_GAP) / 2.7;

  const category = product.category ?? "카테고리";
  const couponPrice = product.couponPrice ?? product.price;
  const originalPrice =
    product.originalPrice ??
    Math.round(couponPrice / (1 - product.discountPercent / 100));
  const stockCount = product.stockCount ?? 0;

  return (
    <View
      className="bg-white px-screen"
      style={{
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xl,
        gap: SPACING.md,
      }}
    >
      <Text className="text-md text-text-sub" style={pretendard(400)}>
        {category} &gt;
      </Text>

      <Text className="text-2xl text-text-main" style={pretendard(700)}>
        {product.name}
      </Text>

      <View style={{ gap: SPACING.xs }}>
        <Text
          className="text-xl"
          style={{ ...pretendard(700), color: COLORS.redText }}
        >
          쿠폰 적용시
        </Text>

        <View className="flex-row items-center justify-between gap-2">
          <View className="shrink flex-row flex-wrap items-center gap-1">
            <Text
              className="text-2xl"
              style={{ ...pretendard(700), color: COLORS.redText }}
            >
              {product.discountPercent}%
            </Text>
            <Text className="text-2xl text-text-main" style={pretendard(700)}>
              {formatPrice(couponPrice)}
            </Text>
            <Text
              className="text-lg text-text-sub"
              style={{
                ...pretendard(400),
                textDecorationLine: "line-through",
              }}
            >
              {formatPrice(originalPrice)}
            </Text>
          </View>

          <Text
            className="shrink-0 text-lg text-text-blue"
            style={{
              ...pretendard(500),
              textDecorationLine: "underline",
            }}
          >
            남은 재고 {stockCount}개
          </Text>
        </View>
      </View>

      {product.availableCoupons ? (
        <ProductDetailCouponButton
          availableCoupons={product.availableCoupons}
          onCouponPress={onCouponPress}
        />
      ) : null}

      <ProductDetailRecommend
        productId={product.id}
        cardWidth={recommendCardWidth}
      />

      <ProductDetailSpec product={product} />
    </View>
  );
}
