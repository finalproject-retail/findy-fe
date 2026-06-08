export const CHATBOT_API_BASE = (
  process.env.EXPO_PUBLIC_CHATBOT_API_BASE?.trim() || "/api/v1/chatbot"
).replace(/\/$/, "");
