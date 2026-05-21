import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // TODO: auth 팀원 — (auth)/login 연동 후 활성화
  // return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)" />;
}
