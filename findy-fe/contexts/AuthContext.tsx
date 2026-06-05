import {
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
} from "@/lib/admin/adminSession";
import { setAccessToken } from "@/lib/api/client";
import { fetchMyProfile } from "@/lib/auth/api/fetchMyProfile";
import { clearAccountCache } from "@/lib/auth/clearAccountCache";
import { isInvalidStoredSessionError } from "@/lib/auth/isInvalidStoredSessionError";
import {
  resolveNeedsOnboarding,
  withOnboardingFlag,
} from "@/lib/auth/resolveNeedsOnboarding";
import {
  clearStoredSession,
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
  isAdminSession: boolean;
  accessToken: string | null;
  signIn: (token: string, options?: { asAdmin?: boolean }) => Promise<void>;
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
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const syncProfileStatus = useCallback(async (): Promise<UserProfile> => {
    setIsProfileLoading(true);
    try {
      const profile = await fetchMyProfile();
      const needsOnboarding = await resolveNeedsOnboarding(profile);
      setNeedsOnboarding(needsOnboarding);
      return withOnboardingFlag(profile, needsOnboarding);
    } catch {
      setNeedsOnboarding(false);
      throw new Error("회원 정보를 불러오지 못했습니다.");
    } finally {
      setIsProfileLoading(false);
    }
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
  }, []);

  const signIn = useCallback(
    async (token: string, options?: { asAdmin?: boolean }) => {
      const asAdmin = options?.asAdmin ?? false;
      await saveStoredSession(token);
      await saveAdminSession(asAdmin);
      setAccessToken(token);
      setAccessTokenState(token);
      setIsLoggedIn(true);
      setIsAdminSession(asAdmin);
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
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      isAdminSession,
      accessToken,
      signIn,
      signOut,
      markOnboardingComplete,
      refreshProfile: syncProfileStatus,
    }),
    [accessToken, isAdminSession, isLoading, isLoggedIn, signIn, signOut],
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
