import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useState } from "react";
import {
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

type LoginTab = "general" | "admin";

const SOCIAL_BUTTON_SIZE = 56;
/** 시안 탭 테두리 두께 (px) */
const TAB_BORDER_WIDTH = 2;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: 160,
    paddingBottom: 36,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 52,
  },
  brandLogo: {
    width: 80,
    height: 80,
    marginBottom: -10,
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
  /** 활성: 상·좌·우 핑크 테두리, 하단 없음, 상단 모서리만 둥글게 */
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
  /** 비활성: 하단 핑크 라인만 */
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
    marginBottom: 32,
  },
  loginActions: {
    width: "100%",
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
  },
  socialButtonImage: {
    width: SOCIAL_BUTTON_SIZE,
    height: SOCIAL_BUTTON_SIZE,
  },
});

export default function LoginScreen() {
  const [tab, setTab] = useState<LoginTab>("general");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [idError, setIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
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
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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

          <View style={styles.fieldsBlock}>
            <Input
              placeholder="ID"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              autoCorrect={false}
              error={idError}
            />
            <View style={styles.fieldGap} />
            <Input
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
            />
          </View>

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
                  <Image
                    source={require("@/assets/icons/google_logo.svg")}
                    style={styles.socialButtonImage}
                    resizeMode="contain"
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
                  <Image
                    source={require("@/assets/icons/kakao_logo.svg")}
                    style={styles.socialButtonImage}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>

              <View style={styles.linksRow}>
                <Pressable accessibilityRole="button">
                  <Text style={styles.linkText}>비밀번호 찾기</Text>
                </Pressable>
                <Text style={styles.linkSep}>|</Text>
                <Pressable accessibilityRole="button">
                  <Text style={styles.linkText}>회원가입</Text>
                </Pressable>
              </View>
            </>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}