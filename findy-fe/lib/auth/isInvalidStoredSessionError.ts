import { isAxiosError } from "axios";

/** 저장된 토큰으로 /users/me 호출이 거절될 때 (삭제·만료·권한 없음) */
export function isInvalidStoredSessionError(error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return status === 401 || status === 403 || status === 404;
  }
  return false;
}
