import { buildCartZoneItem } from "@/components/category";
import type { Product } from "@/components/product";
import type { ProductSpec } from "@/components/product/types";
import type {
  CartApi,
  ShoppingLineItem,
  ShoppingListApi,
  ShoppingProductApi,
  ShoppingProductSummaryApi,
  TripZoneLineItem,
} from "@/lib/shopping/types";
import { resolveShoppingListItemProductId } from "@/lib/shopping/types";

import { resolveProductImageSource } from "@/lib/products/resolveProductImage";

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildProductName(product: Pick<ShoppingProductSummaryApi, "brandName" | "productName">) {
  if (!product.brandName) return product.productName;
  if (product.productName.includes(product.brandName)) return product.productName;
  return `[${product.brandName}] ${product.productName}`;
}

function buildSpec(product: Partial<ShoppingProductApi>): ProductSpec | undefined {
  if (
    !product.packagingType &&
    !product.salesUnit &&
    !product.volume &&
    !product.allergyInfo
  ) {
    return undefined;
  }

  return {
    packagingType: product.packagingType ?? "-",
    salesUnit: product.salesUnit ?? "-",
    weightCapacity: product.volume ?? "-",
    allergyInfo: product.allergyInfo ?? "-",
  };
}

export function mapShoppingProductToProduct(
  product: ShoppingProductSummaryApi | ShoppingProductApi,
): Product {
  const originalPrice = product.originalPrice ?? 0;
  const discountPercent = Math.round(toNumber(product.discountRate));

  return {
    id: String(product.productId),
    barcode: "barcode" in product ? product.barcode ?? null : null,
    name: buildProductName(product),
    image: resolveProductImageSource(product.imageUrl),
    discountPercent,
    price: originalPrice,
    originalPrice,
    couponPrice: originalPrice,
    stockCount: product.stockQuantity ?? 0,
    category:
      "categoryId" in product && product.categoryId != null
        ? `카테고리 ${product.categoryId}`
        : undefined,
    gridId: product.gridId ?? null,
    spec: buildSpec(product),
  };
}

export function mapCartApiToLineItems(cart: CartApi): ShoppingLineItem[] {
  return cart.items.map((item) => ({
    productId: String(item.productId),
    cartItemId: String(item.cartItemId),
    product: mapShoppingProductToProduct(item.product),
    quantity: item.quantity,
    selected: item.checked,
  }));
}

/** API 응답을 반영하되, 기존 장바구니 표시 순서를 유지합니다. */
export function mergeCartApiIntoLineItems(
  previous: ReadonlyArray<Pick<ShoppingLineItem, "productId" | "cartItemId">>,
  cart: CartApi,
): ShoppingLineItem[] {
  const mapped = mapCartApiToLineItems(cart);
  const byCartItemId = new Map(
    mapped
      .filter((item) => item.cartItemId)
      .map((item) => [item.cartItemId!, item] as const),
  );
  const byProductId = new Map(
    mapped.map((item) => [item.productId, item] as const),
  );

  const seen = new Set<string>();
  const ordered: ShoppingLineItem[] = [];

  for (const prev of previous) {
    const updated =
      (prev.cartItemId ? byCartItemId.get(prev.cartItemId) : undefined) ??
      byProductId.get(prev.productId);
    if (!updated) {
      continue;
    }

    const key = updated.cartItemId ?? updated.productId;
    ordered.push(updated);
    seen.add(key);
  }

  for (const item of mapped) {
    const key = item.cartItemId ?? item.productId;
    if (!seen.has(key)) {
      ordered.push(item);
    }
  }

  return ordered;
}

function isCategoryShoppingListItem(
  item: ShoppingListApi["items"][number],
): boolean {
  return item.itemType === "CATEGORY" || item.category != null;
}

export function mapShoppingListApiToLineItems(
  shoppingList: ShoppingListApi,
): ShoppingLineItem[] {
  return shoppingList.items.flatMap((item) => {
    if (isCategoryShoppingListItem(item)) {
      return [];
    }

    const productId = resolveShoppingListItemProductId(item);
    if (productId == null || item.product == null) {
      return [];
    }

    return [
      {
        productId: String(productId),
        shoppingListItemId: String(item.shoppingListItemId),
        product: mapShoppingProductToProduct(item.product),
        quantity: item.quantity,
        selected: true,
        scannedQuantity: item.scannedQuantity ?? 0,
        scanStatus: item.scanStatus,
      },
    ];
  });
}

export function mapShoppingListApiToCategoryLineItems(
  shoppingList: ShoppingListApi,
): TripZoneLineItem[] {
  return shoppingList.items.flatMap((item) => {
    if (!isCategoryShoppingListItem(item) || item.category == null) {
      return [];
    }

    const categoryId = item.category.categoryId;
    if (categoryId == null) {
      return [];
    }

    const fromCatalog = buildCartZoneItem(categoryId);
    const zone: TripZoneLineItem = fromCatalog ?? {
      categoryId,
      label: item.category.categoryName,
      path: item.category.categoryName,
      topLabel: "",
      middleLabel: "",
      emoji: "📍",
    };

    return [
      {
        ...zone,
        shoppingListItemId: String(item.shoppingListItemId),
      },
    ];
  });
}
