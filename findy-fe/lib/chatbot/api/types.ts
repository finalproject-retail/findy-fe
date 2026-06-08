export type ChatbotApiEnvelope<T> = {
  success?: boolean;
  code?: string;
  status?: string;
  message?: string;
  data?: T;
};

export type ChatbotMessageResponseApiDto = {
  sessionId: number;
  answer: string;
  shoppingContext?: Record<string, unknown> | null;
  ragContext?: Record<string, unknown> | null;
  status?: string;
  failureType?: string | null;
};

export type ChatbotSessionApiDto = {
  sessionId: number;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatbotSessionsApiData = {
  sessions: ChatbotSessionApiDto[];
};

export type ChatbotHistoryMessageApiDto = {
  senderType: string;
  message: string;
  intent?: string | null;
  createdAt: string;
};

export type ChatbotSessionMessagesApiData = {
  sessionId: number;
  messages: ChatbotHistoryMessageApiDto[];
};

export type ChatbotSttApiData = {
  text: string;
};

export type ChatbotVoiceMessageApiData = {
  transcribedText: string;
  chatbotResponse?: ChatbotMessageResponseApiDto;
  sessionId?: number;
  answer?: string;
  shoppingContext?: Record<string, unknown> | null;
  ragContext?: Record<string, unknown> | null;
  status?: string;
  failureType?: string | null;
};

export type ChatbotMessageResult = {
  sessionId: number;
  answer: string;
  status?: string;
  failureType?: string | null;
};

export type ChatbotVoiceMessageResult = {
  sessionId: number;
  transcribedText: string;
  answer: string;
  status?: string;
  failureType?: string | null;
};
