import { Platform } from "react-native";

import { API_GATEWAY_PORT } from "./api";

const ANDROID_EMULATOR_HOST = "10.0.2.2";
const DEFAULT_USER_API_URL = `http://localhost:${API_GATEWAY_PORT}`;

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

/** user-service API base URL routed by ALB Ingress */
export function getUserApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  const url = fromEnv ? stripTrailingSlash(fromEnv) : DEFAULT_USER_API_URL;
  return rewriteLocalhostForAndroid(url);
}
