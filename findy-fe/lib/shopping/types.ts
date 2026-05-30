import type { Product } from "@/components/product";

export type ApiEnvelope<T> = {
  success: boolean;
  code?: string;
  message?: string;
  data?: T;
};

export type ShoppingProductSummaryApi = {
  productId: number;
  brandName: string | null;
  productName: string;
  barcode?: string | null;
  imageUrl: string | null;
  originalPrice: number | null;
  salePrice: number | null;
  discountRate: number | string | null;
  saleStatus: string;
  stockQuantity: number | null;
  stockStatus: string | null;
  stockBadgeText?: string | null;
};

export type ShoppingProductApi = ShoppingProductSummaryApi & {
  categoryId: number | null;
  barcode: string | null;
  description: string | null;
  packagingType: string | null;
  salesUnit: string | null;
  volume: string | null;
  allergyInfo: string | null;
  badgeText?: string | null;
};

export type ProductPageApi = {
  products: ShoppingProductApi[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type CartItemApi = {
  cartItemId: number;
  productId: number;
  product: ShoppingProductSummaryApi;
  quantity: number;
  checked: boolean;
  itemTotalAmount: number;
};

export type CartApi = {
  cartId: number | null;
  userId: number;
  items: CartItemApi[];
  totalItemCount: number;
  checkedItemCount: number;
  totalQuantity: number;
  totalAmount: number;
  checkedTotalAmount: number;
};

export type ShoppingListScanStatus =
  | "NOT_SCANNED"
  | "PARTIALLY_SCANNED"
  | "SCANNED";

export type ShoppingListItemApi = {
  shoppingListItemId: number;
  productId: number;
  product: ShoppingProductSummaryApi;
  quantity: number;
  scannedQuantity: number;
  scanStatus: ShoppingListScanStatus;
  itemTotalAmount: number;
  scannedAmount: number;
};

export type ShoppingListApi = {
  shoppingListId: number;
  cartId: number;
  totalItemCount: number;
  scannedItemCount: number;
  totalAmount: number;
  scannedAmount: number;
  items: ShoppingListItemApi[];
};

export type ShoppingLineItem = {
  productId: string;
  product: Product;
  quantity: number;
  selected: boolean;
  cartItemId?: string;
  shoppingListItemId?: string;
  scannedQuantity?: number;
  scanStatus?: ShoppingListScanStatus;
};
