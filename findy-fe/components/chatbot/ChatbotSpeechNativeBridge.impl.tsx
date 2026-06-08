import type { ChatbotSpeechBridgeProps } from "@/hooks/useChatbotSpeechRecognition";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { Alert, Platform } from "react-native";

function joinTranscriptResults(
  results: Array<{ transcript?: string }> | undefined,
): string {
  if (!results?.length) {
    return "";
  }
  return results
    .map((result) => result.transcript ?? "")
    .join("")
    .trim();
}

export function ChatbotSpeechNativeBridgeImpl({
  options,
  controllerRef,
  onListeningChange,
  onVolumeChange,
  onInterimChange,
}: ChatbotSpeechBridgeProps) {
  const {
    enabled = true,
    onFinalTranscript,
    onVoiceRecordingComplete,
    onRecognitionEmpty,
    onSpeechError,
  } = options;

  const isListeningRef = useRef(false);
  const latestTranscriptRef = useRef("");
  const audioUriRef = useRef<string | null>(null);

  const onFinalTranscriptRef = useRef(onFinalTranscript);
  onFinalTranscriptRef.current = onFinalTranscript;
  const onVoiceRecordingCompleteRef = useRef(onVoiceRecordingComplete);
  onVoiceRecordingCompleteRef.current = onVoiceRecordingComplete;
  const onRecognitionEmptyRef = useRef(onRecognitionEmpty);
  onRecognitionEmptyRef.current = onRecognitionEmpty;
  const onSpeechErrorRef = useRef(onSpeechError);
  onSpeechErrorRef.current = onSpeechError;

  useSpeechRecognitionEvent("start", () => {
    isListeningRef.current = true;
    onListeningChange(true);
  });

  useSpeechRecognitionEvent("audioend", (event) => {
    if (event.uri) {
      audioUriRef.current = event.uri;
    }
  });

  useSpeechRecognitionEvent("end", () => {
    isListeningRef.current = false;
    onListeningChange(false);
    onVolumeChange(0);

    const uri = audioUriRef.current;
    const text = latestTranscriptRef.current.trim();

    if (text) {
      onFinalTranscriptRef.current(text);
    } else if (uri && onVoiceRecordingCompleteRef.current) {
      onVoiceRecordingCompleteRef.current(uri);
    } else {
      onRecognitionEmptyRef.current?.();
    }

    audioUriRef.current = null;
    latestTranscriptRef.current = "";
    onInterimChange("");
  });

  useSpeechRecognitionEvent("volumechange", (event) => {
    onVolumeChange(event.value);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = joinTranscriptResults(event.results);
    latestTranscriptRef.current = text;
    onInterimChange(text);
  });

  useSpeechRecognitionEvent("error", (event) => {
    isListeningRef.current = false;
    onListeningChange(false);
    onVolumeChange(0);
    onInterimChange("");
    latestTranscriptRef.current = "";
    audioUriRef.current = null;

    if (event.error === "aborted") {
      return;
    }

    if (event.error === "no-speech") {
      onRecognitionEmptyRef.current?.();
      return;
    }

    const message =
      event.message?.trim() ||
      (event.error === "not-allowed"
        ? "마이크 권한을 허용해 주세요."
        : "음성 인식에 실패했습니다. 다시 시도해 주세요.");

    onSpeechErrorRef.current?.(message);

    if (__DEV__) {
      console.warn("[chatbot-speech]", event.error, event.message);
    }
  });

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  const startListening = useCallback(async () => {
    if (!enabled) {
      return;
    }

    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      Alert.alert(
        "음성 인식 불가",
        Platform.OS === "web"
          ? "이 브라우저에서는 음성 인식을 지원하지 않습니다."
          : "현재 기기에서 음성 인식을 사용할 수 없습니다.",
      );
      return;
    }

    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "마이크 권한 필요",
        "음성 입력을 사용하려면 마이크와 음성 인식 권한을 허용해 주세요.",
      );
      return;
    }

    latestTranscriptRef.current = "";
    audioUriRef.current = null;
    onInterimChange("");
    onVolumeChange(0);

    ExpoSpeechRecognitionModule.start({
      lang: "ko-KR",
      interimResults: true,
      continuous: false,
      volumeChangeEventOptions: {
        enabled: true,
        intervalMillis: 80,
      },
      recordingOptions: {
        persist:
          Platform.OS !== "web" &&
          Boolean(onVoiceRecordingCompleteRef.current),
        outputFileName: "chatbot-recording.wav",
      },
    });
  }, [enabled, onInterimChange, onVolumeChange]);

  const toggleListening = useCallback(async () => {
    if (isListeningRef.current) {
      stopListening();
      return;
    }
    if (!enabled) {
      return;
    }
    await startListening();
  }, [enabled, startListening, stopListening]);

  useImperativeHandle(
    controllerRef,
    () => ({
      toggleListening,
      stopListening,
      isNativeAvailable: true,
    }),
    [stopListening, toggleListening],
  );

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  return null;
}
