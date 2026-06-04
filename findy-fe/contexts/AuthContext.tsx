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
  isProfileLoading: boolean;
  needsOnboarding: boolean;
  accessToken: string | null;
  signIn: (token: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  markOnboardingComplete: () => void;
  refreshProfile: () => Promise<UserProfile>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
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
        const stored = await loadStoredSession();
        if (cancelled) {
          return;
        }
        if (stored) {
          setAccessToken(stored);
          setAccessTokenState(stored);
          setIsLoggedIn(true);
          setIsProfileLoading(true);
          try {
            const profile = await fetchMyProfile();
            if (!cancelled) {
              const needsOnboarding = await resolveNeedsOnboarding(profile);
              setNeedsOnboarding(needsOnboarding);
            }
          } catch (error) {
            if (!cancelled) {
              if (isInvalidStoredSessionError(error)) {
                await clearStoredSession();
                setAccessToken(null);
                setAccessTokenState(null);
                setIsLoggedIn(false);
                setNeedsOnboarding(false);
              } else {
                setNeedsOnboarding(false);
              }
            }
          } finally {
            if (!cancelled) {
              setIsProfileLoading(false);
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
  }, []);

  const signIn = useCallback(
    async (token: string) => {
      await saveStoredSession(token);
      setAccessToken(token);
      setAccessTokenState(token);
      setIsLoggedIn(true);
      return syncProfileStatus();
    },
    [syncProfileStatus],
  );

  const signOut = useCallback(async () => {
    await clearAccountCache();
    setAccessToken(null);
    setAccessTokenState(null);
    setIsLoggedIn(false);
    setNeedsOnboarding(false);
    setIsProfileLoading(false);
  }, []);

  const markOnboardingComplete = useCallback(() => {
    setNeedsOnboarding(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      isProfileLoading,
      needsOnboarding,
      accessToken,
      signIn,
      signOut,
      markOnboardingComplete,
      refreshProfile: syncProfileStatus,
    }),
    [
      accessToken,
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
