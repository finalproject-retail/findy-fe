import { getShoppingApiBaseUrl } from "@/constants/serviceApi";
import { API_TIMEOUT_MS } from "@/constants/api";
import { attachAuthInterceptor } from "@/lib/api/attachAuthInterceptor";
import { getShoppingStoreId } from "@/lib/shopping/shoppingStoreId";
import { create } from "axios";

export const shoppingApiClient = create({
  baseURL: getShoppingApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

attachAuthInterceptor(shoppingApiClient);

shoppingApiClient.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers["X-Store-Id"] = String(getShoppingStoreId());
  }
  return config;
});
