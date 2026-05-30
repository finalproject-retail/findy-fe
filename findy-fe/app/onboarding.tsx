import { OnboardingChipGrid } from "@/components/onboarding/OnboardingChipGrid";
import { OnboardingLoadingDots } from "@/components/onboarding/OnboardingLoadingDots";
import { OnboardingNextButton } from "@/components/onboarding/OnboardingNextButton";
import { OnboardingProgressBar } from "@/components/onboarding/OnboardingProgressBar";
import BigLogo from "@/assets/icons/big-logo.svg";
import {
  ONBOARDING_CATEGORY_OPTIONS,
  ONBOARDING_LOADING_DURATION_MS,
  ONBOARDING_SHOPPING_STYLE_OPTIONS,
  type OnboardingChipOption,
} from "@/constants/onboarding";
import { COLORS, SPACING } from "@/constants/theme";
import { saveUserPreferences } from "@/lib/api/preferences";
import { getUserIdFromAccessToken } from "@/lib/auth/jwt";
import { getAccessToken, getApiErrorMessage } from "@/lib/api/client";
import { setOnboardingCompleted } from "@/lib/onboarding/storage";
import { pretendard } from "@/utils/pretendard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type OnboardingStep = "welcome" | "categories" | "styles" | "loading";

function collectValueIds(
  options: OnboardingChipOption[],
  selectedChipIds: string[],
): number[] {
  const ids = new Set<number>();
  for (const chipId of selectedChipIds) {
    const option = options.find((item) => item.id === chipId);
    option?.valueIds.forEach((id) => ids.add(id));
  }
  return [...ids];
}

function toggleSelection(current: string[], id: string): string[] {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
}

export default function OnboardingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string; email?: string }>();

  const displayName = useMemo(() => {
    const raw = typeof params.name === "string" ? params.name.trim() : "";
    return raw || "회원";
  }, [params.name]);

  const email = typeof params.email === "string" ? params.email.trim() : "";
  const logoBounce = useRef(new Animated.Value(0)).current;

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const finishOnboarding = useCallback(async () => {
    const categoryIds = collectValueIds(
      ONBOARDING_CATEGORY_OPTIONS,
      selectedCategories,
    );
    const shoppingStyleIds = collectValueIds(
      ONBOARDING_SHOPPING_STYLE_OPTIONS,
      selectedStyles,
    );

    const token = getAccessToken();
    const userId = token ? getUserIdFromAccessToken(token) : null;

    if (userId && categoryIds.length > 0 && shoppingStyleIds.length > 0) {
      try {
        await saveUserPreferences(userId, { categoryIds, shoppingStyleIds });
      } catch (error) {
        Alert.alert("설정 저장 실패", getApiErrorMessage(error));
      }
    }

    if (email) {
      await setOnboardingCompleted(email);
    }

    router.replace("/(tabs)");
  }, [
    email,
    router,
    selectedCategories,
    selectedStyles,
  ]);

  useEffect(() => {
    if (step !== "loading") return;

    const timer = setTimeout(() => {
      void finishOnboarding();
    }, ONBOARDING_LOADING_DURATION_MS);

    return () => clearTimeout(timer);
  }, [step, finishOnboarding]);

  useEffect(() => {
    if (step !== "welcome") return;
    logoBounce.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoBounce, {
          toValue: 1,
          duration: 340,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoBounce, {
          toValue: 0,
          duration: 340,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      { iterations: 5 },
    ).start();
  }, [logoBounce, step]);

  const progress =
    step === "categories" ? 0.5 : step === "styles" ? 0.75 : 0;

  const showProgress = step === "categories" || step === "styles";

  const handleCategoriesNext = () => {
    if (selectedCategories.length === 0) {
      Alert.alert("안내", "하나 이상 선택해 주세요.");
      return;
    }
    setStep("styles");
  };

  const handleStylesNext = () => {
    if (selectedStyles.length === 0) {
      Alert.alert("안내", "하나 이상 선택해 주세요.");
      return;
    }
    setStep("loading");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="flex-1 px-screen">
        {showProgress ? (
          <View style={{ marginTop: SPACING.md, marginBottom: SPACING.xl }}>
            <OnboardingProgressBar progress={progress} />
          </View>
        ) : (
          <View style={{ height: SPACING.md }} />
        )}

        {step === "welcome" && (
          <View className="flex-1 items-center justify-center">
            <Animated.View
              style={{
                marginBottom: SPACING.xl,
                transform: [
                  {
                    translateY: logoBounce.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -14],
                    }),
                  },
                ],
              }}
            >
              <BigLogo width={88} height={88} />
            </Animated.View>
            <Text
              style={{
                ...pretendard(700),
                fontSize: 22,
                color: COLORS.text,
                textAlign: "center",
                lineHeight: 32,
              }}
            >
              {`${displayName}님, 안녕하세요 👋`}
            </Text>
            <Text
              style={{
                ...pretendard(700),
                fontSize: 22,
                color: COLORS.text,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              만나서 반가워요.
            </Text>
          </View>
        )}

        {(step === "categories" || step === "styles") && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 88,
              paddingBottom: SPACING.xl,
            }}
          >
            <Text
              style={{
                ...pretendard(700),
                fontSize: 22,
                color: COLORS.text,
                marginBottom: SPACING.xl,
              }}
            >
              {step === "categories"
                ? "어떤 물건을 주로 찾으시나요?"
                : "어떤 쇼핑 스타일이신가요?"}
            </Text>
            <OnboardingChipGrid
              options={
                step === "categories"
                  ? ONBOARDING_CATEGORY_OPTIONS
                  : ONBOARDING_SHOPPING_STYLE_OPTIONS
              }
              selectedIds={
                step === "categories" ? selectedCategories : selectedStyles
              }
              onToggle={(id) => {
                if (step === "categories") {
                  setSelectedCategories((prev) => toggleSelection(prev, id));
                } else {
                  setSelectedStyles((prev) => toggleSelection(prev, id));
                }
              }}
            />
          </ScrollView>
        )}

        {step === "loading" && (
          <View className="flex-1 items-center justify-center">
            <OnboardingLoadingDots />
            <Text
              style={{
                ...pretendard(700),
                fontSize: 22,
                color: COLORS.text,
                textAlign: "center",
                marginTop: SPACING.xl,
                lineHeight: 32,
              }}
            >
              {"나에게 맞는\n상품을 탐색하는 중"}
            </Text>
          </View>
        )}

        {step !== "loading" && (
          <View style={{ paddingBottom: SPACING.lg, paddingTop: SPACING.md }}>
            <OnboardingNextButton
              onPress={() => {
                if (step === "welcome") setStep("categories");
                else if (step === "categories") handleCategoriesNext();
                else if (step === "styles") handleStylesNext();
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
