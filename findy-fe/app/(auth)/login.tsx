import { Button } from "@/components/common/Button";
import { Form } from "@/components/common/Form";
import { Input } from "@/components/common/Input";
import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api/client";
import { postLogin } from "@/lib/auth/api/login";
import { postSocialLogin, type SocialLoginProvider } from "@/lib/auth/api/socialLogin";
import { finishLoginFromResponse } from "@/lib/auth/finishLoginFromResponse";
import { requestSocialAuthCode } from "@/lib/auth/requestSocialAuthCode";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleLogo from "@/assets/icons/google_logo.svg";
import KakaoLogo from "@/assets/icons/kakao_logo.svg";

type LoginTab = "general" | "admin";

const SOCIAL_BUTTON_SIZE = 56;
const TAB_BORDER_WIDTH = 2;
const LOGIN_WEB_MAX_WIDTH = 400;
const isWeb = Platform.OS === "web";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  kav: {
    flex: 1,
  },
  kavWeb: {
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.screen,
    paddingVertical: 32,
  },
  scrollContentWeb: {
    width: "100%",
    maxWidth: LOGIN_WEB_MAX_WIDTH,
    alignSelf: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  brandLogo: {
    width: 64,
    height: 64,
    marginBottom: -6,
  },
  logoText: {
    fontFamily: TYPOGRAPHY.family,
    fontSize: 22,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  tabRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 34,
    alignItems: "flex-end",
  },
  tabPress: {
    flex: 1,
  },
  tabActiveShell: {
    width: "100%",
    borderTopWidth: TAB_BORDER_WIDTH,
    borderLeftWidth: TAB_BORDER_WIDTH,
    borderRightWidth: TAB_BORDER_WIDTH,
    borderBottomWidth: 0,
    borderColor: COLORS.main,
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 46,
    justifyContent: "center",
    zIndex: 1,
  },
  tabInactiveShell: {
    width: "100%",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: TAB_BORDER_WIDTH,
    borderBottomColor: COLORS.main,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 46,
    justifyContent: "center",
  },
  tabLabel: {
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
    textAlign: "center",
  },
  fieldsBlock: {
    width: "100%",
  },
  loginActions: {
    width: "100%",
    marginTop: 32,
  },
  fieldGap: {
    height: 20,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 32,
    marginBottom: 26,
  },
  orLine: {
    flex: 1,
    height: BORDER.base,
    backgroundColor: COLORS.lightGray,
  },
  orText: {
    marginHorizontal: 16,
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.regular,
    color: COLORS.subText2,
  },
  linksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    columnGap: 14,
  },
  linkText: {
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.regular,
    color: COLORS.subText,
  },
  linkSep: {
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.subText2,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 28,
  },
  socialButton: {
    width: SOCIAL_BUTTON_SIZE,
    height: SOCIAL_BUTTON_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { name: signupName } = useLocalSearchParams<{ name?: string }>();
  const { signIn, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<LoginTab>("general");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] =
    useState<SocialLoginProvider | null>(null);

  const handleLogin = async () => {
    setIdError("");
    setPasswordError("");
    let valid = true;
    if (!id.trim()) {
      setIdError("ID를 입력해 주세요.");
      valid = false;
    }
    if (!password) {
      setPasswordError("비밀번호를 입력해 주세요.");
      valid = false;
    }
    if (!valid) return;

    setIsLoading(true);
    try {
      await signOut();
      const loginBody = await postLogin(id.trim(), password);
      await finishLoginFromResponse({
        loginBody,
        tab,
        signupName: typeof signupName === "string" ? signupName : undefined,
        idFallback: id.trim(),
        signIn,
        refreshProfile,
        showToast,
        router,
      });
    } catch (error: unknown) {
      Alert.alert("에러", getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialLoginProvider) => {
    if (tab !== "general" || isLoading || socialLoadingProvider) {
      return;
    }

    setSocialLoadingProvider(provider);
    try {
      await signOut();
      const { code, redirectUri } = await requestSocialAuthCode(provider);
      const loginBody = await postSocialLogin(provider, { code, redirectUri });
      await finishLoginFromResponse({
        loginBody,
        tab: "general",
        signupName: typeof signupName === "string" ? signupName : undefined,
        signIn,
        refreshProfile,
        showToast,
        router,
      });
    } catch (error: unknown) {
      Alert.alert("에러", getApiErrorMessage(error));
    } finally {
      setSocialLoadingProvider(null);
    }
  };

  const isSocialBusy = socialLoadingProvider != null;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={[styles.kav, isWeb && styles.kavWeb]}
        behavior={isWeb ? undefined : Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && styles.scrollContentWeb,
          ]}
        >
          <View style={styles.logoSection}>
            <Image
              source={require("@/assets/images/splash-logo.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.tabRow}>
            <Pressable
              onPress={() => setTab("general")}
              style={styles.tabPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === "general" }}
            >
              <View
                style={
                  tab === "general"
                    ? styles.tabActiveShell
                    : styles.tabInactiveShell
                }
              >
                <Text style={styles.tabLabel}>일반 로그인</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setTab("admin")}
              style={styles.tabPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === "admin" }}
            >
              <View
                style={
                  tab === "admin"
                    ? styles.tabActiveShell
                    : styles.tabInactiveShell
                }
              >
                <Text style={styles.tabLabel}>관리자 로그인</Text>
              </View>
            </Pressable>
          </View>

          <Form onSubmit={handleLogin} style={styles.fieldsBlock}>
            <Input
              placeholder="ID"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              error={idError}
            />
            <View style={styles.fieldGap} />
            <Input
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={handleLogin}
              returnKeyType="go"
              error={passwordError}
            />

            <View style={styles.loginActions}>
              <Button onPress={handleLogin} isLoading={isLoading} disabled={isSocialBusy}>
                로그인
              </Button>

              {tab === "general" && (
                <>
                  <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>or</Text>
                    <View style={styles.orLine} />
                  </View>

                  <View style={styles.socialRow}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.socialButton,
                        (pressed || isSocialBusy) && { opacity: 0.85 },
                      ]}
                      disabled={isLoading || isSocialBusy}
                      onPress={() => void handleSocialLogin("google")}
                      accessibilityRole="button"
                      accessibilityLabel="Google로 계속하기"
                    >
                      <GoogleLogo
                        width={SOCIAL_BUTTON_SIZE}
                        height={SOCIAL_BUTTON_SIZE}
                      />
                    </Pressable>

                    <Pressable
                      style={({ pressed }) => [
                        styles.socialButton,
                        (pressed || isSocialBusy) && { opacity: 0.85 },
                      ]}
                      disabled={isLoading || isSocialBusy}
                      onPress={() => void handleSocialLogin("kakao")}
                      accessibilityRole="button"
                      accessibilityLabel="카카오로 계속하기"
                    >
                      <KakaoLogo
                        width={SOCIAL_BUTTON_SIZE}
                        height={SOCIAL_BUTTON_SIZE}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.linksRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/find-password")}
                    >
                      <Text style={styles.linkText}>비밀번호 찾기</Text>
                    </Pressable>
                    <Text style={styles.linkSep}>|</Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => router.push("/signup")}
                    >
                      <Text style={styles.linkText}>회원가입</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </Form>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
