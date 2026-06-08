export type HomeStoreOption = {
  id: string;
  label: string;
  /** shopping / recommendation / map API storeId */
  apiStoreId: number;
};

export const HOME_STORE_OPTIONS: HomeStoreOption[] = [
  { id: "findy-gangnam", label: "FINDY 강남점", apiStoreId: 1 },
  { id: "findy-cheongnyangni", label: "FINDY 청량리점", apiStoreId: 2 },
  { id: "findy-wolgye", label: "FINDY 월계점", apiStoreId: 3 },
  { id: "findy-gasan", label: "FINDY 가산점", apiStoreId: 4 },
  { id: "findy-dongdaipgu", label: "FINDY 동대입구점", apiStoreId: 5 },
];

/** 홈 매장 필터 기본 선택 (강남점) */
export const DEFAULT_HOME_STORE_ID = HOME_STORE_OPTIONS[0]!.id;

/** API storeId 미지정 시 기본값 (강남점 = 1) */
export const DEFAULT_API_STORE_ID = HOME_STORE_OPTIONS[0]!.apiStoreId;

export function resolveHomeApiStoreId(storeId: string): number {
  const found = HOME_STORE_OPTIONS.find((store) => store.id === storeId);
  return found?.apiStoreId ?? DEFAULT_API_STORE_ID;
}
