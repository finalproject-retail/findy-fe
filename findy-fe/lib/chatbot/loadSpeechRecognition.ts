import Constants from "expo-constants";

export type SpeechRecognitionPackage = typeof import("expo-speech-recognition");

export function isExpoGoApp(): boolean {
  return Constants.appOwnership === "expo";
}

/** Expo Go 등 네이티브 모듈이 없을 때 require 자체를 건너뜀 */
export function tryLoadSpeechRecognitionPackage(): SpeechRecognitionPackage | null {
  if (isExpoGoApp()) {
    return null;
  }

  try {
    return require("expo-speech-recognition") as SpeechRecognitionPackage;
  } catch {
    return null;
  }
}
