import { COLORS } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type MypageGreetingProps = {
  name: string;
  email: string;
};

export function MypageGreeting({ name, email }: MypageGreetingProps) {
  return (
    <View className="gap-1">
      <Text className="text-xl text-text-main" style={pretendard(700)}>
        {name}님{" "}
        <Text style={{ ...pretendard(700), color: COLORS.main }}>
          반가워요!
        </Text>
      </Text>
      <Text className="text-sm text-text-sub" style={pretendard(400)}>
        {email}
      </Text>
    </View>
  );
}
