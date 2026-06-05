import { useAuth } from "@/contexts/AuthContext";
import { Redirect, type Href } from "expo-router";
import { Image, View } from "react-native";

export default function Index() {
  const { isLoggedIn, isLoading, isAdminSession } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Image
          source={require("@/assets/images/splash-logo.png")}
          style={{ width: 87 }}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (isLoggedIn) {
    return <Redirect href={(isAdminSession ? "/(admin)" : "/(tabs)") as Href} />;
  }

  return <Redirect href={"/(auth)/login" as Href} />;
}
