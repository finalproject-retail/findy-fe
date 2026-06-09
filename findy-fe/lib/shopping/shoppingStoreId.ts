import { FALLBACK_STORE_ID } from "@/components/home/storeOptions";

let shoppingStoreId = FALLBACK_STORE_ID;

export function setShoppingStoreId(storeId: number) {
  shoppingStoreId = storeId > 0 ? storeId : FALLBACK_STORE_ID;
}

export function getShoppingStoreId(): number {
  return shoppingStoreId;
}
