import AsyncStorage from "@react-native-async-storage/async-storage";

const key = (email: string) =>
  `@findy/onboarding_completed:${email.trim().toLowerCase()}`;

export async function isOnboardingCompleted(email: string): Promise<boolean> {
  if (!email.trim()) return false;
  const value = await AsyncStorage.getItem(key(email));
  return value === "true";
}

export async function setOnboardingCompleted(email: string): Promise<void> {
  if (!email.trim()) return;
  await AsyncStorage.setItem(key(email), "true");
}
