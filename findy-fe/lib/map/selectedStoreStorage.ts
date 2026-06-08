import AsyncStorage from "@react-native-async-storage/async-storage";

const SELECTED_STORE_ID_KEY = "findy_selected_store_id";

export async function loadSelectedStoreId(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(SELECTED_STORE_ID_KEY);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function saveSelectedStoreId(storeId: number): Promise<void> {
  await AsyncStorage.setItem(SELECTED_STORE_ID_KEY, String(storeId));
}
