import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { PermissionsAndroid, Platform } from "react-native";

export type MicrophonePermissionResult = {
  granted: boolean;
  /** 시스템 설정 화면 안내가 필요한지 (다시 묻지 않음 등) */
  shouldOpenSettings: boolean;
};

const ANDROID_MIC_RATIONALE = {
  title: "마이크 권한",
  message: "음성으로 챗봇에 질문하려면 마이크 접근 권한이 필요합니다.",
  buttonPositive: "허용",
  buttonNegative: "거부",
} as const;

async function requestAndroidMicrophonePermission(): Promise<MicrophonePermissionResult> {
  const permission = PermissionsAndroid.PERMISSIONS.RECORD_AUDIO;

  try {
    const alreadyGranted = await PermissionsAndroid.check(permission);
    if (alreadyGranted) {
      return { granted: true, shouldOpenSettings: false };
    }

    const result = await PermissionsAndroid.request(permission, ANDROID_MIC_RATIONALE);

    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      return { granted: true, shouldOpenSettings: false };
    }

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return { granted: false, shouldOpenSettings: true };
    }

    return { granted: false, shouldOpenSettings: false };
  } catch (error) {
    if (__DEV__) {
      console.warn("[chatbot-speech] Android mic permission request failed", error);
    }
    return { granted: false, shouldOpenSettings: false };
  }
}

async function requestIosMicrophonePermission(): Promise<MicrophonePermissionResult> {
  const current = await ExpoSpeechRecognitionModule.getPermissionsAsync();
  if (current.granted) {
    return { granted: true, shouldOpenSettings: false };
  }

  const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
  return {
    granted: result.granted,
    shouldOpenSettings: !result.granted && !result.canAskAgain,
  };
}

/** 마이크 버튼 탭 시 — Android는 시스템 권한 팝업 우선 */
export async function ensureMicrophonePermission(): Promise<MicrophonePermissionResult> {
  if (Platform.OS === "android") {
    const androidResult = await requestAndroidMicrophonePermission();
    if (androidResult.granted) {
      return androidResult;
    }

    const expoResult =
      await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
    if (expoResult.granted) {
      return { granted: true, shouldOpenSettings: false };
    }

    return {
      granted: false,
      shouldOpenSettings:
        androidResult.shouldOpenSettings || !expoResult.canAskAgain,
    };
  }

  if (Platform.OS === "ios") {
    return requestIosMicrophonePermission();
  }

  const result = await ExpoSpeechRecognitionModule.requestMicrophonePermissionsAsync();
  return {
    granted: result.granted,
    shouldOpenSettings: !result.granted && !result.canAskAgain,
  };
}
