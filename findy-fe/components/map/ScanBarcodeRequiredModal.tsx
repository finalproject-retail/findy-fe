import { CharcoalSquareButton } from "@/components/common/CharcoalSquareButton";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Modal, StyleSheet, Text, View } from "react-native";

type ScanBarcodeRequiredModalProps = {
  visible: boolean;
  onConfirm: () => void;
};

export function ScanBarcodeRequiredModal({
  visible,
  onConfirm,
}: ScanBarcodeRequiredModalProps) {
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

        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.messageBlock}>
            <Text style={styles.messageLine}>구매하실 상품의</Text>
            <Text style={styles.messageLine}>바코드를 먼저 스캔해 주세요.</Text>
          </View>

          <CharcoalSquareButton onPress={onConfirm} accessibilityLabel="확인">
            확인
          </CharcoalSquareButton>
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
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingTop: SPACING.xl + SPACING.sm,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xl,
    zIndex: 1,
  },
  messageBlock: {
    alignItems: "center",
    gap: SPACING.xs,
  },
  messageLine: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 26,
  },
});
