export type HomeStoreOption = {
  id: string;
  label: string;
  /** 향후 shopping-service 매장 필터 연동용 (현재 API는 storeId 미지원) */
  apiStoreId: number;
};

export const HOME_STORE_OPTIONS: HomeStoreOption[] = [
  { id: "findy-cheongnyangni", label: "FINDY 청량리점", apiStoreId: 1 },
  { id: "findy-wolgye", label: "FINDY 월계점", apiStoreId: 2 },
  { id: "findy-gangnam", label: "FINDY 강남점", apiStoreId: 3 },
  { id: "findy-gasan", label: "FINDY 가산점", apiStoreId: 4 },
  { id: "findy-dongdaipgu", label: "FINDY 동대입구점", apiStoreId: 5 },
];

/** API storeId 미지정 시 임시 기본값 (청량리점) */
export const DEFAULT_API_STORE_ID = HOME_STORE_OPTIONS[0]!.apiStoreId;

export function resolveHomeApiStoreId(storeId: string): number {
  const found = HOME_STORE_OPTIONS.find((store) => store.id === storeId);
  return found?.apiStoreId ?? HOME_STORE_OPTIONS[0]!.apiStoreId;
}
