import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={{ paddingVertical: 15 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Findy</Text>
        </View>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "600" }}>
            안녕하세요, 소현님! 👋
          </Text>
          <Text style={{ color: "#9E9E9E", marginTop: 5 }}>
            오늘의 스마트한 쇼핑을 도와드릴게요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
