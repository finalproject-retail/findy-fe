import { Header } from "@/components/common";
import { SquareButton } from "@/components/common/SquareButton";
import { SafeView } from "@/components/layout";
import { MOCK_MYPAGE_USER } from "@/components/mypage/mockUser";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function WithdrawScreen() {
  const router = useRouter();

  const handleThinkMore = () => {
    router.replace("/(tabs)");
  };

  const handleWithdraw = () => {
    // TODO: 회원 탈퇴 API
    router.replace("/(auth)/login");
  };

  return (
    <SafeView>
      <Header title="설정" showBack />
      <View
        style={{
          flex: 1,
          paddingHorizontal: SPACING.screen,
          paddingTop: SPACING.lg,
          paddingBottom: SPACING.xl,
        }}
      >
        <View style={{ gap: SPACING.sm }}>
          <Text className="text-md text-text-main" style={pretendard(700)}>
            {MOCK_MYPAGE_USER.name}님, 탈퇴하기 전에 한 번 더 생각해 보세요
          </Text>
          <Text className="text-sm text-text-sub2" style={pretendard(400)}>
            탈퇴 후 재가입은 14일이 지나야 할 수 있어요
          </Text>
        </View>

        <View
          className="flex-1 items-center justify-center"
          style={{ gap: SPACING.lg }}
        >
          <Text style={{ fontSize: 72, lineHeight: 80 }}>😢</Text>
          <Text className="text-xl text-text-main" style={pretendard(700)}>
            정말 탈퇴하시겠습니까?
          </Text>
        </View>

        <View style={{ gap: SPACING.md }}>
          <SquareButton onPress={handleThinkMore}>
            조금 더 생각해보기
          </SquareButton>
          <Pressable
            onPress={handleWithdraw}
            accessibilityRole="button"
            accessibilityLabel="회원 탈퇴"
            className="items-center py-sm"
          >
            <Text
              className="text-sm text-text-sub2"
              style={{
                ...pretendard(400),
                textDecorationLine: "underline",
              }}
            >
              회원 탈퇴
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeView>
  );
}
