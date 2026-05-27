import { Header } from "@/components/common";
import { FaqListItem, MOCK_FAQ_ITEMS } from "@/components/faq";
import { SafeView } from "@/components/layout";
import { SPACING } from "@/constants/theme";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function FaqScreen() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handlePress = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <SafeView>
      <Header title="자주 묻는 질문" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.screen,
        }}
      >
        {MOCK_FAQ_ITEMS.map((item) => (
          <FaqListItem
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            onPress={() => handlePress(item.id)}
          />
        ))}
      </ScrollView>
    </SafeView>
  );
}
