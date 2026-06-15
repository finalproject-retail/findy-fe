import { EmailVerificationSection } from "@/components/auth/EmailVerificationSection";
import { Header } from "@/components/common";
import { SquareButton } from "@/components/common/SquareButton";
import { SafeView } from "@/components/layout";
import { SettingsLabeledInput } from "@/components/settings";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { fetchMyProfile } from "@/lib/auth/api/fetchMyProfile";
import { postPasswordReset } from "@/lib/auth/api/emailVerification";
import { isValidSignupPassword } from "@/lib/auth/signupValidation";
import { pretendard } from "@/utils/pretendard";
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

type Step = "verify" | "reset";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("verify");
  const [email, setEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchMyProfile()
      .then((profile) => {
        if (!cancelled && profile.email) {
          setEmail(profile.email);
          setEmailLocked(true);
        }
      })
      .catch(() => {
        // 프로필 조회 실패 시 이메일 직접 입력
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const goToSettings = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/settings" as Href);
  };

  const handleConfirm = async () => {
    setErrorMessage("");

    if (!newPassword || !isValidSignupPassword(newPassword)) {
      setErrorMessage(
        "* 영문, 숫자, 특수문자를 포함한 8~16자리 비밀번호를 입력해 주세요.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("* 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!emailVerified) {
      setErrorMessage("* 이메일 인증을 완료해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await postPasswordReset({
        email: email.trim(),
        newPassword,
        newPasswordConfirm: confirmPassword,
      });
      showToast(TOAST_MESSAGES.passwordChanged);
      goToSettings();
    } catch (error) {
      setErrorMessage(
        `* ${parseApiErrorMessage(error, "비밀번호 변경에 실패했습니다.")}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    emailVerified &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    !isSubmitting;

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
          {step === "verify" ? (
            <>
              <View style={{ gap: SPACING.lg, flex: 1 }}>
                <Text
                  style={{
                    ...pretendard(400),
                    fontSize: TYPOGRAPHY.size.md,
                    color: COLORS.subText,
                    lineHeight: 22,
                  }}
                >
                  비밀번호 변경을 위해 이메일 인증이 필요합니다.
                </Text>
                <View style={{ gap: SPACING.sm }}>
                  <Text
                    style={{
                      ...pretendard(700),
                      fontSize: TYPOGRAPHY.size.sm,
                      color: COLORS.text,
                    }}
                  >
                    이메일
                  </Text>
                  <EmailVerificationSection
                    variant="passwordReset"
                    email={email}
                    onEmailChange={setEmail}
                    emailEditable={!emailLocked}
                    onVerifiedChange={setEmailVerified}
                  />
                </View>
              </View>

              <SquareButton
                onPress={() => setStep("reset")}
                disabled={!emailVerified}
              >
                다음
              </SquareButton>
            </>
          ) : (
            <>
              <View style={{ gap: SPACING.lg, flex: 1 }}>
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
                {errorMessage ? (
                  <Text
                    style={{
                      ...pretendard(400),
                      fontSize: TYPOGRAPHY.size.xs,
                      color: COLORS.redText,
                    }}
                  >
                    {errorMessage}
                  </Text>
                ) : null}
              </View>

              <SquareButton
                onPress={() => void handleConfirm()}
                disabled={!canSubmit}
                isLoading={isSubmitting}
              >
                확인
              </SquareButton>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}
