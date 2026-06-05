import type { Product } from "@/components/product";
import type { ProductSpec } from "@/components/product/types";
import { buildCartZoneItem } from "@/components/category";
import { zonesToShoppingMapItems } from "@/components/cart/zonesToShoppingMapItems";
import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import type { CartLineItem } from "@/contexts/CartContext";
import type {
  CartApi,
  ShoppingListApi,
  ShoppingListItemApi,
  ShoppingProductApi,
  ShoppingProductSummaryApi,
} from "@/lib/shopping/types";
import { isCategoryLineItem } from "@/lib/shopping/shoppingListItemUtils";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";

import {
  DEFAULT_PRODUCT_PLACEHOLDER,
  resolveProductImageSource,
} from "@/lib/products/resolveProductImage";

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

export function mapCartApiToLineItems(cart: CartApi): CartLineItem[] {
  return cart.items.map((item) => ({
    productId: String(item.productId),
    cartItemId: String(item.cartItemId),
    product: mapShoppingProductToProduct(item.product),
    quantity: item.quantity,
    selected: item.checked,
  }));
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

export function categoryLineItemsToMapItems(
  items: CartLineItem[],
): ShoppingMapItem[] {
  const config = getEmartStoreMapConfig();

  return items.filter(isCategoryLineItem).map((item, index) => {
    const gridId = item.category?.gridId;
    if (gridId != null) {
      const { gridX, gridY } = gridIdToGridPoint(gridId, config.cols);
      return {
        id: item.productId,
        name: item.category?.categoryName ?? item.product.name,
        gridX,
        gridY,
        gridId,
        visitOrder: index + 1,
      };
    }

    const zone =
      item.category?.categoryId != null
        ? buildCartZoneItem(item.category.categoryId)
        : null;

    if (zone) {
      const [mapItem] = zonesToShoppingMapItems([zone]);
      return {
        ...mapItem,
        visitOrder: index + 1,
      };
    }

    return {
      id: item.productId,
      name: item.category?.categoryName ?? item.product.name,
      gridX: 14,
      gridY: 10,
      visitOrder: index + 1,
    };
  });
}
