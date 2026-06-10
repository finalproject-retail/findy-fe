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
  const nested =
    item.product && typeof item.product === "object"
      ? (item.product as Record<string, unknown>)
      : null;

  const productId = readNumber(item.productId ?? item.product_id);
  const productName =
    readString(item.productName ?? item.product_name) ??
    (nested
      ? readString(nested.productName ?? nested.product_name)
      : null);
  const brandName =
    readString(item.brandName ?? item.brand_name) ??
    (nested ? readString(nested.brandName ?? nested.brand_name) : null);
  const price =
    readNumber(item.price ?? item.salePrice ?? item.sale_price) ??
    (nested
      ? readNumber(
          nested.salePrice ??
            nested.sale_price ??
            nested.originalPrice ??
            nested.original_price,
        )
      : null) ??
    0;
  const thumbnailUrl =
    readString(item.thumbnailUrl ?? item.thumbnail_url) ??
    (nested ? readString(nested.imageUrl ?? nested.image_url) : null);
  const viewedAt = readString(item.viewedAt ?? item.viewed_at);
  const stockCount =
    readNumber(
      item.stockCount ??
        item.stock_count ??
        item.stockQuantity ??
        item.stock_quantity,
    ) ??
    (nested
      ? readNumber(
          nested.stockQuantity ??
            nested.stock_quantity ??
            nested.stockCount ??
            nested.stock_count,
        )
      : null);
  const saleStatus =
    readString(item.saleStatus ?? item.sale_status) ??
    (nested ? readString(nested.saleStatus ?? nested.sale_status) : null);
  const stockStatus =
    readString(item.stockStatus ?? item.stock_status) ??
    (nested ? readString(nested.stockStatus ?? nested.stock_status) : null);

  if (productId == null || !productName) {
    return null;
  }

  return {
    productId,
    productName,
    brandName,
    price,
    thumbnailUrl,
    viewedAt: viewedAt ?? "",
    stockCount: stockCount ?? undefined,
    saleStatus,
    stockStatus,
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
