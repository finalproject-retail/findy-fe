import { COLORS, SPACING } from "@/constants/theme";
import { useProductDetailCoupons } from "@/hooks/useProductDetailCoupons";
import { pretendard } from "@/utils/pretendard";
import { Text, View, useWindowDimensions } from "react-native";
import { ProductDiscountPriceRow } from "../ProductDiscountPriceRow";
import { isOutOfStock } from "../isOutOfStock";
import { hasProductDiscount } from "../productPricing";
import { RemainingStockText } from "../RemainingStockText";
import type { Product } from "../types";
import { ProductDetailCouponButton } from "./ProductDetailCouponButton";
import { ProductDetailRecommend } from "./ProductDetailRecommend";
import { ProductDetailSpec } from "./ProductDetailSpec";

const RECOMMEND_CARD_GAP = 12;

type ProductDetailInfoProps = {
  product: Product;
};

export function ProductDetailInfo({ product }: ProductDetailInfoProps) {
  const { width: screenWidth } = useWindowDimensions();
  const recommendCardWidth =
    (screenWidth - SPACING.screen * 2 - RECOMMEND_CARD_GAP) / 3.1;

  const category = product.category ?? "카테고리";
  const couponPrice = product.couponPrice ?? product.price;
  const showDiscount = hasProductDiscount(product);
  const stockCount = product.stockCount;
  const soldOut = isOutOfStock(product);
  const {
    visible: showCouponButton,
    allDownloaded: allCouponsDownloaded,
    maxDiscountPercent,
    downloading: downloadingCoupons,
    downloadAll,
  } = useProductDetailCoupons(product);

  return (
    <View
      className="bg-white px-screen"
      style={{
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xl,
        gap: SPACING.md,
      }}
    >
      <Text className="text-sm text-text-sub" style={pretendard(400)}>
        {category}
      </Text>

      <Text className="text-xl text-text-main" style={pretendard(700)}>
        {product.name}
      </Text>

      <View style={{ gap: SPACING.xs }}>
        {showDiscount ? (
          <Text
            className="text-lg"
            style={{ ...pretendard(700), color: COLORS.redText }}
          >
            쿠폰 적용시
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between gap-2">
          <ProductDiscountPriceRow
            product={product}
            salePrice={couponPrice}
            size="xl"
            style={{ flexShrink: 1 }}
          />

          {stockCount != null && stockCount > 0 ? (
            <RemainingStockText stockCount={stockCount} className="shrink-0" />
          ) : null}
        </View>
      </View>

      {showCouponButton ? (
        <ProductDetailCouponButton
          maxDiscountPercent={maxDiscountPercent}
          allDownloaded={allCouponsDownloaded}
          downloading={downloadingCoupons}
          onDownload={() => void downloadAll()}
        />
      ) : null}

      <ProductDetailRecommend
        productId={product.id}
        cardWidth={recommendCardWidth}
        variant={soldOut ? "substitute" : "related"}
      />

      <ProductDetailSpec product={product} />
    </View>
  );
}
