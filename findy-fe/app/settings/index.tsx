import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import { useMypageProfile } from "@/components/mypage";
import {
  SettingsLogoutModal,
  SettingsNavRow,
  SettingsSectionHeader,
  SettingsToggleRow,
} from "@/components/settings";
import { COLORS, SPACING } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useSettingsPreferences } from "@/contexts/SettingsPreferencesContext";
import { TOAST_MESSAGES, useToast } from "@/contexts/ToastContext";
import { pretendard } from "@/utils/pretendard";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const { profile, loading, error, reload } = useMypageProfile();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const {
    notificationEnabled,
    locationEnabled,
    setNotificationEnabled,
    setLocationEnabled,
  } = useSettingsPreferences();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const handleNotificationChange = (next: boolean) => {
    setNotificationEnabled(next);
    showToast(
      next
        ? TOAST_MESSAGES.notificationConsentGranted
        : TOAST_MESSAGES.notificationConsentDeclined,
    );
  };

  const handleLocationChange = (next: boolean) => {
    setLocationEnabled(next);
    showToast(
      next
        ? TOAST_MESSAGES.locationConsentGranted
        : TOAST_MESSAGES.locationConsentDeclined,
    );
  };

  const handleLogoutConfirm = async () => {
    setLogoutVisible(false);
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <SafeView>
      <Header title="설정" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.screen,
          paddingBottom: SPACING.xl,
        }}
      >
        <View style={{ paddingTop: SPACING.lg, paddingBottom: SPACING.md }}>
          {loading && !profile ? (
            <ActivityIndicator size="small" color={COLORS.blueText} />
          ) : error && !profile ? (
            <View style={{ gap: SPACING.xs }}>
              <Text className="text-sm text-text-sub2" style={pretendard(400)}>
                {error}
              </Text>
              <Pressable
                onPress={() => void reload()}
                accessibilityRole="button"
                accessibilityLabel="다시 시도"
              >
                <Text
                  className="text-sm text-text-blue"
                  style={pretendard(600)}
                >
                  다시 시도
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text className="text-lg text-text-main" style={pretendard(700)}>
                {profile?.name ?? ""}
              </Text>
              <Text
                className="mt-1 text-sm text-text-sub2"
                style={pretendard(400)}
              >
                {profile?.email ?? ""}
              </Text>
            </>
          )}
        </View>

        <SettingsSectionHeader title="개인 정보" />
        <SettingsNavRow
          label="비밀번호 변경"
          onPress={() => router.push("/settings/change-password")}
        />

        <SettingsSectionHeader title="수신 동의" />
        <SettingsToggleRow
          label="알림 수신 동의"
          value={notificationEnabled}
          onValueChange={handleNotificationChange}
        />
        <SettingsToggleRow
          label="위치 수신 동의"
          value={locationEnabled}
          onValueChange={handleLocationChange}
        />

        <SettingsSectionHeader title="계정 관리" />
        <SettingsNavRow
          label="로그아웃"
          onPress={() => setLogoutVisible(true)}
        />
        <SettingsNavRow
          label="회원 탈퇴"
          onPress={() => router.push("/settings/withdraw")}
        />
      </ScrollView>

      <SettingsLogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogoutConfirm}
      />
    </SafeView>
  );
}
