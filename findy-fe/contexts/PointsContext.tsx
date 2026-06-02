import { useAuth } from "@/contexts/AuthContext";
import { fetchMyProfile } from "@/lib/auth/api/fetchMyProfile";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type PointsContextValue = {
  /** GET /api/v1/users/me 의 reward (서버 보유 적립금) */
  balance: number;
  /** 이번 쇼핑 중 바코드 당첨 — 결제 전까지 balance에 미반영 */
  pendingBarcodeRewardPoints: number;
  /** /me 조회 후 reward로 balance 동기화 */
  syncReward: (reward: number) => void;
  refreshReward: () => Promise<void>;
  addPendingBarcodeReward: (points: number) => void;
  clearPendingBarcodeRewards: () => void;
  /** 결제 완료 시 pending 초기화 후 서버 reward 재조회 */
  commitPendingBarcodeRewards: () => Promise<number>;
};

const PointsContext = createContext<PointsContextValue | null>(null);

export function PointsProvider({ children }: PropsWithChildren) {
  const { isLoggedIn, isLoading } = useAuth();
  const [balance, setBalance] = useState(0);
  const [pendingBarcodeRewardPoints, setPendingBarcodeRewardPoints] =
    useState(0);

  const syncReward = useCallback((reward: number) => {
    setBalance(Math.max(0, reward));
  }, []);

  const refreshReward = useCallback(async () => {
    if (!isLoggedIn) {
      syncReward(0);
      return;
    }

    try {
      const profile = await fetchMyProfile();
      syncReward(profile.reward);
    } catch {
      // 이전 balance 유지
    }
  }, [isLoggedIn, syncReward]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isLoggedIn) {
      syncReward(0);
      setPendingBarcodeRewardPoints(0);
      return;
    }
    void refreshReward();
  }, [isLoading, isLoggedIn, refreshReward, syncReward]);

  const addPendingBarcodeReward = useCallback((points: number) => {
    if (points <= 0) return;
    setPendingBarcodeRewardPoints((prev) => prev + points);
  }, []);

  const clearPendingBarcodeRewards = useCallback(() => {
    setPendingBarcodeRewardPoints(0);
  }, []);

  const commitPendingBarcodeRewards = useCallback(async () => {
    let committed = 0;
    setPendingBarcodeRewardPoints((pending) => {
      committed = pending;
      return 0;
    });
    if (committed > 0) {
      await refreshReward();
    }
    return committed;
  }, [refreshReward]);

  const value = useMemo(
    () => ({
      balance,
      pendingBarcodeRewardPoints,
      syncReward,
      refreshReward,
      addPendingBarcodeReward,
      clearPendingBarcodeRewards,
      commitPendingBarcodeRewards,
    }),
    [
      balance,
      pendingBarcodeRewardPoints,
      syncReward,
      refreshReward,
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
