import { ADMIN_SESSION_KEY } from "@/lib/auth/session";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadAdminSession(): Promise<boolean> {
  const value = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
  return value === "1";
}

export async function saveAdminSession(isAdmin: boolean): Promise<void> {
  if (isAdmin) {
    await AsyncStorage.setItem(ADMIN_SESSION_KEY, "1");
  } else {
    await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export async function clearAdminSession(): Promise<void> {
  await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
}
