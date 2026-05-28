import { CharcoalSquareButton } from "@/components/common/CharcoalSquareButton";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { Modal, StyleSheet, Text, View } from "react-native";

/** present.svg(66×85) — SVG 안에 PNG가 박혀 있어 RN에서는 png로 표시 */
const PRESENT_IMAGE = require("@/assets/icons/present.png");
const PRESENT_WIDTH = 84;
const PRESENT_HEIGHT = Math.round((PRESENT_WIDTH * 85) / 66);
const CARD_MAX_WIDTH = 300;

type BarcodePointRewardModalProps = {
  visible: boolean;
  points: number;
  onConfirm: () => void;
};

export function BarcodePointRewardModal({
  visible,
  points,
  onConfirm,
}: BarcodePointRewardModalProps) {
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
          <Image
            source={PRESENT_IMAGE}
            style={styles.presentImage}
            contentFit="contain"
            accessibilityLabel="선물 상자"
          />

          <Text style={styles.rewardTitle}>+{points}P 당첨!</Text>

          <View style={styles.messageBlock}>
            <Text style={styles.messageLine}>방금 찍은 바코드에</Text>
            <Text style={styles.messageLine}>
              랜덤 혜택이 숨어 있었네요!
            </Text>
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
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    gap: SPACING.sm,
    zIndex: 1,
  },
  presentImage: {
    width: PRESENT_WIDTH,
    height: PRESENT_HEIGHT,
  },
  rewardTitle: {
    ...pretendard(700),
    fontSize: 24,
    color: COLORS.main,
    textAlign: "center",
    lineHeight: 30,
  },
  messageBlock: {
    alignItems: "center",
    gap: 2,
    paddingBottom: SPACING.xs,
  },
  messageLine: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 22,
  },
});
