import { Button } from "@/components/common/Button";
import { Form } from "@/components/common/Form";
import { Input } from "@/components/common/Input";
import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api/client";
import { extractAccessToken, postLogin } from "@/lib/auth/api/login";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: 130,
    paddingBottom: 36,
  },
  contentWeb: {
    width: "100%",
    maxWidth: LOGIN_WEB_MAX_WIDTH,
    paddingTop: 100,
    alignSelf: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 52,
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
    paddingBottom: 28,
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
  const { name: signupName } = useLocalSearchParams<{ name?: string }>();
  const { signIn, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<LoginTab>("general");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const accessToken = extractAccessToken(loginBody);

      if (!accessToken) {
        throw new Error(
          loginBody?.message ?? "로그인 성공했지만 토큰을 받지 못했습니다.",
        );
      }

      await signIn(accessToken, { asAdmin: tab === "admin" });

      if (tab === "admin") {
        router.replace("/(admin)" as Href);
        return;
      }

      const profile = await refreshProfile();

      if (profile.isFirstLogin) {
        router.replace({
          pathname: "/onboarding",
          params: {
            email: profile.email,
            name:
              profile.name ||
              (typeof signupName === "string" ? signupName : ""),
          },
        } as unknown as Href);
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: unknown) {
      Alert.alert("에러", getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={[styles.kav, isWeb && styles.kavWeb]}
        behavior={isWeb ? undefined : Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={[styles.content, isWeb && styles.contentWeb]}>
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
              <Button onPress={handleLogin} isLoading={isLoading}>
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
                        pressed && { opacity: 0.85 },
                      ]}
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
                        pressed && { opacity: 0.85 },
                      ]}
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
                    <Pressable accessibilityRole="button">
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
