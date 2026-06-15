import { Platform } from "react-native";

import { API_GATEWAY_PORT } from "./api";

const ANDROID_EMULATOR_HOST = "10.0.2.2";
const DEFAULT_USER_API_URL = `http://localhost:${API_GATEWAY_PORT}`;
const PUBLIC_API_URL = "https://api.insp1re12131.shop";

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

function isWebProductionOrigin() {
  return (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  );
}

function isPrivateNetworkUrl(url: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(
    url,
  );
}

/** user-service API base URL routed by ALB Ingress */
export function getUserApiBaseUrl() {
  const fromEnv =
    process.env.EXPO_PUBLIC_USER_API_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_URL?.trim();
  const url = fromEnv ? stripTrailingSlash(fromEnv) : DEFAULT_USER_API_URL;
  if (isWebProductionOrigin() && isPrivateNetworkUrl(url)) {
    return PUBLIC_API_URL;
  }
  return rewriteLocalhostForAndroid(url);
}
