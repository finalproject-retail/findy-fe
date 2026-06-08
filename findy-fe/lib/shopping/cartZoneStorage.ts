import type { CartZoneItem } from "@/components/category";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX = "findy_cart_zones";

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function isCartZoneItem(value: unknown): value is CartZoneItem {
  if (typeof value !== "object" || value == null) {
    return false;
  }

  const item = value as Partial<CartZoneItem>;
  return (
    typeof item.categoryId === "number" &&
    typeof item.label === "string" &&
    typeof item.path === "string" &&
    typeof item.topLabel === "string" &&
    typeof item.middleLabel === "string" &&
    typeof item.emoji === "string"
  );
}

export async function loadCartZoneItems(
  userId: string,
): Promise<CartZoneItem[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isCartZoneItem);
  } catch {
    return [];
  }
}

export async function saveCartZoneItems(
  userId: string,
  items: CartZoneItem[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(items));
  } catch (error) {
    console.error("[cartZoneStorage] save failed:", error);
  }
}

export async function clearCartZoneItems(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(userId));
  } catch (error) {
    console.error("[cartZoneStorage] clear failed:", error);
  }
}
