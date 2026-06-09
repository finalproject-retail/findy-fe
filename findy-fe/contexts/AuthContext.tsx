import {
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
} from "@/lib/admin/adminSession";
import { setAccessToken } from "@/lib/api/client";
import {
  setSessionRestoreInProgress,
  setUnauthorizedSessionHandler,
} from "@/lib/api/unauthorizedSession";
import { fetchMyProfile } from "@/lib/auth/api/fetchMyProfile";
import { clearAccountCache } from "@/lib/auth/clearAccountCache";
import { isInvalidStoredSessionError } from "@/lib/auth/isInvalidStoredSessionError";
import {
  resolveNeedsOnboarding,
  withOnboardingFlag,
} from "@/lib/auth/resolveNeedsOnboarding";
import { isAdminRole } from "@/lib/auth/roles";
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
  isAdminUser: boolean;
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

async function syncAdminSessionFromProfile(profile: UserProfile): Promise<boolean> {
  if (!profile.isAdmin) {
    await saveAdminSession(false);
    return false;
  }

  return loadAdminSession();
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const syncProfileStatus = useCallback(async (): Promise<UserProfile> => {
    setIsProfileLoading(true);
    try {
      const profile = await fetchMyProfile();
      const needs = await resolveNeedsOnboarding(profile);
      const adminSession = await syncAdminSessionFromProfile(profile);

      setIsAdminUser(profile.isAdmin);
      setIsAdminSession(adminSession);
      setNeedsOnboarding(needs);

      return withOnboardingFlag(profile, needs);
    } catch (error) {
      if (isInvalidStoredSessionError(error)) {
        setIsAdminUser(false);
        setIsAdminSession(false);
        setNeedsOnboarding(false);
        throw error;
      }

      try {
        const adminSession = await loadAdminSession();
        setIsAdminSession(adminSession);
      } catch {
        setIsAdminSession(false);
      }
      setIsAdminUser(false);
      setNeedsOnboarding(false);
      throw new Error("회원 정보를 불러오지 못했습니다.");
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const markOnboardingComplete = useCallback(() => {
    setNeedsOnboarding(false);
  }, []);

  const signOut = useCallback(async () => {
    await clearAccountCache();
    await clearAdminSession();
    setAccessToken(null);
    setAccessTokenState(null);
    setIsLoggedIn(false);
    setIsAdminSession(false);
    setIsAdminUser(false);
    setNeedsOnboarding(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      setSessionRestoreInProgress(true);
      try {
        const stored = await loadStoredSession();
        if (cancelled) {
          return;
        }

        if (stored) {
          setAccessToken(stored);
          setAccessTokenState(stored);
          setIsLoggedIn(true);

          try {
            await syncProfileStatus();
          } catch (error) {
            if (isInvalidStoredSessionError(error)) {
              await signOut();
            }
          }
        }
      } finally {
        setSessionRestoreInProgress(false);
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [signOut, syncProfileStatus]);

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

  useEffect(() => {
    setUnauthorizedSessionHandler(signOut);
    return () => {
      setUnauthorizedSessionHandler(null);
    };
  }, [signOut]);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      isProfileLoading,
      isAdminSession,
      isAdminUser,
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
      isAdminUser,
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
