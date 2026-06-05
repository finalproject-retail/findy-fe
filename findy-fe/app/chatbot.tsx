import { ChatbotScreen } from "@/components/chatbot";
import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import { View } from "react-native";

export default function ChatbotRoute() {
  return (
    <SafeView>
      <Header showBack showCenterLogo />

      <View
        style={{
          height: 1,
          backgroundColor: "#E5E7EB",
        }}
      />

      <ChatbotScreen />
    </SafeView>
  );
}
