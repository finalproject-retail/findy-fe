import { TOAST_MESSAGES } from "@/contexts/ToastContext";
import { setAccessToken } from "@/lib/api/client";
import {
  extractAccessToken,
  extractLoginData,
  type LoginResponse,
} from "@/lib/auth/api/login";
import { isAdminRole } from "@/lib/auth/roles";
import type { UserProfile } from "@/lib/auth/types";
import type { Href, Router } from "expo-router";

export type LoginTab = "general" | "admin";

type FinishLoginParams = {
  loginBody: LoginResponse;
  tab: LoginTab;
  signupName?: string;
  idFallback?: string;
  signIn: (
    token: string,
    options?: { asAdmin?: boolean; isFirstLogin?: boolean },
  ) => Promise<void>;
  refreshProfile: () => Promise<UserProfile>;
  showToast: (message: string) => void;
  router: Router;
};

export async function finishLoginFromResponse({
  loginBody,
  tab,
  signupName,
  idFallback = "",
  signIn,
  refreshProfile,
  showToast,
  router,
}: FinishLoginParams): Promise<void> {
  const loginData = extractLoginData(loginBody);
  const accessToken = extractAccessToken(loginBody);

  if (!accessToken) {
    throw new Error(
      loginBody?.message ?? "로그인 성공했지만 토큰을 받지 못했습니다.",
    );
  }

  setAccessToken(accessToken);
  const profile = await refreshProfile();
  const needsOnboarding = profile.isFirstLogin;
  const isAdmin = isAdminRole(profile.role);

  if (tab === "admin" && !isAdmin) {
    setAccessToken(null);
    showToast(TOAST_MESSAGES.loginUseGeneralTab);
    return;
  }

  if (tab === "general" && isAdmin) {
    setAccessToken(null);
    showToast(TOAST_MESSAGES.loginUseAdminTab);
    return;
  }

  await signIn(accessToken, {
    asAdmin: tab === "admin",
    isFirstLogin: tab === "admin" ? false : needsOnboarding,
  });

  if (tab === "admin") {
    router.replace("/(admin)" as Href);
    return;
  }

  if (needsOnboarding) {
    router.replace({
      pathname: "/onboarding",
      params: {
        email: loginData?.email ?? idFallback,
        name: loginData?.name ?? signupName ?? "",
      },
    } as unknown as Href);
    return;
  }

  router.replace("/(tabs)");
}
