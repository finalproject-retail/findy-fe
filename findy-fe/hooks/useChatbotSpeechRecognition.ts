import { isExpoGoApp } from "@/lib/chatbot/loadSpeechRecognition";
import { useCallback, useMemo, useRef, useState, type RefObject } from "react";
import { Alert, Platform } from "react-native";

export type UseChatbotSpeechRecognitionOptions = {
  onFinalTranscript: (text: string) => void;
  onVoiceRecordingComplete?: (uri: string) => void;
  onRecognitionEmpty?: () => void;
  onSpeechError?: (message: string) => void;
  enabled?: boolean;
};

export type ChatbotSpeechController = {
  toggleListening: () => Promise<void>;
  stopListening: () => void;
  isNativeAvailable: boolean;
};

export type ChatbotSpeechBridgeProps = {
  options: UseChatbotSpeechRecognitionOptions;
  controllerRef: RefObject<ChatbotSpeechController | null>;
  onListeningChange: (listening: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onInterimChange: (text: string) => void;
};

function showSpeechUnavailableAlert() {
  Alert.alert(
    "음성 인식 불가",
    Platform.OS === "web"
      ? "이 브라우저에서는 음성 인식을 지원하지 않습니다."
      : isExpoGoApp()
        ? "Expo Go에서는 음성 인식이 동작하지 않습니다.\n개발 빌드(Dev Client)로 실행해 주세요."
        : "현재 기기에서 음성 인식을 사용할 수 없습니다.\n텍스트로 질문해 주세요.",
  );
}

export function useChatbotSpeechRecognition(
  options: UseChatbotSpeechRecognitionOptions,
) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const controllerRef = useRef<ChatbotSpeechController | null>(null);

  const toggleListening = useCallback(async () => {
    if (controllerRef.current?.isNativeAvailable) {
      await controllerRef.current.toggleListening();
      return;
    }
    showSpeechUnavailableAlert();
  }, []);

  const stopListening = useCallback(() => {
    controllerRef.current?.stopListening();
  }, []);

  const bridgeProps = useMemo<ChatbotSpeechBridgeProps>(
    () => ({
      options,
      controllerRef,
      onListeningChange: setIsListening,
      onVolumeChange: setVolume,
      onInterimChange: setInterimTranscript,
    }),
    [options],
  );

  return {
    isListening,
    volume,
    interimTranscript,
    toggleListening,
    stopListening,
    bridgeProps,
  };
}
