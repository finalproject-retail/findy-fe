import type { ChatMessage } from "@/lib/chatbot/types";
import type { ChatbotHistoryMessageApiDto } from "@/lib/chatbot/api/types";

function mapSenderType(senderType: string): ChatMessage["sender"] {
  return senderType.toUpperCase() === "USER" ? "user" : "bot";
}

export function mapChatbotHistoryMessages(
  messages: ChatbotHistoryMessageApiDto[],
  sessionId: number,
): ChatMessage[] {
  return messages.map((item, index) => ({
    id: `${sessionId}-${item.createdAt}-${index}`,
    sender: mapSenderType(item.senderType),
    text: item.message,
  }));
}
