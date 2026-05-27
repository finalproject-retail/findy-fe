import { SettingsPreferencesProvider } from "@/contexts/SettingsPreferencesContext";
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <SettingsPreferencesProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SettingsPreferencesProvider>
  );
}
