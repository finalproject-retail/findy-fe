import type { ChatbotApiEnvelope } from "@/lib/chatbot/api/types";

export function assertChatbotSuccess(
  body: ChatbotApiEnvelope<unknown> | undefined,
  fallbackMessage: string,
) {
  const ok =
    body?.success === true ||
    body?.status === "SUCCESS" ||
    body?.code === "SUCCESS";
  if (!ok) {
    throw new Error(body?.message ?? fallbackMessage);
  }
}
