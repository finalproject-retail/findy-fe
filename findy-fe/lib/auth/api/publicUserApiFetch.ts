import { API_TIMEOUT_MS } from "@/constants/api";
import { getUserApiBaseUrl } from "@/constants/userApi";

type PublicApiEnvelope<T> = {
  success?: boolean;
  errorCode?: string;
  code?: string;
  message?: string;
  data?: T;
};

export class PublicUserApiError extends Error {
  status: number;
  errorCode?: string;
  body?: PublicApiEnvelope<unknown>;

  constructor(
    message: string,
    status: number,
    body?: PublicApiEnvelope<unknown>,
  ) {
    super(message);
    this.name = "PublicUserApiError";
    this.status = status;
    this.errorCode = body?.errorCode ?? body?.code;
    this.body = body;
  }
}

/** axios 인터셉터·만료 토큰 영향 없이 공개 auth API 호출 */
export async function publicUserApiPost<T>(
  path: string,
  body: unknown,
  fallbackMessage: string,
  options?: { requireData?: boolean },
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const url = `${getUserApiBaseUrl()}${path}`;

  try {
    if (__DEV__) {
      console.log("[publicUserApiPost]", url, "(Authorization 없음, credentials: omit)");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "omit",
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const json = (await response.json().catch(() => ({}))) as PublicApiEnvelope<T>;
    const requireData = options?.requireData ?? true;

    if (
      response.status >= 400 ||
      json?.success === false ||
      (requireData && !json?.data)
    ) {
      throw new PublicUserApiError(
        json?.message ?? `${fallbackMessage} (HTTP ${response.status})`,
        response.status,
        json,
      );
    }

    return json.data as T;
  } catch (error) {
    if (error instanceof PublicUserApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("요청 시간이 초과되었습니다. 다시 시도해 주세요.");
    }
    throw error instanceof Error ? error : new Error(fallbackMessage);
  } finally {
    clearTimeout(timeoutId);
  }
}
