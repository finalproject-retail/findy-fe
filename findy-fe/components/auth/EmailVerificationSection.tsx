import { Input } from "@/components/common/Input";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import {
  postEmailVerificationCode,
  postEmailVerificationCodeVerify,
  postPasswordResetVerificationCode,
  postPasswordResetVerificationCodeVerify,
} from "@/lib/auth/api/emailVerification";
import { isValidSignupEmail } from "@/lib/auth/signupValidation";
import { pretendard } from "@/utils/pretendard";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from "react-native";

export type EmailVerificationVariant = "signup" | "passwordReset";

type EmailVerificationSectionProps = {
  variant: EmailVerificationVariant;
  email: string;
  onEmailChange: (email: string) => void;
  emailEditable?: boolean;
  /** 인증 완료 여부 (이메일 변경 시 false) */
  onVerifiedChange: (verified: boolean) => void;
  /** 코드 발송 실패 시 (비밀번호 찾기에서 미가입 안내용) */
  onSendError?: (error: unknown) => void;
  onSendSuccess?: () => void;
};

const actionButtonStyle: ViewStyle = {
  height: 52,
  minWidth: 92,
  paddingHorizontal: SPACING.md,
  borderRadius: RADIUS.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.charcoal,
};

function ActionButton({
  label,
  onPress,
  disabled,
  loading,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const isDisabled = Boolean(disabled) || Boolean(loading);
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[actionButtonStyle, isDisabled ? { opacity: 0.55 } : null]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text
          style={{
            ...pretendard(600),
            fontSize: TYPOGRAPHY.size.sm,
            color: COLORS.white,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function EmailVerificationSection({
  variant,
  email,
  onEmailChange,
  emailEditable = true,
  onVerifiedChange,
  onSendError,
  onSendSuccess,
}: EmailVerificationSectionProps) {
  const { signOut } = useAuth();
  const [codeSent, setCodeSent] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const resetVerification = () => {
    setCodeSent(false);
    setCodeInput("");
    setVerified(false);
    setErrorMessage("");
    setInfoMessage("");
    onVerifiedChange(false);
  };

  const handleEmailChange = (next: string) => {
    onEmailChange(next);
    if (codeSent || verified) {
      resetVerification();
    }
  };

  const handleSendCode = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage("이메일을 입력해 주세요.");
      return;
    }
    if (!isValidSignupEmail(trimmed)) {
      setErrorMessage("올바른 이메일 형식으로 입력해 주세요.");
      return;
    }

    setSending(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      if (variant === "signup") {
        await signOut();
        await postEmailVerificationCode(trimmed, "SIGN_UP");
      } else {
        await postPasswordResetVerificationCode(trimmed);
      }
      setCodeSent(true);
      setCodeInput("");
      setVerified(false);
      onVerifiedChange(false);
      setInfoMessage("입력하신 이메일로 인증 코드를 발송했습니다.");
      onSendSuccess?.();
    } catch (error) {
      setErrorMessage(
        parseApiErrorMessage(error, "인증 코드 발송에 실패했습니다."),
      );
      onSendError?.(error);
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    const trimmedEmail = email.trim();
    const input = codeInput.trim();
    if (!input) {
      setErrorMessage("인증 코드를 입력해 주세요.");
      return;
    }

    setVerifying(true);
    setErrorMessage("");
    try {
      const result =
        variant === "signup"
          ? await postEmailVerificationCodeVerify(
              trimmedEmail,
              "SIGN_UP",
              input,
            )
          : await postPasswordResetVerificationCodeVerify(trimmedEmail, input);

      if (!result.verified) {
        setErrorMessage("인증 코드가 일치하지 않습니다.");
        return;
      }

      setVerified(true);
      setInfoMessage("이메일 인증이 완료되었습니다.");
      onVerifiedChange(true);
    } catch (error) {
      setErrorMessage(
        parseApiErrorMessage(error, "인증 코드 확인에 실패했습니다."),
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={{ gap: SPACING.sm }}>
      <View
        style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Input
            placeholder="xxxxxxx@gmail.com"
            value={email}
            onChangeText={handleEmailChange}
            editable={emailEditable && !verified}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>
        <ActionButton
          label={codeSent ? "재발송" : "인증요청"}
          onPress={() => void handleSendCode()}
          disabled={verified}
          loading={sending}
        />
      </View>

      {codeSent && !verified ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: SPACING.sm,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Input
              placeholder="인증 코드 입력"
              value={codeInput}
              onChangeText={setCodeInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <ActionButton
            label="확인"
            onPress={() => void handleVerifyCode()}
            loading={verifying}
          />
        </View>
      ) : null}

      {errorMessage ? (
        <Text
          style={{
            ...pretendard(400),
            fontSize: TYPOGRAPHY.size.xs,
            color: COLORS.redText,
          }}
        >
          * {errorMessage}
        </Text>
      ) : infoMessage ? (
        <Text
          style={{
            ...pretendard(400),
            fontSize: TYPOGRAPHY.size.xs,
            color: verified ? COLORS.blueText : COLORS.subText,
          }}
        >
          {infoMessage}
        </Text>
      ) : null}
    </View>
  );
}
