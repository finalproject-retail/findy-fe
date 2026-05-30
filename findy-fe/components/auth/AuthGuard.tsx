import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSegments, type Href } from "expo-router";
import { useEffect, type PropsWithChildren } from "react";

const LOGIN_HREF = "/(auth)/login" as Href;
const HOME_HREF = "/(tabs)" as Href;

/**
 * 로그인 없이 보호된 화면 접근 시 로그인으로 이동.
 * 로그인 상태에서 (auth) 접근 시 홈으로 이동.
 */
export function AuthGuard({ children }: PropsWithChildren) {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace(LOGIN_HREF);
      return;
    }

    if (isLoggedIn && inAuthGroup) {
      router.replace(HOME_HREF);
    }
  }, [isLoading, isLoggedIn, router, segments]);

  return children;
}
