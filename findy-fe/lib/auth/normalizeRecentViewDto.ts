import type { RecentViewApiDto } from "@/lib/auth/types";

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function normalizeRecentViewDto(raw: unknown): RecentViewApiDto | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const productId = readNumber(item.productId ?? item.product_id);
  const productName = readString(item.productName ?? item.product_name);
  const price = readNumber(item.price ?? item.salePrice ?? item.sale_price) ?? 0;
  const thumbnailUrl = readString(item.thumbnailUrl ?? item.thumbnail_url);
  const viewedAt = readString(item.viewedAt ?? item.viewed_at);

  if (productId == null || !productName) {
    return null;
  }

  return {
    productId,
    productName,
    price,
    thumbnailUrl,
    viewedAt: viewedAt ?? "",
  };
}

export function extractRecentViewsList(data: unknown): RecentViewApiDto[] {
  if (Array.isArray(data)) {
    return data
      .map(normalizeRecentViewDto)
      .filter((item): item is RecentViewApiDto => item != null);
  }

  if (data && typeof data === "object") {
    const wrapped = data as Record<string, unknown>;
    const nested =
      wrapped.recentViews ??
      wrapped.recent_views ??
      wrapped.items ??
      wrapped.content;
    if (Array.isArray(nested)) {
      return nested
        .map(normalizeRecentViewDto)
        .filter((item): item is RecentViewApiDto => item != null);
    }
  }

  return [];
}
