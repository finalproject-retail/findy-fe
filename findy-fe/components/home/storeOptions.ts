/** 비로그인·API 실패 시 map-service 기본 시드 매장 */
export const FALLBACK_STORE_ID = 1;

export type HomeStoreOption = {
  id: number;
  label: string;
};

export function toHomeStoreOptions(
  stores: Array<{ storeId: number; storeName: string }>,
): HomeStoreOption[] {
  return stores.map((store) => ({
    id: store.storeId,
    label: store.storeName,
  }));
}
