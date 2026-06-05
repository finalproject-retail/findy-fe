import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";

type ChatMessage = {
  id: string;
  sender: "bot" | "user";
  text: string;
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "bot-welcome",
    sender: "bot",
    text: "안녕하세요. 핀디 챗봇입니다.",
  },
  {
    id: "bot-guide",
    sender: "bot",
    text: "궁금한 내용을 입력하거나 아래 빠른 질문을 선택해 주세요.",
  },
];

const QUICK_QUESTIONS = [
  "상품 위치 찾기",
  "포인트 사용 방법",
  "쿠폰 적용 확인",
  "장바구니 안내",
];

function buildBotReply(question: string) {
  const normalized = question.replace(/\s/g, "");

  if (normalized.includes("상품") || normalized.includes("위치")) {
    return "찾고 싶은 상품명을 알려주시면 매장 지도에서 가까운 위치를 기준으로 안내해드릴게요.";
  }

  if (normalized.includes("포인트")) {
    return "포인트는 결제 단계에서 보유 포인트를 확인한 뒤 사용할 수 있어요. 마이핀디의 포인트 메뉴에서도 내역을 볼 수 있습니다.";
  }

  if (normalized.includes("쿠폰")) {
    return "사용 가능한 쿠폰은 쿠폰 탭과 결제 쿠폰 선택 화면에서 확인할 수 있어요. 상품 조건과 유효기간을 함께 확인해 주세요.";
  }

  if (normalized.includes("장바구니")) {
    return "장바구니에 담은 상품은 쇼핑 경로와 함께 확인할 수 있어요. 품절 상품은 별도 영역에 표시됩니다.";
  }

  return "문의 내용을 확인했어요. 현재는 화면 목업 응답으로 안내 중이며, 상담 API가 연결되면 더 정확한 답변을 드릴 수 있습니다.";
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";

  return (
    <View
      className={`flex-row ${isUser ? "justify-end" : "justify-start"}`}
      style={{ marginBottom: SPACING.sm }}
    >
      {!isUser ? (
        <View
          className="mr-sm items-center justify-center rounded-full bg-sub"
          style={{ width: 32, height: 32 }}
        >
          <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.main} />
        </View>
      ) : null}
      <View
        style={{
          maxWidth: "78%",
          borderRadius: RADIUS.md,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          backgroundColor: isUser ? COLORS.main : COLORS.lightGray,
        }}
      >
        <Text
          className={isUser ? "text-white" : "text-charcoal"}
          style={{
            ...pretendard(400),
            fontSize: 14,
            lineHeight: 21,
          }}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

export function ChatbotScreen() {
  const scrollViewRef = useRef<ScrollViewType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");

  const canSend = draft.trim().length > 0;
  const quickQuestions = useMemo(() => QUICK_QUESTIONS, []);

  const handleSend = (text = draft) => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    const createdAt = Date.now();
    const userMessage: ChatMessage = {
      id: `user-${createdAt}`,
      sender: "user",
      text: trimmed,
    };
    const botMessage: ChatMessage = {
      id: `bot-${createdAt}`,
      sender: "bot",
      text: buildBotReply(trimmed),
    };

    setMessages((current) => [...current, userMessage, botMessage]);
    setDraft("");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
    >
      <View className="flex-1">
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
          contentContainerStyle={{
            paddingHorizontal: SPACING.screen,
            paddingTop: SPACING.lg,
            paddingBottom: SPACING.lg,
          }}
        >
          <View
            className="mb-lg rounded-md bg-sub"
            style={{
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.md,
              gap: SPACING.xs,
            }}
          >
            <Text className="text-md text-text-main" style={pretendard(700)}>
              핀디에게 물어보세요
            </Text>
            <Text
              className="text-sm text-text-main"
              style={{ ...pretendard(400), lineHeight: 20 }}
            >
              쇼핑 중 필요한 정보를 빠르게 확인할 수 있어요.
            </Text>
          </View>

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        <View
          className="border-t-thin border-light-gray bg-white px-screen"
          style={{
            paddingTop: SPACING.md,
            paddingBottom: SPACING.md,
            gap: SPACING.sm,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: SPACING.sm }}
          >
            {quickQuestions.map((question) => (
              <Pressable
                key={question}
                onPress={() => handleSend(question)}
                accessibilityRole="button"
                accessibilityLabel={question}
                className="rounded-full border-base border-gray bg-white px-md py-sm"
              >
                <Text className="text-sm text-charcoal" style={pretendard(500)}>
                  {question}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View
            className="flex-row items-center rounded-full bg-light-gray"
            style={{
              minHeight: 50,
              paddingLeft: SPACING.md,
              paddingRight: SPACING.xs,
              gap: SPACING.sm,
            }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={() => handleSend()}
              returnKeyType="send"
              placeholder="궁금한 내용을 입력하세요"
              placeholderTextColor={COLORS.subText}
              className="min-w-0 flex-1 text-md text-text-main"
              style={pretendard(400)}
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="메시지 보내기"
              accessibilityState={{ disabled: !canSend }}
              className="items-center justify-center rounded-full"
              style={{
                width: 40,
                height: 40,
                backgroundColor: canSend ? COLORS.main : COLORS.gray,
              }}
            >
              <Ionicons name="send" size={18} color={COLORS.white} />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
