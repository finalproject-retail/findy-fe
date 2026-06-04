import { Platform } from "react-native";

import { API_GATEWAY_PORT } from "./api";

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

function resolveServiceUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  const url = fromEnv
    ? stripTrailingSlash(fromEnv)
    : `http://localhost:${API_GATEWAY_PORT}`;
  return rewriteLocalhostForAndroid(url);
}

function resolveRecommendationUrl() {
  const dedicated = process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL?.trim();
  if (dedicated) {
    return rewriteLocalhostForAndroid(stripTrailingSlash(dedicated));
  }
  return resolveServiceUrl();
}

export const SHOPPING_API_URL = resolveServiceUrl();
export const RECOMMENDATION_API_URL = resolveRecommendationUrl();

export function getShoppingApiBaseUrl() {
  return SHOPPING_API_URL;
}

export function getRecommendationApiBaseUrl() {
  return RECOMMENDATION_API_URL;
}
