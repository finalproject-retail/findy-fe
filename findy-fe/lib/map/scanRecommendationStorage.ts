import type { Product } from "@/components/product";
import type { RecommendedMapItem } from "@/components/store-map/overlays/types";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX = "findy_map_scan_recommendations";

type PersistedProduct = Omit<Product, "image" | "detailImages"> & {
  imageUrl?: string | null;
};

export type ScanRecommendationsSnapshot = {
  storeId: number;
  shoppingListId: number;
  items: RecommendedMapItem[];
  productsById: Record<string, Product>;
};

export type PersistedScanRecommendations = {
  storeId: number;
  shoppingListId: number;
  items: RecommendedMapItem[];
  productsById: Record<string, PersistedProduct>;
};

function storageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

function isRecommendedMapItem(value: unknown): value is RecommendedMapItem {
  if (typeof value !== "object" || value == null) {
    return false;
  }

  const item = value as Partial<RecommendedMapItem>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.gridX === "number" &&
    typeof item.gridY === "number"
  );
}

function isPersistedProduct(value: unknown): value is PersistedProduct {
  if (typeof value !== "object" || value == null) {
    return false;
  }

  const product = value as Partial<PersistedProduct>;
  return typeof product.id === "string" && typeof product.name === "string";
}

function isPersistedPayload(value: unknown): value is PersistedScanRecommendations {
  if (typeof value !== "object" || value == null) {
    return false;
  }

  const payload = value as Partial<PersistedScanRecommendations>;
  if (
    typeof payload.storeId !== "number" ||
    typeof payload.shoppingListId !== "number" ||
    !Array.isArray(payload.items) ||
    typeof payload.productsById !== "object" ||
    payload.productsById == null
  ) {
    return false;
  }

  return payload.items.every(isRecommendedMapItem);
}

function serializeProduct(product: Product): PersistedProduct {
  const imageUri =
    typeof product.image === "object" &&
    product.image != null &&
    "uri" in product.image &&
    typeof product.image.uri === "string"
      ? product.image.uri
      : null;

  const { image: _image, detailImages: _detailImages, ...rest } = product;
  return {
    ...rest,
    imageUrl: imageUri,
  };
}

function deserializeProduct(product: PersistedProduct): Product {
  const { imageUrl, ...rest } = product;
  return {
    ...rest,
    image: resolveProductImageSource(imageUrl),
  };
}

export function mergeScanRecommendationItems(
  current: ReadonlyArray<RecommendedMapItem>,
  persisted: ReadonlyArray<RecommendedMapItem>,
): RecommendedMapItem[] {
  const promotions = current.filter((item) => item.source === "promotion");
  const scans = current.filter((item) => item.source !== "promotion");
  const scanIds = new Set(scans.map((item) => item.id));

  const mergedScans = [
    ...scans,
    ...persisted
      .filter((item) => item.source !== "promotion" && !scanIds.has(item.id))
      .map((item) => ({ ...item, source: "scan" as const })),
  ];

  return [...promotions, ...mergedScans];
}

export async function loadScanRecommendations(
  userId: string,
  storeId: number,
  shoppingListId: number,
): Promise<PersistedScanRecommendations | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isPersistedPayload(parsed)) {
      return null;
    }

    if (
      parsed.storeId !== storeId ||
      parsed.shoppingListId !== shoppingListId
    ) {
      return null;
    }

    const productsById: Record<string, PersistedProduct> = {};
    for (const [productId, product] of Object.entries(parsed.productsById)) {
      if (isPersistedProduct(product)) {
        productsById[productId] = product;
      }
    }

    return {
      storeId: parsed.storeId,
      shoppingListId: parsed.shoppingListId,
      items: parsed.items.map((item) => ({
        ...item,
        source: item.source === "promotion" ? "promotion" : "scan",
      })),
      productsById,
    };
  } catch {
    return null;
  }
}

export async function saveScanRecommendations(
  userId: string,
  payload: ScanRecommendationsSnapshot,
): Promise<void> {
  try {
    const productsById: Record<string, PersistedProduct> = {};
    for (const [productId, product] of Object.entries(payload.productsById)) {
      productsById[productId] = serializeProduct(product);
    }

    await AsyncStorage.setItem(
      storageKey(userId),
      JSON.stringify({
        storeId: payload.storeId,
        shoppingListId: payload.shoppingListId,
        items: payload.items.map((item) => ({
          ...item,
          source: item.source === "promotion" ? "promotion" : "scan",
        })),
        productsById,
      } satisfies PersistedScanRecommendations),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn("[scanRecommendationStorage] save failed:", error);
    }
  }
}

export async function clearScanRecommendations(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(storageKey(userId));
  } catch (error) {
    if (__DEV__) {
      console.warn("[scanRecommendationStorage] clear failed:", error);
    }
  }
}

export function deserializeScanRecommendationProducts(
  productsById: Record<string, PersistedProduct>,
): Record<string, Product> {
  const next: Record<string, Product> = {};
  for (const [productId, product] of Object.entries(productsById)) {
    next[productId] = deserializeProduct(product);
  }
  return next;
}
