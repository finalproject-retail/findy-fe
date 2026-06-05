import {
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
} from "@/lib/admin/adminSession";
import { setAccessToken } from "@/lib/api/client";
import { fetchMyProfile } from "@/lib/auth/api/fetchMyProfile";
import { clearAccountCache } from "@/lib/auth/clearAccountCache";
import {
  resolveNeedsOnboarding,
  withOnboardingFlag,
} from "@/lib/auth/resolveNeedsOnboarding";
import {
  loadStoredSession,
  saveStoredSession,
} from "@/lib/auth/session";
import type { UserProfile } from "@/lib/auth/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  isAdminSession: boolean;
  needsOnboarding: boolean;
  accessToken: string | null;
  signIn: (
    token: string,
    options?: { asAdmin?: boolean; isFirstLogin?: boolean },
  ) => Promise<void>;
  signOut: () => Promise<void>;
  markOnboardingComplete: () => void;
  refreshProfile: () => Promise<UserProfile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const syncProfileStatus = useCallback(async (): Promise<UserProfile> => {
    setIsProfileLoading(true);
    try {
      const profile = await fetchMyProfile();
      const needs = await resolveNeedsOnboarding(profile);
      setNeedsOnboarding(needs);
      return withOnboardingFlag(profile, needs);
    } catch {
      setNeedsOnboarding(false);
      throw new Error("회원 정보를 불러오지 못했습니다.");
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const markOnboardingComplete = useCallback(() => {
    setNeedsOnboarding(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const [stored, adminSession] = await Promise.all([
          loadStoredSession(),
          loadAdminSession(),
        ]);
        if (cancelled) {
          return;
        }

        if (stored) {
          setAccessToken(stored);
          setAccessTokenState(stored);
          setIsLoggedIn(true);
          setIsAdminSession(adminSession);

          if (!adminSession) {
            try {
              await syncProfileStatus();
            } catch {
              // 세션 복원 시 프로필 조회 실패는 로그인 화면에서 재시도
            }
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [syncProfileStatus]);

  const signIn = useCallback(
    async (
      token: string,
      options?: { asAdmin?: boolean; isFirstLogin?: boolean },
    ) => {
      const asAdmin = options?.asAdmin ?? false;
      await saveStoredSession(token);
      await saveAdminSession(asAdmin);
      setAccessToken(token);
      setAccessTokenState(token);
      setIsLoggedIn(true);
      setIsAdminSession(asAdmin);

      if (asAdmin) {
        setNeedsOnboarding(false);
        return;
      }

      if (typeof options?.isFirstLogin === "boolean") {
        setNeedsOnboarding(options.isFirstLogin);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    await clearAccountCache();
    await clearAdminSession();
    setAccessToken(null);
    setAccessTokenState(null);
    setIsLoggedIn(false);
    setIsAdminSession(false);
    setNeedsOnboarding(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      isProfileLoading,
      isAdminSession,
      needsOnboarding,
      accessToken,
      signIn,
      signOut,
      markOnboardingComplete,
      refreshProfile: syncProfileStatus,
    }),
    [
      accessToken,
      isAdminSession,
      isLoading,
      isLoggedIn,
      isProfileLoading,
      markOnboardingComplete,
      needsOnboarding,
      signIn,
      signOut,
      syncProfileStatus,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
