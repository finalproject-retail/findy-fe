import type { ChatbotSpeechBridgeProps } from "@/hooks/useChatbotSpeechRecognition";
import { tryLoadSpeechRecognitionPackage } from "@/lib/chatbot/loadSpeechRecognition";
import { useEffect, useState, type ComponentType } from "react";

type NativeBridgeImpl = ComponentType<ChatbotSpeechBridgeProps>;

export function ChatbotSpeechNativeBridge(props: ChatbotSpeechBridgeProps) {
  const [Impl, setImpl] = useState<NativeBridgeImpl | null>(null);

  useEffect(() => {
    if (!tryLoadSpeechRecognitionPackage()) {
      return;
    }

    try {
      const module =
        require("./ChatbotSpeechNativeBridge.impl") as typeof import("./ChatbotSpeechNativeBridge.impl");
      setImpl(() => module.ChatbotSpeechNativeBridgeImpl);
    } catch (error) {
      if (__DEV__) {
        console.warn("[chatbot-speech] native bridge load failed", error);
      }
    }
  }, []);

  if (!Impl) {
    return null;
  }

  return <Impl {...props} />;
}
