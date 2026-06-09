import { useAuth } from "@/contexts/AuthContext";

/** 저장된 세션 복구·프로필 동기화가 끝난 뒤에만 API 호출 */
export function useAuthReady() {
  const { isLoggedIn, isLoading, isProfileLoading, accessToken } = useAuth();

  return (
    !isLoading &&
    isLoggedIn &&
    !isProfileLoading &&
    typeof accessToken === "string" &&
    accessToken.length > 0
  );
}
