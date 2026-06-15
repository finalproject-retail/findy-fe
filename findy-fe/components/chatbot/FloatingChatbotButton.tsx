import { COLORS, LAYOUT, RADIUS, SPACING } from "@/constants/theme";
import { useAuthReady } from "@/hooks/useAuthReady";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useSegments, type Href } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BUTTON_SIZE = 55;

const HIDDEN_ROOT_SEGMENTS = new Set(["(admin)", "(auth)", "onboarding"]);

export function FloatingChatbotButton() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const isAuthReady = useAuthReady();
  const rootSegment = segments[0];

  if (!isAuthReady) {
    return null;
  }

  if (rootSegment != null && HIDDEN_ROOT_SEGMENTS.has(rootSegment)) {
    return null;
  }

  const tabSegment = segments.at(1);
  const onUserHome =
    rootSegment === "(tabs)" &&
    (tabSegment == null || String(tabSegment) === "index");

  if (!onUserHome) {
    return null;
  }

  const bottom = LAYOUT.tabBarTotalHeight + insets.bottom + SPACING.md - 15;

  return (
    <Pressable
      onPress={() => router.push("/chatbot" as Href)}
      accessibilityRole="button"
      accessibilityLabel="핀디 챗봇 열기"
      className="items-center justify-center"
      style={{
        position: "absolute",
        right: SPACING.screen,
        bottom,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.main,
        shadowColor: COLORS.charcoal,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
        zIndex: 100,
      }}
    >
      <MaterialCommunityIcons name="robot" size={30} color={COLORS.white} />
    </Pressable>
  );
}
