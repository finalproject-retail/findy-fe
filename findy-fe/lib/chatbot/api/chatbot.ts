import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { buildTokenOnlyApiHeaders } from "@/lib/auth/api/userApiHeaders";
import { assertChatbotSuccess } from "@/lib/chatbot/api/assertChatbotSuccess";
import { CHATBOT_API_BASE } from "@/lib/chatbot/api/chatbotClient";
import { chatbotApiClient } from "@/lib/chatbot/api/chatbotApiClient";
import { resolveChatbotSessionId } from "@/lib/chatbot/api/resolveChatbotSessionId";
import type {
  ChatbotApiEnvelope,
  ChatbotMessageResponseApiDto,
  ChatbotMessageResult,
  ChatbotSessionApiDto,
  ChatbotSessionMessagesApiData,
  ChatbotSessionsApiData,
  ChatbotSttApiData,
  ChatbotVoiceMessageApiData,
  ChatbotVoiceMessageResult,
  NormalizedChatbotSessionApiDto,
} from "@/lib/chatbot/api/types";
import {
  hasChatbotRecipeRecommendation,
  mapChatbotMessageRecipeRecommendation,
} from "@/lib/chatbot/mapChatbotRecipeRecommendation";
import {
  hasChatbotProductRecommendation,
  mapChatbotShoppingProductRecommendation,
} from "@/lib/chatbot/mapChatbotShoppingContext";
import { CHATBOT_DEFAULT_LIMIT, CHATBOT_MESSAGE_TIMEOUT_MS } from "@/lib/chatbot/types";
import { Platform } from "react-native";

export type PostChatbotMessageParams = {
  message: string;
  sessionId?: number | null;
  storeId?: number;
  limit?: number;
};

export type PostChatbotVoiceMessageParams = {
  fileUri: string;
  fileName?: string;
  mimeType?: string;
  sessionId?: number | null;
  storeId?: number;
  limit?: number;
};

function mapMessageResponse(
  dto: ChatbotMessageResponseApiDto,
): ChatbotMessageResult {
  const recipeRecommendation = mapChatbotMessageRecipeRecommendation(dto);
  const productRecommendation = mapChatbotShoppingProductRecommendation(dto);

  return {
    sessionId: resolveChatbotSessionId(dto) ?? 0,
    answer: dto.answer,
    recipeRecommendation: hasChatbotRecipeRecommendation(recipeRecommendation)
      ? recipeRecommendation
      : undefined,
    productRecommendation: hasChatbotProductRecommendation(productRecommendation)
      ? productRecommendation
      : undefined,
    status: dto.status,
    failureType: dto.failureType,
  };
}

function mapVoiceResponse(
  dto: ChatbotVoiceMessageApiData,
): ChatbotVoiceMessageResult {
  const nested = dto.chatbotResponse;
  const source = {
    recipeRecommendation:
      nested?.recipeRecommendation ?? dto.recipeRecommendation,
    shoppingContext: nested?.shoppingContext ?? dto.shoppingContext,
  };
  const recipeRecommendation = mapChatbotMessageRecipeRecommendation(source);
  const productRecommendation = mapChatbotShoppingProductRecommendation(source);

  return {
    sessionId: nested?.sessionId ?? dto.sessionId ?? 0,
    transcribedText: dto.transcribedText,
    answer: nested?.answer ?? dto.answer ?? "",
    recipeRecommendation: hasChatbotRecipeRecommendation(recipeRecommendation)
      ? recipeRecommendation
      : undefined,
    productRecommendation: hasChatbotProductRecommendation(productRecommendation)
      ? productRecommendation
      : undefined,
    status: nested?.status ?? dto.status,
    failureType: nested?.failureType ?? dto.failureType,
  };
}

function resolveVoiceFileMeta(fileUri: string) {
  const lowerUri = fileUri.toLowerCase();
  if (lowerUri.endsWith(".caf")) {
    return { fileName: "recording.caf", mimeType: "audio/x-caf" };
  }
  if (lowerUri.endsWith(".m4a")) {
    return { fileName: "recording.m4a", mimeType: "audio/m4a" };
  }
  return { fileName: "recording.wav", mimeType: "audio/wav" };
}

function buildVoiceFormData(params: PostChatbotVoiceMessageParams) {
  const meta = resolveVoiceFileMeta(params.fileUri);
  const formData = new FormData();
  formData.append("file", {
    uri: params.fileUri,
    name: params.fileName ?? meta.fileName,
    type: params.mimeType ?? meta.mimeType,
  } as unknown as Blob);

  if (params.sessionId != null) {
    formData.append("sessionId", String(params.sessionId));
    formData.append("chatSessionId", String(params.sessionId));
  }
  if (params.storeId != null) {
    formData.append("storeId", String(params.storeId));
  }
  if (params.limit != null) {
    formData.append("limit", String(params.limit));
  }

  return formData;
}

