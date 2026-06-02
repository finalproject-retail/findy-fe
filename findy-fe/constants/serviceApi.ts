import { Platform } from "react-native";

const ANDROID_EMULATOR_HOST = "10.0.2.2";

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

function resolveServiceUrl(envValue: string | undefined, fallbackPort: number) {
  const fromEnv = envValue?.trim() || process.env.EXPO_PUBLIC_API_URL?.trim();
  const url = fromEnv
    ? stripTrailingSlash(fromEnv)
    : `http://localhost:${fallbackPort}`;
  return rewriteLocalhostForAndroid(url);
}

/** shopping-service (상품) */
export const SHOPPING_API_URL = resolveServiceUrl(
  process.env.EXPO_PUBLIC_SHOPPING_API_URL,
  8887,
);

/** recommendation-service (개인 맞춤 추천) */
export const RECOMMENDATION_API_URL = resolveServiceUrl(
  process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL,
  8886,
);

/** 웹 개발 서버(Metro) 프록시 — CORS 우회 */
export const SHOPPING_API_WEB_PROXY_PREFIX = "/shopping-api";
export const RECOMMENDATION_API_WEB_PROXY_PREFIX = "/recommendation-api";

/** shopping-service base URL (웹 개발 시 Metro 프록시) */
export function getShoppingApiBaseUrl() {
  return SHOPPING_API_URL;
}

/** recommendation-service base URL (웹 개발 시 Metro 프록시) */
export function getRecommendationApiBaseUrl() {
  return RECOMMENDATION_API_URL;
}
