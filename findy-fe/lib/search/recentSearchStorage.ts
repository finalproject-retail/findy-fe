import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX = "findy_recent_searches";

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function parseRecentSearches(raw: string | null): string[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  } catch {
    return [];
  }
}

export async function loadRecentSearches(userId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    return parseRecentSearches(raw);
  } catch {
    return [];
  }
}

export async function saveRecentSearches(
  userId: string,
  terms: string[],
): Promise<void> {
  try {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify(terms));
  } catch (error) {
    console.error("[recentSearchStorage] save failed:", error);
  }
}

export async function clearRecentSearchesStorage(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(userId));
  } catch (error) {
    console.error("[recentSearchStorage] clear failed:", error);
  }
}
