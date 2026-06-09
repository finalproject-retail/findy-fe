import { useAuth } from "@/contexts/AuthContext";
import { COLORS } from "@/constants/theme";
import {
  useRootNavigationState,
  useRouter,
  useSegments,
  type Href,
} from "expo-router";
import { useEffect, type PropsWithChildren } from "react";
import { ActivityIndicator, View } from "react-native";

const LOGIN_HREF = "/(auth)/login" as Href;
const USER_HOME_HREF = "/(tabs)" as Href;
const ADMIN_HOME_HREF = "/(admin)" as Href;
const ONBOARDING_HREF = "/onboarding" as Href;

/**
 * 로그인 없이 보호된 화면 접근 시 로그인으로 이동.
 * 관리자 세션은 (admin), 일반 세션은 (tabs) 기준으로 분기.
 */
export function AuthGuard({ children }: PropsWithChildren) {
  const {
    isLoggedIn,
    isLoading,
    isProfileLoading,
    isAdminSession,
    isAdminUser,
    needsOnboarding,
  } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const isNavigationReady = Boolean(navigationState?.key);
  const root = segments[0];
  const isRouteReady = isNavigationReady && Boolean(root);
  const isAuthReady = !isLoading && !(isLoggedIn && isProfileLoading);
  const isAppReady = isRouteReady && isAuthReady;

  useEffect(() => {
    if (!isAppReady) {
      return;
    }

    const inAuthGroup = root === "(auth)";
    const inAdminGroup = root === "(admin)";
    const inUserTabs = root === "(tabs)";
    const inOnboarding = root === "onboarding";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace(LOGIN_HREF);
      return;
    }

    if (!isLoggedIn) {
      return;
    }

    if (!isAdminSession && needsOnboarding && !inOnboarding && !inAuthGroup) {
      router.replace(ONBOARDING_HREF);
      return;
    }

    if (inAdminGroup && !isAdminUser) {
      router.replace(USER_HOME_HREF);
      return;
    }

    if (isAdminSession && inUserTabs) {
      router.replace(ADMIN_HOME_HREF);
      return;
    }

    if (!isAdminSession && inAdminGroup) {
      router.replace(USER_HOME_HREF);
      return;
    }

    if (inAuthGroup) {
      if (isAdminSession) {
        router.replace(ADMIN_HOME_HREF);
        return;
      }

      router.replace(needsOnboarding ? ONBOARDING_HREF : USER_HOME_HREF);
    }
  }, [
    isAdminSession,
    isAdminUser,
    isAppReady,
    isLoggedIn,
    needsOnboarding,
    root,
    router,
  ]);

  if (!isAppReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.white,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.main} />
      </View>
    );
  }

  return children;
}
