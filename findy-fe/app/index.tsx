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

  return <Redirect href="/(auth)/login" />;
}
