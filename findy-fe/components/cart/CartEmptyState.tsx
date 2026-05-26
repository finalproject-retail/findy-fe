import LogoGrey from "@/assets/icons/logo_grey.svg";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

const LOGO_WIDTH = 62;
const LOGO_HEIGHT = 77;

export function CartEmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-screen">
      <LogoGrey width={LOGO_WIDTH} height={LOGO_HEIGHT} />
      <Text
        className="mt-lg text-lg text-text-sub2 text-center"
        style={pretendard(500)}
      >
        장바구니에 담긴 상품이 없습니다
      </Text>
    </View>
  );
}
