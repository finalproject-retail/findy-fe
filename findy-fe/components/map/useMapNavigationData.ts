import { useMapNavigation } from "@/contexts/MapNavigationContext";

/**
 * @deprecated Prefer `useMapNavigation` from `@/contexts/MapNavigationContext`.
 * 지도 화면용 — 전역 MapNavigationContext와 동일한 상태를 반환합니다.
 */
export function useMapNavigationData() {
  return useMapNavigation();
}
