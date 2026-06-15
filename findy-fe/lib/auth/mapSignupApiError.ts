import { isAxiosError } from "axios";

type SignupErrorPayload = {
  message?: string | string[];
  code?: string;
  errors?: Array<{ field?: string; defaultMessage?: string; message?: string }>;
};

export const DUPLICATE_EMAIL_SIGNUP_MESSAGE = "이미 존재하는 이메일입니다.";

export type SignupFieldError = {
  field: "email" | "general";
  message: string;
};

function extractSignupErrorMessage(
  data: SignupErrorPayload | undefined,
  error: unknown,
): string {
  if (data?.errors?.length) {
    const lines = data.errors
      .map((item) => item.defaultMessage ?? item.message)
      .filter((line): line is string => Boolean(line));
    if (lines.length > 0) {
      return lines.join("\n");
    }
  }
  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }
  if (Array.isArray(data?.message)) {
    return data.message.filter(Boolean).join("\n");
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "";
}

function isDuplicateEmailSignupPayload(data: SignupErrorPayload | undefined): boolean {
  if (!data) {
    return false;
  }

  const code = data.code?.toUpperCase() ?? "";
  if (
    code.includes("EMAIL") &&
    (code.includes("EXIST") ||
      code.includes("DUPLICATE") ||
      code.includes("ALREADY"))
  ) {
    return true;
  }

  const message = extractSignupErrorMessage(data, null);
  const haystack = `${message} ${code}`.toLowerCase();

  if (
    /already.*exist|already.*registered|duplicate.*email|email.*already|exist.*email|email.*duplicate|user.*exist/.test(
      haystack,
    ) ||
    /이미.*(가입|등록|사용).*이메일|이미 존재|중복.*이메일|이메일.*중복|사용 중인 이메일|존재하는 이메일/.test(
      haystack,
    )
  ) {
    return true;
  }

  return (
    data.errors?.some((item) => {
      const field = item.field?.toLowerCase() ?? "";
      const text = `${item.defaultMessage ?? ""} ${item.message ?? ""}`.toLowerCase();
      return field.includes("email") && /exist|duplicate|already|이미|중복/.test(text);
    }) ?? false
  );
}

export function mapSignupApiError(error: unknown): SignupFieldError {
  const data = isAxiosError(error)
    ? (error.response?.data as SignupErrorPayload | undefined)
    : undefined;

  if (isDuplicateEmailSignupPayload(data)) {
    return { field: "email", message: DUPLICATE_EMAIL_SIGNUP_MESSAGE };
  }

  const message = extractSignupErrorMessage(data, error);
  if (/^회원가입 실패 \(HTTP \d+\)$/.test(message)) {
    return { field: "general", message: "회원가입 중 오류가 발생했습니다." };
  }

  return {
    field: "general",
    message: message || "회원가입 중 오류가 발생했습니다.",
  };
}
