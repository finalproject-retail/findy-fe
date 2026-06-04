import { clearStoredSession } from "@/lib/auth/session";

type AccountCacheListener = () => void;

const listeners = new Set<AccountCacheListener>();

/** 로그아웃 시 계정별 in-memory 캐시 초기화용 */
export function registerAccountCacheClearListener(
  listener: AccountCacheListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyAccountCacheClear() {
  for (const listener of listeners) {
    try {
      listener();
    } catch (error) {
      console.error("[clearAccountCache] listener failed:", error);
    }
  }
}

/** 세션 토큰 + 등록된 클라이언트 캐시 일괄 삭제 */
export async function clearAccountCache(): Promise<void> {
  await clearStoredSession();
  notifyAccountCacheClear();
}
