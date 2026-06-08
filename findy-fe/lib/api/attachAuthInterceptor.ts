import { getAccessToken } from "@/lib/api/client";
import { isPublicAuthRequest } from "@/lib/api/isPublicAuthRequest";
import { handleUnauthorizedApiError } from "@/lib/api/unauthorizedSession";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

function stripAuthorizationHeader(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    delete config.headers.Authorization;
    delete config.headers.authorization;
  }
}

function attachUserIdHeaders(config: InternalAxiosRequestConfig, token: string) {
  const userId = getUserIdFromAccessToken(token);
  if (!userId || !config.headers) {
    return;
  }
  config.headers["X-User-Id"] = userId;
  config.headers["X-USER-ID"] = userId;
}

/** axios 인스턴스 — JWT 첨부 + 인증 만료(401/403) 시 전역 로그아웃 */
export function attachAuthInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      await handleUnauthorizedApiError(error);
      return Promise.reject(error);
    },
  );

  client.interceptors.request.use((config) => {
    if (isPublicAuthRequest(config.url)) {
      stripAuthorizationHeader(config);
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      attachUserIdHeaders(config, token);
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  });
}
