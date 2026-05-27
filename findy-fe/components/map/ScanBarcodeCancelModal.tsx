import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

/** barcode-3d.svg(95×95) — RN에서는 png로 표시 */
const BARCODE_IMAGE = require("@/assets/icons/barcode.png");
const BARCODE_SIZE = 72;
const CARD_MAX_WIDTH = 272;

type ScanBarcodeCancelModalProps = {
  visible: boolean;
  productName: string;
  quantity: number;
  onBarcodeScanned: () => void;
  onDismiss: () => void;
};

export function ScanBarcodeCancelModal({
  visible,
  productName,
  quantity,
  onBarcodeScanned,
  onDismiss,
}: ScanBarcodeCancelModalProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - SPACING.screen * 2, CARD_MAX_WIDTH);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.backdrop} pointerEvents="none" />

        <View
          style={[
            styles.dialogHost,
            {
              width: cardWidth,
              maxWidth: "100%",
            },
          ]}
        >
          <View style={styles.card} accessibilityViewIsModal>
            <View style={styles.section}>
              <Text style={styles.messageLine}>취소할 상품의 바코드를</Text>
              <Text style={styles.messageLine}>스캔해 주세요.</Text>
            </View>

            <Pressable
              onPress={onBarcodeScanned}
              onLongPress={onBarcodeScanned}
              delayLongPress={400}
              accessibilityRole="button"
              accessibilityLabel="바코드 스캔"
              style={styles.barcodeTap}
            >
              <Image
                source={BARCODE_IMAGE}
                style={styles.barcodeImage}
                contentFit="contain"
              />
            </Pressable>

            <Text style={styles.productLine} numberOfLines={2}>
              취소상품: {productName} X {quantity}개
            </Text>

            <Text style={styles.hint}>
              * 바코드를 찍으면 해당 팝업은 자동으로 사라져요.
            </Text>

            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="취소하지 않기"
              style={({ pressed }) => [
                styles.dismissPressableOuter,
                pressed ? styles.dismissPressablePressed : null,
              ]}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            >
              <View style={styles.dismissButtonSurface} collapsable={false}>
                <Text style={styles.dismissButtonLabel} numberOfLines={2}>
                  취소하고 싶지 않아요 🥹
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.screen,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  dialogHost: {
    zIndex: 1,
    alignSelf: "center",
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    alignItems: "stretch",
  },
  section: {
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  messageLine: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 22,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  barcodeTap: {
    alignSelf: "center",
    marginBottom: SPACING.sm,
  },
  barcodeImage: {
    width: BARCODE_SIZE,
    height: BARCODE_SIZE,
  },
  productLine: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  hint: {
    ...pretendard(400),
    fontSize: 11,
    color: COLORS.subText,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  /** Pressable 배경은 Android Modal에서 안 그려질 수 있어, 배경은 자식 View에 둠 */
  dismissPressableOuter: {
    alignSelf: "stretch",
  },
  dismissPressablePressed: {
    opacity: 0.92,
  },
  dismissButtonSurface: {
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: "#202020",
    paddingHorizontal: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  dismissButtonLabel: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.sm,
    color: "#FFFFFF",
    textAlign: "center",
    width: "100%",
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
});
