import { getApiErrorMessage } from "@/lib/api";
import { isAxiosError } from "axios";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import { parseShoppingProductId } from "@/lib/shopping/parseShoppingProductId";
import { resolveShoppingUserId } from "@/lib/shopping/shoppingUserId";
import type {
  ApiEnvelope,
  CartApi,
  ProductPageApi,
  ShoppingListApi,
  ShoppingProductApi,
} from "@/lib/shopping/types";

export { DEFAULT_USER_ID } from "@/lib/shopping/shoppingUserId";

function userHeaders(userId?: number) {
  return { "X-User-Id": String(resolveShoppingUserId(userId)) };
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data == null) {
    throw new Error(envelope.message ?? "요청에 실패했습니다.");
  }
  return envelope.data;
}

export async function getCart(userId?: number): Promise<CartApi> {
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
  userId?: number,
): Promise<CartApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<CartApi>>(
      "/api/v1/carts/items",
      { productId: parseShoppingProductId(productId), quantity },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function removeCartItem(
  cartItemId: string | number,
  userId?: number,
): Promise<CartApi> {
  try {
    const response = await shoppingApiClient.delete<ApiEnvelope<CartApi>>(
      `/api/v1/carts/items/${cartItemId}`,
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    if (isAxiosError(error)) {
      throw error;
    }
    throw new Error(getApiErrorMessage(error));
  }
}

export async function changeCartItemQuantity(
  cartItemId: string | number,
  quantity: number,
  userId?: number,
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
  userId?: number,
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
  userId?: number,
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
  userId?: number,
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

export async function addCategoryShoppingListItem(
  params: {
    categoryId?: number;
    categoryName?: string;
    quantity?: number;
  },
  userId?: number,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<ShoppingListApi>>(
      "/api/v1/shopping-lists/items/categories",
      {
        categoryId: params.categoryId ?? null,
        categoryName: params.categoryName ?? null,
        quantity: params.quantity ?? 1,
      },
      { headers: userHeaders(userId) },
    );
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function changeShoppingListItemChecked(
  shoppingListItemId: string | number,
  checked: boolean,
  userId?: number,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.patch<ApiEnvelope<ShoppingListApi>>(
      `/api/v1/shopping-lists/items/${shoppingListItemId}/checked`,
      { checked },
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
  userId?: number,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<ShoppingListApi>>(
      "/api/v1/shopping-lists/items",
      { productId: parseShoppingProductId(productId), quantity },
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
  userId?: number,
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
  userId?: number,
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

/** POST /api/v1/shopping-lists/items/{shoppingListItemId}/return-to-cart */
export async function returnShoppingListItemToCart(
  shoppingListItemId: string | number,
  userId?: number,
): Promise<ShoppingListApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<ShoppingListApi>>(
      `/api/v1/shopping-lists/items/${shoppingListItemId}/return-to-cart`,
      undefined,
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
  userId?: number,
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
  userId?: number,
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
  userId?: number,
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
      return { sortBy: "originalPrice", direction: "asc" };
    case "price_desc":
      return { sortBy: "originalPrice", direction: "desc" };
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
  userId?: number,
): Promise<OrderCreateApi> {
  try {
    const response = await shoppingApiClient.post<ApiEnvelope<OrderCreateApi>>(
      "/api/v1/orders",
      userCouponId != null ? { userCouponId } : {},
      { headers: userHeaders(userId) },
    );

    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
