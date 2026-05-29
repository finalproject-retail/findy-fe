import { CharcoalSquareButton } from "@/components/common/CharcoalSquareButton";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Modal, StyleSheet, Text, View } from "react-native";

type SignupSuccessModalProps = {
  visible: boolean;
  message: string;
  onConfirm: () => void;
};

export function SignupSuccessModal({
  visible,
  message,
  onConfirm,
}: SignupSuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.backdrop} pointerEvents="none" />

        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.messageBlock}>
            <Text style={styles.title}>회원가입 완료</Text>
            <Text style={styles.message}>{message}</Text>
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
    gap: SPACING.sm,
  },
  title: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.text,
    textAlign: "center",
  },
  message: {
    ...pretendard(400),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.subText,
    textAlign: "center",
    lineHeight: 22,
  },
});
