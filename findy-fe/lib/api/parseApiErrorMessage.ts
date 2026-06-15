import { PublicUserApiError } from "@/lib/auth/api/publicUserApiFetch";
import { isAxiosError } from "axios";

type ApiErrorPayload = {
  message?: string | string[];
  code?: string;
  errors?: Array<{ field?: string; defaultMessage?: string; message?: string }>;
};

export function parseApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof PublicUserApiError) {
    return error.message;
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorPayload | undefined;
    if (error.response?.status === 401) {
      if (typeof data?.message === "string" && data.message) {
        return data.message;
      }
      if (Array.isArray(data?.message) && data.message.length > 0) {
        return data.message.join("\n");
      }
      return "로그인이 만료되었습니다. 다시 로그인해 주세요.";
    }
    if (data?.errors?.length) {
      const lines = data.errors
        .map((item) => item.defaultMessage ?? item.message)
        .filter((line): line is string => Boolean(line));
      if (lines.length > 0) {
        return lines.join("\n");
      }
    }
    if (typeof data?.message === "string" && data.message) {
      return data.message;
    }
    if (Array.isArray(data?.message)) {
      return data.message.join("\n");
    }
    if (error.response?.status === 500) {
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
