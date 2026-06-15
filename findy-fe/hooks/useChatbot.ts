import { useAuth } from "@/contexts/AuthContext";
import {
  postChatbotMessage,
  postChatbotVoiceMessage,
} from "@/lib/chatbot/api/chatbot";
import {
  enrichChatbotProductRecommendation,
  enrichChatbotRecipeRecommendation,
} from "@/lib/chatbot/enrichChatbotProductImages";
import {
  CHATBOT_DEFAULT_LIMIT,
  CHATBOT_WELCOME_MESSAGES,
  type ChatMessage,
} from "@/lib/chatbot/types";
import { useCallback, useEffect, useState } from "react";

function isWelcomeOnlyMessages(messages: ChatMessage[]): boolean {
  return messages.every((message) =>
    CHATBOT_WELCOME_MESSAGES.some((welcome) => welcome.id === message.id),
  );
}

function isValidCachedMessages(messages: ChatMessage[]): boolean {
  if (isWelcomeOnlyMessages(messages)) {
    return true;
  }

  return !messages.some((message) => {
    if (message.sender === "user") {
      return message.text.trim().length === 0;
    }
    return (
      message.text.trim().length === 0 &&
      !message.recipeRecommendation &&
      !message.productRecommendation
    );
  });
}

/** 챗봇 화면을 나갔다 들어와도 채팅 내역 유지 (채팅 종료하기 전까지, 앱 세션 내) */
let chatbotSessionCache: {
  sessionId: number | null;
  messages: ChatMessage[];
} | null = null;

export function useChatbot(storeId: number) {
  const { isLoggedIn, isLoading: authLoading, accessToken } = useAuth();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(CHATBOT_WELCOME_MESSAGES);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isLoggedIn || !accessToken) {
      chatbotSessionCache = null;
      setSessionId(null);
      setMessages(CHATBOT_WELCOME_MESSAGES);
      setError(
        !isLoggedIn
          ? null
          : "로그인 정보가 만료되었습니다. 다시 로그인해 주세요.",
      );
      setLoading(false);
      return;
    }

    // 같은 앱 세션 안에서 재진입 시 이전 대화 복원
    if (
      chatbotSessionCache &&
      isValidCachedMessages(chatbotSessionCache.messages)
    ) {
      setSessionId(chatbotSessionCache.sessionId);
      setMessages(chatbotSessionCache.messages);
      setError(null);
      setLoading(false);
      return;
    }

    chatbotSessionCache = null;

    setSessionId(null);
    setMessages(CHATBOT_WELCOME_MESSAGES);
    setError(null);
    setLoading(false);
  }, [accessToken, authLoading, isLoggedIn]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (loading || !isLoggedIn) {
      return;
    }
    chatbotSessionCache = { sessionId, messages };
  }, [isLoggedIn, loading, messages, sessionId]);

  /** 채팅 종료하기 — 내역 비우고 새 대화 (서버 세션 자동 복원 없음) */
  const endChat = useCallback(() => {
    chatbotSessionCache = {
      sessionId: null,
      messages: CHATBOT_WELCOME_MESSAGES,
    };
    setSessionId(null);
    setMessages(CHATBOT_WELCOME_MESSAGES);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) {
        return;
      }
      if (!isLoggedIn || !accessToken) {
        throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
      }

      const pendingId = `pending-user-${Date.now()}`;
      setSending(true);
      setError(null);
      setMessages((current) => [
        ...current,
        { id: pendingId, sender: "user", text: trimmed },
      ]);

      try {
        const response = await postChatbotMessage({
          message: trimmed,
          sessionId,
          storeId,
          limit: CHATBOT_DEFAULT_LIMIT,
        });
        const [recipeRecommendation, productRecommendation] = await Promise.all([
          enrichChatbotRecipeRecommendation(
            response.recipeRecommendation ?? undefined,
          ),
          enrichChatbotProductRecommendation(
            response.productRecommendation ?? undefined,
          ),
        ]);
        setSessionId(response.sessionId);
        setMessages((current) => [
          ...current.filter((item) => item.id !== pendingId),
          {
            id: `user-${response.sessionId}-${Date.now()}`,
            sender: "user",
            text: trimmed,
          },
          {
            id: `bot-${response.sessionId}-${Date.now() + 1}`,
            sender: "bot",
            text: response.answer,
            recipeRecommendation,
            productRecommendation,
          },
        ]);
      } catch (err) {
        setMessages((current) =>
          current.filter((item) => item.id !== pendingId),
        );
        setError(
          err instanceof Error
            ? err.message
            : "챗봇 메시지 전송에 실패했습니다.",
        );
        throw err;
      } finally {
        setSending(false);
      }
    },
    [accessToken, isLoggedIn, sending, sessionId, storeId],
  );

  const sendVoiceMessage = useCallback(
    async (fileUri: string) => {
      if (!fileUri || sending) {
        return;
      }
      if (!isLoggedIn || !accessToken) {
        throw new Error("로그인이 필요합니다. 다시 로그인해 주세요.");
      }

      const pendingId = `pending-voice-${Date.now()}`;
      setSending(true);
      setError(null);
      setMessages((current) => [
        ...current,
        {
          id: pendingId,
          sender: "user",
          text: "음성 메시지 전송 중...",
        },
      ]);

      try {
        const response = await postChatbotVoiceMessage({
          fileUri,
          sessionId,
          storeId,
          limit: CHATBOT_DEFAULT_LIMIT,
        });
        const [recipeRecommendation, productRecommendation] = await Promise.all([
          enrichChatbotRecipeRecommendation(
            response.recipeRecommendation ?? undefined,
          ),
          enrichChatbotProductRecommendation(
            response.productRecommendation ?? undefined,
          ),
        ]);
        setSessionId(response.sessionId);
        setMessages((current) => [
          ...current.filter((item) => item.id !== pendingId),
          {
            id: `user-${response.sessionId}-${Date.now()}`,
            sender: "user",
            text: response.transcribedText,
          },
          {
            id: `bot-${response.sessionId}-${Date.now() + 1}`,
            sender: "bot",
            text: response.answer,
            recipeRecommendation,
            productRecommendation,
          },
        ]);
      } catch (err) {
        setMessages((current) =>
          current.filter((item) => item.id !== pendingId),
        );
        setError(
          err instanceof Error
            ? err.message
            : "음성 메시지 전송에 실패했습니다.",
        );
        throw err;
      } finally {
        setSending(false);
      }
    },
    [accessToken, isLoggedIn, sending, sessionId, storeId],
  );

  return {
    sessionId,
    messages,
    loading,
    sending,
    error,
    sendMessage,
    sendVoiceMessage,
    endChat,
    reload: loadInitial,
  };
}
