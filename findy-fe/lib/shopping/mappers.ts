import { buildCartZoneItem } from "@/components/category";
import type { Product } from "@/components/product";
import type { ProductSpec } from "@/components/product/types";
import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import type { CartLineItem } from "@/contexts/CartContext";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import {
  DEFAULT_PRODUCT_PLACEHOLDER,
  resolveProductImageSource,
} from "@/lib/products/resolveProductImage";
import { isCategoryLineItem } from "@/lib/shopping/shoppingListItemUtils";
import type {
  CartApi,
  ShoppingListApi,
  ShoppingListItemApi,
  ShoppingProductApi,
  ShoppingProductSummaryApi,
  TripZoneLineItem,
} from "@/lib/shopping/types";

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildProductName(
  product: Pick<ShoppingProductSummaryApi, "brandName" | "productName">,
) {
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
    barcode: "barcode" in product ? (product.barcode ?? null) : null,
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

export function mapCartApiToLineItems(cart: CartApi): CartLineItem[] {
  return cart.items.map((item) => ({
    itemType: "PRODUCT" as const,
    productId: String(item.productId),
    cartItemId: String(item.cartItemId),
    product: mapShoppingProductToProduct(item.product),
    quantity: item.quantity,
    selected: item.checked,
  }));
}

/** API 응답을 반영하되, 기존 장바구니 표시 순서를 유지합니다. */
export function mergeCartApiIntoLineItems(
  previous: ReadonlyArray<CartLineItem>,
  cart: CartApi,
): CartLineItem[] {
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
  const ordered: CartLineItem[] = [];

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

function buildCategoryPlaceholderProduct(
  categoryId: number,
  categoryName: string,
  gridId?: number | null,
): Product {
  return {
    id: `zone-${categoryId || "custom"}`,
    name: categoryName,
    image: DEFAULT_PRODUCT_PLACEHOLDER,
    discountPercent: 0,
    price: 0,
    originalPrice: 0,
    couponPrice: 0,
    stockCount: 1,
    category: categoryName,
    gridId: gridId ?? null,
  };
}

function isCategoryShoppingListItem(item: ShoppingListItemApi): boolean {
  if (item.itemType === "CATEGORY") {
    return true;
  }

  return item.category != null && item.product == null;
}

function mapShoppingListItemApiToLineItem(
  item: ShoppingListItemApi,
): CartLineItem {
  if (isCategoryShoppingListItem(item) && item.category) {
    const categoryId = item.category.categoryId ?? 0;

    return {
      itemType: "CATEGORY",
      productId: `zone-${categoryId || item.shoppingListItemId}`,
      shoppingListItemId: String(item.shoppingListItemId),
      product: buildCategoryPlaceholderProduct(
        categoryId,
        item.category.categoryName,
        item.category.gridId,
      ),
      quantity: item.quantity,
      selected: true,
      checked: item.checked,
      scanStatus: item.scanStatus,
      category: {
        categoryId,
        categoryName: item.category.categoryName,
        gridId: item.category.gridId,
      },
    };
  }

  const product = item.product;
  if (!product) {
    throw new Error("쇼핑리스트 항목을 불러오지 못했습니다.");
  }

  return {
    itemType: "PRODUCT",
    productId: String(product.productId),
    shoppingListItemId: String(item.shoppingListItemId),
    product: mapShoppingProductToProduct(product),
    quantity: item.quantity,
    selected: true,
    scannedQuantity: item.scannedQuantity ?? 0,
    scanStatus: item.scanStatus,
    checked: item.checked,
  };
}

export function mapShoppingListApiToLineItems(
  shoppingList: ShoppingListApi,
): CartLineItem[] {
  return shoppingList.items.map(mapShoppingListItemApiToLineItem);
}

export function tripZoneItemsFromLineItems(
  lineItems: CartLineItem[],
): TripZoneLineItem[] {
  return lineItems.flatMap((item) => {
    if (!isCategoryLineItem(item) || item.category == null) {
      return [];
    }

    const fromCatalog = buildCartZoneItem(item.category.categoryId);
    const zone: TripZoneLineItem = fromCatalog ?? {
      categoryId: item.category.categoryId,
      label: item.category.categoryName,
      path: item.category.categoryName,
      topLabel: "",
      middleLabel: "",
      emoji: "📍",
    };

    return [
      {
        ...zone,
        gridId: item.category.gridId ?? null,
        shoppingListItemId: item.shoppingListItemId,
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
        gridId: item.category.gridId ?? null,
        shoppingListItemId: String(item.shoppingListItemId),
      },
    ];
  });
}

function resolveLineItemGridId(item: CartLineItem): number | null {
  if (isCategoryLineItem(item)) {
    return item.category?.gridId ?? item.product.gridId ?? null;
  }
  return item.product.gridId ?? null;
}

/** 쇼핑리스트 API 항목 순서·gridId 그대로 지도 마커로 변환 */
export function mapShoppingListLineItemsToMapItems(
  lineItems: CartLineItem[],
  gridCols = getEmartStoreMapConfig().cols,
): ShoppingMapItem[] {
  return lineItems.map((item, index) => {
    const gridId = resolveLineItemGridId(item);
    const name = isCategoryLineItem(item)
      ? (item.category?.categoryName ?? item.product.name)
      : item.product.name;

    if (gridId == null) {
      if (__DEV__) {
        console.warn(
          `[mapShoppingListLineItemsToMapItems] gridId 없음: ${item.productId}`,
        );
      }
      return {
        id: item.productId,
        name,
        gridX: 1,
        gridY: 16,
        visitOrder: index + 1,
      };
    }

    const { gridX, gridY } = gridIdToGridPoint(gridId, gridCols);
    return {
      id: item.productId,
      name,
      gridX,
      gridY,
      gridId,
      visitOrder: index + 1,
    };
  });
}

export function categoryLineItemsToMapItems(
  items: CartLineItem[],
): ShoppingMapItem[] {
  return mapShoppingListLineItemsToMapItems(
    items.filter(isCategoryLineItem),
  );
}
