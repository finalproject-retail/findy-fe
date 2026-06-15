import axios from "axios";
import {
  PublicUserApiError,
  publicUserApiPost,
} from "./publicUserApiFetch";

export type EmailVerificationPurpose = "SIGN_UP" | "PASSWORD_RESET";

type EmailVerificationCodeData = {
  email: string;
  purpose?: EmailVerificationPurpose;
  expiredAt?: string;
  debugCode?: string;
};

type EmailVerificationVerifyData = {
  email: string;
  purpose?: EmailVerificationPurpose;
  verified: boolean;
  verifiedExpiresAt?: string;
};

type PasswordResetVerificationCodeData = {
  email: string;
  purpose?: EmailVerificationPurpose;
  expiresAt?: string;
  debugCode?: string;
};

type PasswordResetVerifyData = {
  email: string;
  purpose?: EmailVerificationPurpose;
  verified: boolean;
  verifiedExpiresAt?: string;
};

type PasswordResetData = {
  email: string;
  updatedAt?: string;
};

export function getAuthApiErrorCode(error: unknown): string | undefined {
  if (error instanceof PublicUserApiError) {
    return error.errorCode;
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { errorCode?: string; code?: string }
      | undefined;
    return data?.errorCode ?? data?.code;
  }
  return undefined;
}

/** 가입되지 않은 이메일 (PASSWORD_RESET 코드 발송 시 404) */
export function isMemberNotFoundError(error: unknown): boolean {
  if (error instanceof PublicUserApiError) {
    return error.status === 404 || error.errorCode === "MEMBER_NOT_FOUND";
  }
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return true;
  }
  return getAuthApiErrorCode(error) === "MEMBER_NOT_FOUND";
}

/** POST /api/v1/auth/email/verification-code */
export async function postEmailVerificationCode(
  email: string,
  purpose: EmailVerificationPurpose,
): Promise<EmailVerificationCodeData> {
  return publicUserApiPost(
    "/api/v1/auth/email/verification-code",
    { email, purpose },
    "인증 코드 발송에 실패했습니다.",
  );
}

/** POST /api/v1/auth/email/verification-code/verify */
export async function postEmailVerificationCodeVerify(
  email: string,
  purpose: EmailVerificationPurpose,
  code: string,
): Promise<EmailVerificationVerifyData> {
  return publicUserApiPost(
    "/api/v1/auth/email/verification-code/verify",
    { email, purpose, code },
    "인증 코드 확인에 실패했습니다.",
  );
}

/** POST /api/v1/auth/password-reset/verification-code */
export async function postPasswordResetVerificationCode(
  email: string,
): Promise<PasswordResetVerificationCodeData> {
  return publicUserApiPost(
    "/api/v1/auth/password-reset/verification-code",
    { email },
    "인증 코드 발송에 실패했습니다.",
  );
}

/** POST /api/v1/auth/password-reset/verification-code/verify */
export async function postPasswordResetVerificationCodeVerify(
  email: string,
  code: string,
): Promise<PasswordResetVerifyData> {
  return publicUserApiPost(
    "/api/v1/auth/password-reset/verification-code/verify",
    { email, code },
    "인증 코드 확인에 실패했습니다.",
  );
}

export type PasswordResetPayload = {
  email: string;
  newPassword: string;
  newPasswordConfirm: string;
};

/** POST /api/v1/auth/password-reset */
export async function postPasswordReset(
  payload: PasswordResetPayload,
): Promise<PasswordResetData> {
  return publicUserApiPost(
    "/api/v1/auth/password-reset",
    payload,
    "비밀번호 변경에 실패했습니다.",
    { requireData: false },
  );
}
