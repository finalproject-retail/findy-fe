export type ChatMessage = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

export const CHATBOT_WELCOME_MESSAGES: ChatMessage[] = [
  {
    id: "bot-welcome",
    sender: "bot",
    text: "안녕하세요. 핀디 챗봇입니다.",
  },
  {
    id: "bot-guide",
    sender: "bot",
    text: "궁금한 내용을 입력하거나 아래 빠른 질문을 선택해주세요.",
  },
];

export const CHATBOT_DEFAULT_LIMIT = 10;
