import { usePoints } from "@/contexts/PointsContext";
import { fetchMyProfile } from "@/lib/auth/api/fetchMyProfile";
import type { UserProfile } from "@/lib/auth/types";
import { useCallback, useState } from "react";

export function useMypageProfile() {
  const { syncReward } = usePoints();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMyProfile();
      setProfile(data);
      syncReward(data.reward);
    } catch (err) {
      setProfile(null);
      setError(
        err instanceof Error ? err.message : "회원 정보를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [syncReward]);

  return { profile, loading, error, reload };
}
