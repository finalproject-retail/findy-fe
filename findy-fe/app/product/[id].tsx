import { Header } from "@/components/common";
import { getProductById, MOCK_PRODUCTS } from "@/components/home/mockProducts";
import { SafeView } from "@/components/layout";
import {
  PRODUCT_DETAIL_CART_BAR_HEIGHT,
  ProductDetailCartBar,
  ProductDetailInfo,
} from "@/components/product";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, View, useWindowDimensions } from "react-native";

const PRODUCT_IMAGE_HEIGHT = 350;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width: screenWidth } = useWindowDimensions();
  const product = getProductById(id ?? "") ?? MOCK_PRODUCTS[0]!;

  return (
    <SafeView>
      <Header showBack rightIcons={["cart"]} />
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: PRODUCT_DETAIL_CART_BAR_HEIGHT }}
        >
          <Image
            source={product.image}
            style={{
              width: screenWidth,
              height: PRODUCT_IMAGE_HEIGHT,
            }}
            contentFit="cover"
          />
          <ProductDetailInfo product={product} />
        </ScrollView>
        <ProductDetailCartBar product={product} />
      </View>
    </SafeView>
  );
}
