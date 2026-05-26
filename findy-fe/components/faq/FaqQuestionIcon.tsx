import { COLORS } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

const ICON_SIZE = 28;

export function FaqQuestionIcon() {
  return (
    <View
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: ICON_SIZE / 2,
        backgroundColor: COLORS.main,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          ...pretendard(700),
          fontSize: 16,
          color: COLORS.white,
          lineHeight: 18,
        }}
      >
        ?
      </Text>
    </View>
  );
}
