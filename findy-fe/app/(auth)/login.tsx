import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";

/** 카카오 브랜드 가이드 옐로 (theme 외부 고정색) */
const KAKAO_YELLOW = "#FEE500";

type LoginTab = "general" | "admin";

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
    paddingTop: 44,
    paddingBottom: 36,
  },
  logoSection: {
    alignItems: "center",
    paddingTop: 18,
    marginBottom: 42,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  logoText: {
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text,
  },
  tabRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 34,
    paddingHorizontal: 2,
  },
  tabPress: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  /** 활성 탭: 시안처럼 핑크 테두리 박스만 */
  tabActiveShell: {
    borderWidth: BORDER.base,
    borderColor: COLORS.main,
    borderRadius: RADIUS.md,
    paddingVertical: 11,
    paddingHorizontal: 20,
    backgroundColor: COLORS.white,
  },
  /** 비활성 탭: 하단 핑크 라인만 (좌우 상단 테두리 없음) */
  tabInactiveShell: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.main,
    paddingBottom: 11,
    paddingTop: 12,
    paddingHorizontal: 6,
    backgroundColor: COLORS.white,
  },
  tabLabel: {
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text,
    textAlign: "center",
  },
  fieldsBlock: {
    width: "100%",
    marginBottom: 4,
  },
  fieldGap: {
    height: 20,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
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
    marginTop: 22,
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
    marginTop: 58,
    paddingBottom: 28,
    columnGap: 28,
  },
  socialGoogle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    borderWidth: BORDER.thin,
    borderColor: COLORS.gray,
    alignItems: "center",
    justifyContent: "center",
  },
  socialKakao: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: KAKAO_YELLOW,
    alignItems: "center",
    justifyContent: "center",
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
            <View style={styles.logoRow}>
              <Ionicons name="pin" size={32} color={COLORS.main} />
              <Text style={styles.logoText}>Findy</Text>
            </View>
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

          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <Button onPress={handleLogin} isLoading={isLoading}>
            로그인
          </Button>

          <View style={styles.linksRow}>
            <Pressable accessibilityRole="button">
              <Text style={styles.linkText}>회원가입</Text>
            </Pressable>
            <Text style={styles.linkSep}>|</Text>
            <Pressable accessibilityRole="button">
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </Pressable>
          </View>

          <View style={styles.socialRow}>
            <Pressable
              style={styles.socialGoogle}
              accessibilityRole="button"
              accessibilityLabel="Google로 계속하기"
            />
            <Pressable
              style={styles.socialKakao}
              accessibilityRole="button"
              accessibilityLabel="카카오로 계속하기"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
