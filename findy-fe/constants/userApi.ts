import { Platform } from "react-native";

const ANDROID_EMULATOR_HOST = "10.0.2.2";
const DEFAULT_USER_API_URL = "http://192.168.0.32:8889";

/** 웹 개발 서버(Metro) 프록시 경로 — CORS 우회 */
export const USER_API_WEB_PROXY_PREFIX = "/user-api";

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function rewriteLocalhostForAndroid(url: string) {
  if (Platform.OS !== "android") {
    return url;
  }
  return url
    .replace(/\/\/localhost(?=[:/]|$)/i, `//${ANDROID_EMULATOR_HOST}`)
    .replace(/\/\/127\.0\.0\.1(?=[:/]|$)/i, `//${ANDROID_EMULATOR_HOST}`);
}

function resolveDirectUserApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_USER_API_URL?.trim();
  const url = fromEnv ? stripTrailingSlash(fromEnv) : DEFAULT_USER_API_URL;
  return rewriteLocalhostForAndroid(url);
}

/**
 * user-service base URL
 * - 네이티브/Expo Go: EXPO_PUBLIC_USER_API_URL 직접 호출
 * - 웹 개발: Metro 프록시(/user-api)로 same-origin 요청 (CORS 없음)
 */
export function getUserApiBaseUrl() {
  if (Platform.OS === "web" && __DEV__) {
    return USER_API_WEB_PROXY_PREFIX;
  }
  return resolveDirectUserApiUrl();
}
