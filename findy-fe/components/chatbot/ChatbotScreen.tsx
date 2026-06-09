import MicIcon from "@/assets/icons/mic-icon.svg";
import { ChatbotRecommendedProducts } from "@/components/chatbot/ChatbotRecommendedProducts";
import { ChatbotSpeechNativeBridge } from "@/components/chatbot/ChatbotSpeechNativeBridge";
import { VoiceWaveform } from "@/components/chatbot/VoiceWaveform";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import { useToast } from "@/contexts/ToastContext";
import { useChatbot } from "@/hooks/useChatbot";
import { useChatbotSpeechRecognition } from "@/hooks/useChatbotSpeechRecognition";
import type { ChatMessage } from "@/lib/chatbot/types";
import { pretendard } from "@/utils/pretendard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const QUICK_QUESTIONS = [
  "상품 위치 찾기",
  "포인트 사용 방법",
  "쿠폰 적용 확인",
  "장바구니 안내",
];

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === "user";
  const recommendedProducts = message.recommendedProducts ?? [];

  if (isUser) {
    return (
      <View
        className="flex-row justify-end"
        style={{ marginBottom: SPACING.sm }}
      >
        <View
          style={{
            maxWidth: "78%",
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            backgroundColor: COLORS.main,
          }}
        >
          <Text
            className="text-white"
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

  return (
    <View
      className="flex-row justify-start"
      style={{ marginBottom: SPACING.sm }}
    >
      <View
        className="mr-sm items-center justify-center rounded-full bg-sub"
        style={{ width: 32, height: 32 }}
      >
        <MaterialCommunityIcons name="robot" size={19} color={COLORS.main} />
      </View>
      <View style={{ flex: 1, minWidth: 0, maxWidth: "88%" }}>
        <View
          style={{
            alignSelf: "flex-start",
            maxWidth: "100%",
            borderRadius: RADIUS.md,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm,
            backgroundColor: COLORS.lightGray,
          }}
        >
          <Text
            className="text-charcoal"
            style={{
              ...pretendard(400),
              fontSize: 14,
              lineHeight: 21,
            }}
          >
            {message.text}
          </Text>
        </View>

        {recommendedProducts.length > 0 ? (
          <ChatbotRecommendedProducts products={recommendedProducts} />
        ) : null}
      </View>
    </View>
  );
}

export function ChatbotScreen() {
  const scrollViewRef = useRef<ScrollViewType | null>(null);
  const insets = useSafeAreaInsets();
  const { storeId } = useStoreMapConfig();
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    sendVoiceMessage,
  } = useChatbot(storeId);

  const canSend = draft.trim().length > 0 && !sending;
  const quickQuestions = useMemo(() => QUICK_QUESTIONS, []);

  const handleSend = useCallback(
    async (text = draft) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      try {
        await sendMessage(trimmed);
        setDraft("");
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "챗봇 메시지 전송에 실패했습니다.",
        );
      }
    },
    [draft, sendMessage, showToast],
  );

  const handleVoiceFallback = useCallback(
    async (text: string) => {
      try {
        await sendMessage(text);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "음성 메시지 전송에 실패했습니다.",
        );
      }
    },
    [sendMessage, showToast],
  );

  const handleVoiceRecordingComplete = useCallback(
    async (fileUri: string) => {
      try {
        await sendVoiceMessage(fileUri);
      } catch (err) {
        showToast(
          err instanceof Error
            ? err.message
            : "음성 메시지 전송에 실패했습니다.",
        );
      }
    },
    [sendVoiceMessage, showToast],
  );

  const speechOptions = useMemo(
    () => ({
      enabled: !sending && !loading,
      onFinalTranscript: (text: string) => {
        void handleVoiceFallback(text);
      },
      onVoiceRecordingComplete: (uri: string) => {
        void handleVoiceRecordingComplete(uri);
      },
      onRecognitionEmpty: () => {
        showToast("음성을 인식하지 못했습니다. 다시 말씀해 주세요.");
      },
      onSpeechError: (message: string) => {
        showToast(message);
      },
    }),
    [
      handleVoiceFallback,
      handleVoiceRecordingComplete,
      loading,
      sending,
      showToast,
    ],
  );

  const { isListening, volume, interimTranscript, toggleListening, bridgeProps } =
    useChatbotSpeechRecognition(speechOptions);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const inputBottomInset =
    keyboardHeight > 0 ? SPACING.md : Math.max(insets.bottom, SPACING.md);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.main} />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: keyboardHeight }}
    >
      <ChatbotSpeechNativeBridge {...bridgeProps} />
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

          {error ? (
            <Text
              className="mb-md text-sm text-text-red"
              style={pretendard(400)}
            >
              {error}
            </Text>
          ) : null}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {sending ? (
            <View className="flex-row items-center gap-2 py-sm">
              <ActivityIndicator size="small" color={COLORS.main} />
              <Text className="text-sm text-text-sub" style={pretendard(400)}>
                답변 생성 중...
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <View
          className="border-t-thin border-light-gray bg-white px-screen"
          style={{
            paddingTop: SPACING.md,
            paddingBottom: inputBottomInset,
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
                onPress={() => void handleSend(question)}
                disabled={sending}
                accessibilityRole="button"
                accessibilityLabel={question}
                className="rounded-full border-base border-gray bg-white px-md py-sm"
                style={{ opacity: sending ? 0.6 : 1 }}
              >
                <Text className="text-sm text-charcoal" style={pretendard(500)}>
                  {question}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {isListening && interimTranscript.trim().length > 0 ? (
            <Text
              className="text-sm text-text-sub"
              numberOfLines={2}
              style={pretendard(400)}
            >
              {interimTranscript}
            </Text>
          ) : null}

          <View
            className="flex-row items-center rounded-full bg-light-gray"
            style={{
              minHeight: 50,
              paddingLeft: SPACING.md,
              paddingRight: SPACING.xs,
              gap: SPACING.sm,
            }}
          >
            {isListening ? (
              <View
                className="min-w-0 flex-1 items-center justify-center"
                style={{ minHeight: 34 }}
              >
                <VoiceWaveform volume={volume} active={isListening} />
              </View>
            ) : (
              <TextInput
                value={draft}
                onChangeText={setDraft}
                onFocus={() => {
                  requestAnimationFrame(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  });
                }}
                onSubmitEditing={() => void handleSend()}
                returnKeyType="send"
                editable={!sending}
                placeholder="궁금한 내용을 입력하세요"
                placeholderTextColor={COLORS.subText}
                className="min-w-0 flex-1 text-md text-text-main"
                style={pretendard(400)}
              />
            )}

            <Pressable
              onPress={() => void toggleListening()}
              disabled={sending}
              accessibilityRole="button"
              accessibilityLabel={isListening ? "음성 입력 중지" : "음성 입력"}
              accessibilityState={{ selected: isListening, disabled: sending }}
              className="items-center justify-center"
              style={{ width: 40, height: 40, opacity: sending ? 0.5 : 1 }}
            >
              <MicIcon
                width={22}
                height={22}
                fill={isListening ? COLORS.main : COLORS.gray}
              />
            </Pressable>

            {canSend ? (
              <Pressable
                onPress={() => void handleSend()}
                accessibilityRole="button"
                accessibilityLabel="메시지 보내기"
                className="items-center justify-center rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: COLORS.main,
                }}
              >
                <Ionicons name="send" size={18} color={COLORS.white} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
