import { getApiErrorMessage } from "@/lib/api";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import type {
  ApiEnvelope,
  CartApi,
  ProductPageApi,
  ShoppingListApi,
  ShoppingProductApi,
} from "@/lib/shopping/types";

export const DEFAULT_USER_ID = Number(
  process.env.EXPO_PUBLIC_DEV_USER_ID?.trim() || 1,
);

function userHeaders(userId = DEFAULT_USER_ID) {
  return { "X-User-Id": String(userId) };
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data == null) {
    throw new Error(envelope.message ?? "요청에 실패했습니다.");
  }
  return envelope.data;
}

export async function getCart(userId = DEFAULT_USER_ID): Promise<CartApi> {
  try {
    const response = await shoppingApiClient.get<ApiEnvelope<CartApi>>("/api/v1/carts", {
      headers: userHeaders(userId),
    });
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function addCartItem(
  productId: string | number,
  quantity = 1,
  userId = DEFAULT_USER_ID,
): Promise<CartApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<CartApi>>(
      "/api/v1/carts/items",
      { productId: Number(productId), quantity },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function removeCartItem(
  cartItemId: string | number,
  userId = DEFAULT_USER_ID,
): Promise<CartApi> {
  try {
    const response = await shoppingApiClient.delete<ApiEnvelope<CartApi>>(
      `/api/v1/carts/items/${cartItemId}`,
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function changeCartItemQuantity(
  cartItemId: string | number,
  quantity: number,
  userId = DEFAULT_USER_ID,
): Promise<CartApi> {
  try {
    const response = await shoppingApiClient.patch<ApiEnvelope<CartApi>>(
      `/api/v1/carts/items/${cartItemId}/quantity`,
      { quantity },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function changeCartItemChecked(
  cartItemId: string | number,
  checked: boolean,
  userId = DEFAULT_USER_ID,
): Promise<CartApi> {
  try {
    const response = await shoppingApiClient.patch<ApiEnvelope<CartApi>>(
      `/api/v1/carts/items/${cartItemId}/check`,
      { checked },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function createShoppingList(
  userId = DEFAULT_USER_ID,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<ShoppingListApi>>(
      "/api/v1/shopping-lists",
      undefined,
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getShoppingList(
  userId = DEFAULT_USER_ID,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.get<ApiEnvelope<ShoppingListApi>>(
      "/api/v1/shopping-lists",
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function addShoppingListItem(
  productId: string | number,
  quantity = 1,
  userId = DEFAULT_USER_ID,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<ShoppingListApi>>(
      "/api/v1/shopping-lists/items",
      { productId: Number(productId), quantity },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function changeShoppingListItemQuantity(
  shoppingListItemId: string | number,
  quantity: number,
  userId = DEFAULT_USER_ID,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.patch<ApiEnvelope<ShoppingListApi>>(
      `/api/v1/shopping-lists/items/${shoppingListItemId}/quantity`,
      { quantity },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function removeShoppingListItem(
  shoppingListItemId: string | number,
  userId = DEFAULT_USER_ID,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.delete<ApiEnvelope<ShoppingListApi>>(
      `/api/v1/shopping-lists/items/${shoppingListItemId}`,
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function scanShoppingListItem(
  barcode: string,
  quantity = 1,
  userId = DEFAULT_USER_ID,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<ShoppingListApi>>(
      "/api/v1/shopping-lists/scan",
      { barcode, quantity },
      { headers: userHeaders(userId) },
    );

    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function decreaseShoppingListItemByScan(
  barcode: string,
  quantity = 1,
  userId = DEFAULT_USER_ID,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<ShoppingListApi>>(
      "/api/v1/shopping-lists/scan/decrease",
      { barcode, quantity },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function cancelShopping(
  userId = DEFAULT_USER_ID,
): Promise<void> {
  try {
    await shoppingApiClient.delete<ApiEnvelope<null>>("/api/v1/shopping-lists", {
      headers: userHeaders(userId),
    });
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export type ProductSearchSort =
  | "popularity"
  | "discount"
  | "price_asc"
  | "price_desc";

function resolveSort(sort: ProductSearchSort) {
  switch (sort) {
    case "discount":
      return { sortBy: "discountRate", direction: "desc" };
    case "price_asc":
      return { sortBy: "salePrice", direction: "asc" };
    case "price_desc":
      return { sortBy: "salePrice", direction: "desc" };
    case "popularity":
    default:
      return { sortBy: "createdAt", direction: "desc" };
  }
}

export async function searchProductsApi(params: {
  keyword: string;
  sort: ProductSearchSort;
  page: number;
  size: number;
}): Promise<ProductPageApi> {
  const { keyword, sort, page, size } = params;
  const { sortBy, direction } = resolveSort(sort);

  const searchParams = new URLSearchParams();

  if (keyword.trim().length > 0) {
    searchParams.append("keyword", keyword.trim());
  }

  searchParams.append("sortBy", sortBy);
  searchParams.append("direction", direction);
  searchParams.append("page", String(page));
  searchParams.append("size", String(size));

  try {
    const response = await shoppingApiClient.get<ApiEnvelope<ProductPageApi>>(
      `/api/v1/products?${searchParams.toString()}`,
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getProductDetailApi(
  productId: string | number,
): Promise<ShoppingProductApi> {
  try {
    const response = await shoppingApiClient.get<ApiEnvelope<ShoppingProductApi>>(
      `/api/v1/products/${productId}`,
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export type OrderCreateApi = {
  orderId: number;
  userId: number;
  shoppingListId: number | null;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  earnedReward: number;
  orderStatus: string;
};

export async function createOrder(
  userCouponId?: number | null,
  userId = DEFAULT_USER_ID,
): Promise<OrderCreateApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<OrderCreateApi>>(
      "/api/v1/orders",
      userCouponId ? { userCouponId } : undefined,
      { headers: userHeaders(userId) },
    );

    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
