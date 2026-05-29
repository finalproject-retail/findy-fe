import { SPACING } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { MapShoppingCancelToast } from "./MapShoppingCancelToast";

type MapShoppingCancelToastOverlayProps = {
  message: string | null;
  /** 화면(시트) 하단에서 푸터 높이만큼 띄움 */
  bottomOffset: number;
};

/** 바텀시트 위에 얹는 취소 토스트 레이어 */
export function MapShoppingCancelToastOverlay({
  message,
  bottomOffset,
}: MapShoppingCancelToastOverlayProps) {
  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { bottom: bottomOffset + SPACING.sm }]}
    >
      <MapShoppingCancelToast message={message} />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 50,
    alignItems: "center",
  },
});
