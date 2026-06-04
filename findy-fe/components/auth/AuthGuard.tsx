import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSegments, type Href } from "expo-router";
import { useEffect, type PropsWithChildren } from "react";

const LOGIN_HREF = "/(auth)/login" as Href;
const HOME_HREF = "/(tabs)" as Href;
const ONBOARDING_HREF = "/onboarding" as Href;

/**
 * 로그인 없이 보호된 화면 접근 시 로그인으로 이동.
 * 온보딩 미완료(isFirstLogin) 사용자는 온보딩으로 이동.
 */
export function AuthGuard({ children }: PropsWithChildren) {
  const { isLoggedIn, isLoading, isProfileLoading, needsOnboarding } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || (isLoggedIn && isProfileLoading)) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const onOnboarding = segments[0] === "onboarding";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace(LOGIN_HREF);
      return;
    }

    if (isLoggedIn && needsOnboarding && !onOnboarding && !inAuthGroup) {
      router.replace(ONBOARDING_HREF);
      return;
    }

    if (isLoggedIn && !needsOnboarding && onOnboarding) {
      router.replace(HOME_HREF);
      return;
    }

    if (isLoggedIn && inAuthGroup && !needsOnboarding) {
      router.replace(HOME_HREF);
    }
  }, [
    isLoading,
    isLoggedIn,
    isProfileLoading,
    needsOnboarding,
    router,
    segments,
  ]);

  return children;
}
