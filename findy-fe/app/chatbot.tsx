import { ChatbotScreen } from "@/components/chatbot";
import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";

export default function ChatbotRoute() {
  return (
    <SafeView>
      <Header showBack showCenterLogo />
      <ChatbotScreen />
    </SafeView>
  );
}
