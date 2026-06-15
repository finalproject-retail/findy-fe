import { COLORS } from "@/constants/theme";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

/** OAuth redirect 후 openAuthSessionAsync가 code URL을 받도록 세션 완료 */
WebBrowser.maybeCompleteAuthSession();

export function OAuthCallbackScreen() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.white,
        gap: 12,
      }}
    >
      <ActivityIndicator size="large" color={COLORS.main} />
      <Text style={{ color: COLORS.subText, fontSize: 14 }}>로그인 처리 중...</Text>
    </View>
  );
}
