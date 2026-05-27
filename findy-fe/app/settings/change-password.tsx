import { Header } from "@/components/common";
import { SquareButton } from "@/components/common/SquareButton";
import { SafeView } from "@/components/layout";
import { SettingsLabeledInput } from "@/components/settings";
import { SPACING } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleConfirm = () => {
    // TODO: 비밀번호 변경 API
    showToast(TOAST_MESSAGES.passwordChanged);
    router.back();
  };

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0;

  return (
    <SafeView>
      <Header title="비밀번호 변경" showBack />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: SPACING.screen,
            paddingTop: SPACING.lg,
            paddingBottom: SPACING.xl,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: SPACING.lg, flex: 1 }}>
            <SettingsLabeledInput
              label="현재 비밀번호"
              placeholder="현재 비밀번호를 입력해주세요"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <SettingsLabeledInput
              label="새 비밀번호"
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <SettingsLabeledInput
              label="새 비밀번호 확인"
              placeholder=""
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <SquareButton onPress={handleConfirm} disabled={!canSubmit}>
            확인
          </SquareButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}
