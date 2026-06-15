import { EmailVerificationSection } from "@/components/auth/EmailVerificationSection";
import { Button } from "@/components/common/Button";
import { Header } from "@/components/common/Header";
import { Input } from "@/components/common/Input";
import { useToast } from "@/contexts/ToastContext";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import {
  isMemberNotFoundError,
  postPasswordReset,
} from "@/lib/auth/api/emailVerification";
import { isValidSignupPassword } from "@/lib/auth/signupValidation";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "verify" | "reset";

export default function FindPasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>("verify");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    setPasswordError("");
    setConfirmPasswordError("");

    let isValid = true;
    if (!newPassword) {
      setPasswordError("* 8~16자리의 비밀번호를 입력해 주세요.");
      isValid = false;
    } else if (!isValidSignupPassword(newPassword)) {
      setPasswordError(
        "* 영문, 숫자, 특수문자를 포함한 8~16자리 비밀번호를 입력해 주세요.",
      );
      isValid = false;
    }
    if (!confirmPassword || newPassword !== confirmPassword) {
      setConfirmPasswordError("* 비밀번호가 일치하지 않습니다.");
      isValid = false;
    }
    if (!isValid || !emailVerified) {
      return;
    }

    setIsSubmitting(true);
    try {
      await postPasswordReset({
        email: email.trim(),
        newPassword,
        newPasswordConfirm: confirmPassword,
      });
      showToast("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.");
      router.replace("/(auth)/login" as Href);
    } catch (error) {
      setConfirmPasswordError(
        `* ${parseApiErrorMessage(error, "비밀번호 변경에 실패했습니다.")}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <Header
        title="비밀번호 찾기"
        showBack
        onBackPress={() => {
          if (step === "reset") {
            setStep("verify");
            return;
          }
          router.replace("/(auth)/login" as Href);
        }}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          {step === "verify" ? (
            <>
              <Text className="font-pretendard text-md font-regular text-text-sub mb-lg">
                가입하신 이메일로 인증 코드를 발송해 드립니다.{"\n"}이메일 인증
                후 비밀번호를 재설정할 수 있어요.
              </Text>

              <View className="mb-md">
                <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">
                  이메일
                </Text>
                <EmailVerificationSection
                  variant="passwordReset"
                  email={email}
                  onEmailChange={setEmail}
                  onVerifiedChange={setEmailVerified}
                  onSendError={(error) =>
                    setShowSignupPrompt(isMemberNotFoundError(error))
                  }
                  onSendSuccess={() => setShowSignupPrompt(false)}
                />
              </View>

              {showSignupPrompt ? (
                <View className="mb-md rounded-md bg-light-gray px-md py-md">
                  <Text className="font-pretendard text-sm font-regular text-text-main">
                    가입되지 않은 이메일이라면 회원가입 후 이용해 주세요.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.replace("/signup")}
                    className="mt-sm"
                  >
                    <Text className="font-pretendard text-sm font-bold text-main underline">
                      회원가입 하러가기
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View className="mt-xl">
                <Button
                  onPress={() => setStep("reset")}
                  disabled={!emailVerified}
                >
                  다음
                </Button>
              </View>
            </>
          ) : (
            <>
              <Text className="font-pretendard text-md font-regular text-text-sub mb-lg">
                {email.trim()} 계정의 새 비밀번호를 입력해 주세요.
              </Text>

              <View className="mb-md">
                <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">
                  새 비밀번호
                </Text>
                <Input
                  placeholder="영문, 숫자, 특수문자 포함 8자 이상"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={passwordError}
                />
              </View>

              <View className="mb-md">
                <Text className="font-pretendard text-sm font-bold text-text-main mb-[10px]">
                  새 비밀번호 확인
                </Text>
                <Input
                  placeholder=""
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={confirmPasswordError}
                />
              </View>

              <View className="mt-xl">
                <Button
                  onPress={() => void handleResetPassword()}
                  isLoading={isSubmitting}
                >
                  비밀번호 변경
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
