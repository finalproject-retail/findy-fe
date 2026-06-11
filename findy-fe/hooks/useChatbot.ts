import { useAuth } from "@/contexts/AuthContext";
import {
  fetchChatbotSessionMessages,
  fetchChatbotSessions,
  postChatbotMessage,
  postChatbotVoiceMessage,
} from "@/lib/chatbot/api/chatbot";
import {
  enrichChatbotProductRecommendation,
  enrichChatbotRecipeRecommendation,
  enrichChatMessagesWithCatalogImages,
} from "@/lib/chatbot/enrichChatbotProductImages";
import { mapChatbotHistoryMessages } from "@/lib/chatbot/mapChatbotMessages";
import {
  CHATBOT_DEFAULT_LIMIT,
  CHATBOT_WELCOME_MESSAGES,
  type ChatMessage,
} from "@/lib/chatbot/types";
import { useCallback, useEffect, useState } from "react";

function pickLatestSession(
  sessions: Awaited<ReturnType<typeof fetchChatbotSessions>>,
) {
  if (sessions.length === 0) {
    return null;
  }

  return [...sessions].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0]!;
}

/** 챗봇 화면을 나갔다 들어와도 채팅 내역 유지 (채팅 종료하기 전까지) */
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
    if (chatbotSessionCache) {
      setSessionId(chatbotSessionCache.sessionId);
      setMessages(chatbotSessionCache.messages);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessions = await fetchChatbotSessions();
      const latestSession = pickLatestSession(sessions);

      if (!latestSession) {
        setSessionId(null);
        setMessages(CHATBOT_WELCOME_MESSAGES);
        return;
      }

      const history = await fetchChatbotSessionMessages(latestSession.sessionId);
      const mapped = await enrichChatMessagesWithCatalogImages(
        mapChatbotHistoryMessages(history.messages, history.sessionId),
      );

      setSessionId(history.sessionId);
      setMessages(mapped.length > 0 ? mapped : CHATBOT_WELCOME_MESSAGES);
    } catch (err) {
      setSessionId(null);
      setMessages(CHATBOT_WELCOME_MESSAGES);
      // 초기 히스토리 로드 실패는 UX상 치명적이지 않아서 조용히 웰컴으로 fallback.
      // (재진입 시 일시적인 네트워크 오류가 사용자에게 “에러 고정”으로 보이는 문제 방지)
      setError(null);
      if (__DEV__) {
        console.warn(
          "[chatbot] initial load failed",
          err instanceof Error ? err.message : err,
        );
      }
    } finally {
      setLoading(false);
    }
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

  /** 채팅 종료하기 — 내역 비우고 새 대화로 시작 (재진입 시 이전 세션 복원 안 함) */
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
