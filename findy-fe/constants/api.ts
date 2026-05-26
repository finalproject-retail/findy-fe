import { Platform } from "react-native";

export const API_GATEWAY_PORT = 8080;

const ANDROID_EMULATOR_HOST = "10.0.2.2";
const LOCALHOST = "localhost";

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function resolveDefaultBaseUrl(): string {
  if (Platform.OS === "android") {
    return `http://${ANDROID_EMULATOR_HOST}:${API_GATEWAY_PORT}`;
  }
  return `http://${LOCALHOST}:${API_GATEWAY_PORT}`;
}

/**
 * Android 에뮬에서 env가 localhost면 10.0.2.2로 치환
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  let url = fromEnv ? stripTrailingSlash(fromEnv) : resolveDefaultBaseUrl();

  if (
    Platform.OS === "android" &&
    /^https?:\/\/localhost(?=[:/]|$)/i.test(url)
  ) {
    url = url.replace(/\/\/localhost/i, `//${ANDROID_EMULATOR_HOST}`);
  }

  return url;
}

export const API_BASE_URL = getApiBaseUrl();

export const API_TIMEOUT_MS = 15_000;
