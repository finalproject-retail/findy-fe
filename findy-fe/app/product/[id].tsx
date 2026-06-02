import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import {
  PRODUCT_DETAIL_CART_BAR_HEIGHT,
  ProductDetailCartBar,
  ProductDetailInfo,
  isOutOfStock,
  useProductDetail,
} from "@/components/product";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const PRODUCT_IMAGE_HEIGHT = 350;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const { product, loading, error, reload } = useProductDetail(id);
  const soldOut = product ? isOutOfStock(product) : false;

  return (
    <SafeView>
      <Header showBack rightIcons={["cart"]} />
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={COLORS.blueText} />
          </View>
        ) : error || !product ? (
          <View
            className="flex-1 items-center justify-center px-screen"
            style={{ gap: SPACING.md }}
          >
            <Text
              className="text-center text-md text-text-sub"
              style={pretendard(400)}
            >
              {error ?? "상품 정보를 불러오지 못했습니다."}
            </Text>
            <Pressable
              onPress={() => void reload()}
              accessibilityRole="button"
              accessibilityLabel="다시 시도"
              style={{
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.sm,
                borderRadius: 8,
                backgroundColor: COLORS.charcoal,
              }}
            >
              <Text className="text-md text-white" style={pretendard(600)}>
                다시 시도
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: PRODUCT_DETAIL_CART_BAR_HEIGHT,
              }}
            >
              <View style={{ width: screenWidth, height: PRODUCT_IMAGE_HEIGHT }}>
                <Image
                  source={product.image}
                  style={{
                    width: screenWidth,
                    height: PRODUCT_IMAGE_HEIGHT,
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
                      backgroundColor: "rgba(0, 0, 0, 0.45)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text className="text-2xl text-white" style={pretendard(700)}>
                      품절
                    </Text>
                  </View>
                ) : null}
              </View>
              <ProductDetailInfo product={product} />
            </ScrollView>
            <ProductDetailCartBar product={product} />
          </>
        )}
      </View>
    </SafeView>
  );
}
