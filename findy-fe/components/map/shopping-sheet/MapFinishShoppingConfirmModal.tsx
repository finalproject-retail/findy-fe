import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";

type MapFinishShoppingConfirmModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function MapFinishShoppingConfirmModal({
  visible,
  onCancel,
  onConfirm,
}: MapFinishShoppingConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        />

        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title}>
            아직 바코드를 찍지 않은{"\n"}상품이 있어요!
          </Text>
          <Text style={styles.message}>그래도 완료하시겠어요?</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="확인"
              style={[styles.actionPressable, styles.actionPressableLeft]}
              android_ripple={{ color: "rgba(0,0,0,0.06)" }}
            >
              <View style={[styles.actionSurface, styles.confirmSurface]}>
                <Text style={styles.confirmLabel}>확인</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="취소"
              style={styles.actionPressable}
              android_ripple={{ color: "rgba(255,255,255,0.18)" }}
            >
              <View style={[styles.actionSurface, styles.cancelSurface]}>
                <Text style={styles.cancelLabel}>취소</Text>
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
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    width: "92%",
    maxWidth: 520,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    alignItems: "stretch",
    alignSelf: "center",
  },
  title: {
    ...pretendard(700),
    fontSize: 18,
    color: "#E53935",
    textAlign: "center",
    alignSelf: "center",
    lineHeight: 24,
    marginBottom: SPACING.md,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  message: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
    textAlign: "center",
    alignSelf: "center",
    lineHeight: 24,
    marginBottom: SPACING.lg,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  actions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
  },
  actionPressable: {
    flex: 1,
    minWidth: 0,
  },
  actionPressableLeft: {
    marginRight: SPACING.md,
  },
  actionSurface: {
    height: 52,
    width: "100%",
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
  },
  confirmSurface: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#888888",
  },
  cancelSurface: {
    backgroundColor: COLORS.charcoal,
  },
  confirmLabel: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.md,
    color: "#9E9E9E",
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  cancelLabel: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.white,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
});

