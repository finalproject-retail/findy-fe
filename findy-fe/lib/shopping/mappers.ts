import type { Product } from "@/components/product";
import type { ProductSpec } from "@/components/product/types";
import type {
  CartApi,
  ShoppingLineItem,
  ShoppingListApi,
  ShoppingProductApi,
  ShoppingProductSummaryApi,
} from "@/lib/shopping/types";

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

export function mapShoppingListApiToLineItems(
  shoppingList: ShoppingListApi,
): ShoppingLineItem[] {
  return shoppingList.items.map((item) => ({
    productId: String(item.productId),
    shoppingListItemId: String(item.shoppingListItemId),
    product: mapShoppingProductToProduct(item.product),
    quantity: item.quantity,
    selected: true,
    scannedQuantity: item.scannedQuantity,
    scanStatus: item.scanStatus,
  }));
}
