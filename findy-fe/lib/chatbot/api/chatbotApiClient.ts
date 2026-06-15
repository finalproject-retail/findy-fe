import { API_TIMEOUT_MS } from "@/constants/api";
import { getUserApiBaseUrl } from "@/constants/userApi";
import { getAccessToken } from "@/lib/api/client";
import { handleUnauthorizedApiError } from "@/lib/api/unauthorizedSession";
import { create } from "axios";

/** 챗봇 API — Authorization(JWT)만, X-USER-ID 미전송 */
export const chatbotApiClient = create({
  baseURL: getUserApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

chatbotApiClient.interceptors.request.use((config) => {
  if (config.headers) {
    delete config.headers["X-User-Id"];
    delete config.headers["x-user-id"];
    delete config.headers["X-USER-ID"];
  }

  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  return config;
});

chatbotApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    await handleUnauthorizedApiError(error);
    return Promise.reject(error);
  },
);
