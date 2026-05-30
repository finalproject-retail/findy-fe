import { getAccessToken } from "@/lib/api/client";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/** 로그인·회원가입 등 인증 없이 호출하는 경로 */
const PUBLIC_AUTH_PATHS = ["/api/v1/auth/login", "/api/v1/users/signup"] as const;

function isPublicAuthRequest(url?: string) {
  if (!url) {
    return false;
  }
  const path = url.split("?")[0] ?? url;
  return PUBLIC_AUTH_PATHS.some(
    (publicPath) => path === publicPath || path.endsWith(publicPath),
  );
}

function stripAuthorizationHeader(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    delete config.headers.Authorization;
    delete config.headers.authorization;
  }
}

/** axios 인스턴스 요청마다 `Authorization: Bearer <token>` 자동 첨부 (공개 auth API 제외) */
export function attachAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    if (isPublicAuthRequest(config.url)) {
      stripAuthorizationHeader(config);
      return config;
    }

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
