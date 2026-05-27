import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SettingsLogoutModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SettingsLogoutModal({
  visible,
  onCancel,
  onConfirm,
}: SettingsLogoutModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="닫기"
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            backgroundColor: COLORS.white,
            borderTopLeftRadius: RADIUS.lg,
            borderTopRightRadius: RADIUS.lg,
            paddingTop: 50,
            paddingHorizontal: SPACING.screen,
            paddingBottom: insets.bottom + SPACING.md,
            height: 180,
            justifyContent: "space-between",
          }}
        >
          <Text
            className="text-center text-lg text-text-main"
            style={pretendard(700)}
          >
            로그아웃 하시겠어요?
          </Text>

          <View className="flex-row" style={{ gap: SPACING.sm }}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="취소"
              style={{
                flex: 1,
                paddingVertical: SPACING.md,
                borderRadius: RADIUS.full,
                borderWidth: BORDER.base,
                borderColor: COLORS.text,
                backgroundColor: COLORS.white,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...pretendard(600),
                  fontSize: TYPOGRAPHY.size.lg,
                  color: COLORS.text,
                }}
              >
                취소
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              style={{
                flex: 1,
                paddingVertical: SPACING.md,
                borderRadius: RADIUS.full,
                backgroundColor: COLORS.text,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  ...pretendard(600),
                  fontSize: TYPOGRAPHY.size.lg,
                  color: COLORS.white,
                }}
              >
                로그아웃
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
