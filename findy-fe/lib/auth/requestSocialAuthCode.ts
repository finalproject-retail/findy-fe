import type { SocialLoginProvider } from "@/lib/auth/api/socialLogin";
import {
  assertSocialOAuthConfigured,
  buildSocialOAuthUrl,
  resolveSocialOAuthRedirectUri,
} from "@/lib/auth/socialOAuthConfig";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

function parseAuthCodeFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const queryCode = parsed.searchParams.get("code");
    if (queryCode) {
      return queryCode;
    }

    const hash = parsed.hash.startsWith("#")
      ? parsed.hash.slice(1)
      : parsed.hash;
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      return hashParams.get("code");
    }
  } catch {
    const match = url.match(/[?&#]code=([^&]+)/);
    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}

function parseOAuthErrorFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const error = parsed.searchParams.get("error");
    const description = parsed.searchParams.get("error_description");
    if (error || description) {
      return decodeURIComponent(description ?? error ?? "").replace(/\+/g, " ");
    }
  } catch {
    if (url.includes("redirect_uri_mismatch")) {
      return "redirect_uri_mismatch";
    }
  }
  return null;
}

export async function requestSocialAuthCode(
  provider: SocialLoginProvider,
): Promise<{ code: string; redirectUri: string }> {
  assertSocialOAuthConfigured(provider);

  const redirectUri = resolveSocialOAuthRedirectUri(provider);
  const authUrl = buildSocialOAuthUrl(provider, redirectUri);

  if (__DEV__) {
    console.info(`[social-oauth/${provider}] redirect_uri=${redirectUri}`);
  }

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new Error("소셜 로그인이 취소되었습니다.");
  }

  if (result.type !== "success" || !result.url) {
    throw new Error("소셜 로그인 인가에 실패했습니다.");
  }

  const oauthError = parseOAuthErrorFromUrl(result.url);
  if (oauthError) {
    if (oauthError.includes("redirect_uri_mismatch")) {
      throw new Error(
        `Google redirect URI 불일치입니다. Google Cloud Console에 아래 URI를 등록해 주세요.\n${redirectUri}`,
      );
    }
    throw new Error(oauthError);
  }

  const code = parseAuthCodeFromUrl(result.url);
  if (!code) {
    throw new Error("소셜 로그인 인가 코드를 받지 못했습니다.");
  }

  return { code, redirectUri };
}
