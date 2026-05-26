import LogoGrey from "@/assets/icons/logo_grey.svg";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { StyleSheet, Text, View } from "react-native";

const LOGO_WIDTH = 62;
const LOGO_HEIGHT = 77;

export function MapShoppingSheetEmpty() {
  return (
    <View style={styles.container}>
      <LogoGrey width={LOGO_WIDTH} height={LOGO_HEIGHT} />
      <Text
        className="mt-lg text-lg text-text-sub2 text-center"
        style={pretendard(500)}
      >
        아직 담은 상품이 없어요.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.screen,
    minHeight: 0,
  },
});
