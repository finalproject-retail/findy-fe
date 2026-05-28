import {
  MOCK_PURCHASE_HISTORY,
  type PurchaseHistoryRecord,
} from "@/components/purchase-history/mockPurchaseHistory";
import type { CartLineItem } from "@/contexts/CartContext";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type PurchaseHistoryContextValue = {
  records: PurchaseHistoryRecord[];
  addPurchaseFromCheckout: (items: CartLineItem[]) => void;
};

const PurchaseHistoryContext = createContext<PurchaseHistoryContextValue | null>(
  null,
);

function formatPurchasedAt(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function createPurchaseRecordId() {
  return `ph-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function PurchaseHistoryProvider({ children }: PropsWithChildren) {
  const [records, setRecords] = useState(MOCK_PURCHASE_HISTORY);

  const addPurchaseFromCheckout = useCallback((items: CartLineItem[]) => {
    if (items.length === 0) return;

    const purchasedAt = formatPurchasedAt();
    const nextRecords: PurchaseHistoryRecord[] = items.map((line) => ({
      id: createPurchaseRecordId(),
      purchasedAt,
      product: line.product,
      quantity: line.quantity,
    }));

    setRecords((prev) => [...nextRecords, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      records,
      addPurchaseFromCheckout,
    }),
    [records, addPurchaseFromCheckout],
  );

  return (
    <PurchaseHistoryContext.Provider value={value}>
      {children}
    </PurchaseHistoryContext.Provider>
  );
}

export function usePurchaseHistory() {
  const context = useContext(PurchaseHistoryContext);
  if (!context) {
    throw new Error(
      "usePurchaseHistory must be used within PurchaseHistoryProvider",
    );
  }
  return context;
}
