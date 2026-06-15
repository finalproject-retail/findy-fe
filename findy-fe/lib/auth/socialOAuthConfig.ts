import * as Linking from "expo-linking";
import { Platform } from "react-native";
import type { SocialLoginProvider } from "@/lib/auth/api/socialLogin";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize";

const GOOGLE_SCOPES = ["openid", "email", "profile"];

function readOAuthClientId(provider: SocialLoginProvider): string | null {
  const value =
    provider === "google"
      ? process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID?.trim()
      : process.env.EXPO_PUBLIC_KAKAO_OAUTH_CLIENT_ID?.trim();
  return value || null;
}

function buildAppOAuthRedirectUri(provider: SocialLoginProvider): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}/oauth/${provider}/callback`;
  }

  return Linking.createURL(`oauth/${provider}/callback`);
}

/**
 * OAuth redirect URI — env 우선, 없으면 현재 앱 origin(Expo web) / 딥링크(native)
 * Google·Kakao 콘솔 + 백엔드 code 교환 시 동일 값 사용
 */
export function resolveSocialOAuthRedirectUri(
  provider: SocialLoginProvider,
): string {
  const fromEnv =
    provider === "google"
      ? process.env.EXPO_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI?.trim()
      : process.env.EXPO_PUBLIC_KAKAO_OAUTH_REDIRECT_URI?.trim();

  return (
    fromEnv ||
    process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI?.trim() ||
    buildAppOAuthRedirectUri(provider)
  );
}

export function assertSocialOAuthConfigured(provider: SocialLoginProvider) {
  if (!readOAuthClientId(provider)) {
    const label = provider === "google" ? "Google" : "카카오";
    throw new Error(
      `${label} 로그인 설정이 없습니다. EXPO_PUBLIC_${provider === "google" ? "GOOGLE" : "KAKAO"}_OAUTH_CLIENT_ID를 확인해 주세요.`,
    );
  }
}

export function buildSocialOAuthUrl(
  provider: SocialLoginProvider,
  redirectUri: string,
): string {
  const clientId = readOAuthClientId(provider);
  if (!clientId) {
    assertSocialOAuthConfigured(provider);
    throw new Error("OAuth client id is missing.");
  }

  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: GOOGLE_SCOPES.join(" "),
      prompt: "select_account",
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `${KAKAO_AUTH_URL}?${params.toString()}`;
}
