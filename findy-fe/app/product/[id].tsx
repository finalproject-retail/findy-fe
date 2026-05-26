import { Header } from "@/components/common";
import { MOCK_PRODUCTS, getProductById } from "@/components/home/mockProducts";
import { SafeView } from "@/components/layout";
import {
  PRODUCT_DETAIL_CART_BAR_HEIGHT,
  ProductDetailCartBar,
  ProductDetailInfo,
  isOutOfStock,
} from "@/components/product";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";

const PRODUCT_IMAGE_HEIGHT = 350;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const product = getProductById(id ?? "") ?? MOCK_PRODUCTS[0]!;
  const soldOut = isOutOfStock(product);

  return (
    <SafeView>
      <Header showBack rightIcons={["cart"]} />
      <View className="flex-1">
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
      </View>
    </SafeView>
  );
}