/** POST /api/v1/chatbot/messages */
export async function postChatbotMessage(
  params: PostChatbotMessageParams,
): Promise<ChatbotMessageResult> {
  try {
    const response = await chatbotApiClient.post<
      ChatbotApiEnvelope<ChatbotMessageResponseApiDto>
    >(
      `${CHATBOT_API_BASE}/messages`,
      {
        sessionId: params.sessionId ?? null,
        chatSessionId: params.sessionId ?? null,
        storeId: params.storeId,
        limit: params.limit ?? CHATBOT_DEFAULT_LIMIT,
        message: params.message,
      },
      {
        headers: buildTokenOnlyApiHeaders({ includeJsonContentType: true }),
        timeout: CHATBOT_MESSAGE_TIMEOUT_MS,
      },
    );

    assertChatbotSuccess(response.data, "챗봇 메시지 전송에 실패했습니다.");
    if (!response.data.data) {
      throw new Error("챗봇 메시지 전송에 실패했습니다.");
    }

    return mapMessageResponse(response.data.data);
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "챗봇 메시지 전송에 실패했습니다."),
    );
  }
}

/** GET /api/v1/chatbot/sessions */
export async function fetchChatbotSessions(): Promise<
  NormalizedChatbotSessionApiDto[]
> {
  try {
    const response = await chatbotApiClient.get<
      ChatbotApiEnvelope<ChatbotSessionsApiData | ChatbotSessionApiDto[]>
    >(`${CHATBOT_API_BASE}/sessions`, {
      headers: buildTokenOnlyApiHeaders(),
    });

    assertChatbotSuccess(response.data, "채팅 세션 목록을 불러오지 못했습니다.");

    const data = response.data.data;
    const rawSessions = Array.isArray(data) ? data : (data?.sessions ?? []);
    return rawSessions.flatMap((session) => {
      const sessionId = resolveChatbotSessionId(session);
      if (sessionId == null) {
        return [];
      }
      return [{ ...session, sessionId }];
    });
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "채팅 세션 목록을 불러오지 못했습니다."),
    );
  }
}

/** GET /api/v1/chatbot/sessions/{sessionId}/messages */
export async function fetchChatbotSessionMessages(sessionId: number) {
  if (!Number.isFinite(sessionId) || sessionId <= 0) {
    throw new Error("유효하지 않은 채팅 세션입니다.");
  }

  try {
    const response = await chatbotApiClient.get<
      ChatbotApiEnvelope<ChatbotSessionMessagesApiData>
    >(`${CHATBOT_API_BASE}/sessions/${sessionId}/messages`, {
      headers: buildTokenOnlyApiHeaders(),
    });

    assertChatbotSuccess(response.data, "채팅 메시지를 불러오지 못했습니다.");
    if (!response.data.data) {
      throw new Error("채팅 메시지를 불러오지 못했습니다.");
    }

    const resolvedSessionId =
      resolveChatbotSessionId(response.data.data) ?? sessionId;

    return {
      ...response.data.data,
      sessionId: resolvedSessionId,
      messages:
        response.data.data.messages ??
        response.data.data.chatMessages ??
        [],
    };
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "채팅 메시지를 불러오지 못했습니다."),
    );
  }
}

/** POST /api/v1/chatbot/stt */
export async function postChatbotStt(fileUri: string) {
  try {
    buildTokenOnlyApiHeaders();
    const formData = buildVoiceFormData({ fileUri });
    const response = await chatbotApiClient.post<
      ChatbotApiEnvelope<ChatbotSttApiData>
    >(`${CHATBOT_API_BASE}/stt`, formData, {
      headers: buildTokenOnlyApiHeaders(),
      transformRequest: Platform.OS === "web" ? undefined : (data) => data,
    });

    assertChatbotSuccess(response.data, "음성 변환에 실패했습니다.");
    if (!response.data.data?.text) {
      throw new Error("음성 변환에 실패했습니다.");
    }

    return response.data.data.text;
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "음성 변환에 실패했습니다."));
  }
}

/** POST /api/v1/chatbot/messages/voice */
export async function postChatbotVoiceMessage(
  params: PostChatbotVoiceMessageParams,
): Promise<ChatbotVoiceMessageResult> {
  try {
    buildTokenOnlyApiHeaders();
    const formData = buildVoiceFormData(params);
    const response = await chatbotApiClient.post<
      ChatbotApiEnvelope<ChatbotVoiceMessageApiData>
    >(`${CHATBOT_API_BASE}/messages/voice`, formData, {
      headers: buildTokenOnlyApiHeaders(),
      transformRequest: Platform.OS === "web" ? undefined : (data) => data,
      timeout: CHATBOT_MESSAGE_TIMEOUT_MS,
    });

    assertChatbotSuccess(response.data, "음성 메시지 전송에 실패했습니다.");
    if (!response.data.data) {
      throw new Error("음성 메시지 전송에 실패했습니다.");
    }

    return mapVoiceResponse(response.data.data);
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "음성 메시지 전송에 실패했습니다."),
    );
  }
}
