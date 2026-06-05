import { COLORS, LAYOUT, RADIUS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter, type Href } from "expo-router";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BUTTON_SIZE = 58;

export function FloatingChatbotButton() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (pathname !== "/") {
    return null;
  }

  const bottom = LAYOUT.tabBarTotalHeight + insets.bottom + SPACING.md;

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
      <Ionicons name="chatbubble-ellipses" size={27} color={COLORS.white} />
    </Pressable>
  );
}