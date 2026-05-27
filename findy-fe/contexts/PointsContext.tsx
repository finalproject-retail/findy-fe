import { MOCK_MYPAGE_USER } from "@/components/mypage/mockUser";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type PointsContextValue = {
  /** 결제 완료 후 반영된 보유 포인트 */
  balance: number;
  /** 이번 쇼핑 중 바코드 당첨 — 결제 전까지 balance에 미반영 */
  pendingBarcodeRewardPoints: number;
  addPendingBarcodeReward: (points: number) => void;
  clearPendingBarcodeRewards: () => void;
  /** 결제 완료 시 호출 — pending을 balance에 합산 */
  commitPendingBarcodeRewards: () => number;
};

const PointsContext = createContext<PointsContextValue | null>(null);

export function PointsProvider({ children }: PropsWithChildren) {
  const [balance, setBalance] = useState(MOCK_MYPAGE_USER.points);
  const [pendingBarcodeRewardPoints, setPendingBarcodeRewardPoints] =
    useState(0);

  const addPendingBarcodeReward = useCallback((points: number) => {
    if (points <= 0) return;
    setPendingBarcodeRewardPoints((prev) => prev + points);
  }, []);

  const clearPendingBarcodeRewards = useCallback(() => {
    setPendingBarcodeRewardPoints(0);
  }, []);

  const commitPendingBarcodeRewards = useCallback(() => {
    let committed = 0;
    setPendingBarcodeRewardPoints((pending) => {
      committed = pending;
      return 0;
    });
    if (committed > 0) {
      setBalance((prev) => prev + committed);
    }
    return committed;
  }, []);

  const value = useMemo(
    () => ({
      balance,
      pendingBarcodeRewardPoints,
      addPendingBarcodeReward,
      clearPendingBarcodeRewards,
      commitPendingBarcodeRewards,
    }),
    [
      balance,
      pendingBarcodeRewardPoints,
      addPendingBarcodeReward,
      clearPendingBarcodeRewards,
      commitPendingBarcodeRewards,
    ],
  );

  return (
    <PointsContext.Provider value={value}>{children}</PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (!context) {
    throw new Error("usePoints must be used within PointsProvider");
  }
  return context;
}
