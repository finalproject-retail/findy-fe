import { ChatbotScreen } from "@/components/chatbot";
import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import { View } from "react-native";

export default function ChatbotRoute() {
  return (
    <SafeView className="flex-1">
      <Header showBack showCenterLogo />
      <View style={{ height: 1, backgroundColor: "#E5E7EB" }} />
      <View className="min-h-0 flex-1">
        <ChatbotScreen />
      </View>
    </SafeView>
  );
}
