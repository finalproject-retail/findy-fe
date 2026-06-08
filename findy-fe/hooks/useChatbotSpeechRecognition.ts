import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

type UseChatbotSpeechRecognitionOptions = {
  onFinalTranscript: (text: string) => void;
  onVoiceRecordingComplete?: (uri: string) => void;
  onRecognitionEmpty?: () => void;
  onSpeechError?: (message: string) => void;
  enabled?: boolean;
};

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

export function useChatbotSpeechRecognition({
  onFinalTranscript,
  onVoiceRecordingComplete,
  onRecognitionEmpty,
  onSpeechError,
  enabled = true,
}: UseChatbotSpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
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
    setIsListening(true);
  });

  useSpeechRecognitionEvent("audioend", (event) => {
    if (event.uri) {
      audioUriRef.current = event.uri;
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setVolume(0);

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
    setInterimTranscript("");
  });

  useSpeechRecognitionEvent("volumechange", (event) => {
    setVolume(event.value);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = joinTranscriptResults(event.results);
    latestTranscriptRef.current = text;
    setInterimTranscript(text);
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);
    setVolume(0);
    setInterimTranscript("");
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
      const inExpoGo = Constants.appOwnership === "expo";
      Alert.alert(
        "음성 인식 불가",
        Platform.OS === "web"
          ? "이 브라우저에서는 음성 인식을 지원하지 않습니다."
          : inExpoGo
            ? "Expo Go에서는 음성 인식이 동작하지 않습니다.\n개발 빌드(Dev Client)로 실행해 주세요."
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
    setInterimTranscript("");
    setVolume(0);

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
  }, [enabled]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      return;
    }
    if (!enabled) {
      return;
    }
    await startListening();
  }, [enabled, isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  return {
    isListening,
    volume,
    interimTranscript,
    toggleListening,
    stopListening,
  };
}
