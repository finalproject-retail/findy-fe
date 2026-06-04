import { setAccessToken } from "@/lib/api/client";
import { clearAccountCache } from "@/lib/auth/clearAccountCache";
import { loadStoredSession, saveStoredSession } from "@/lib/auth/session";
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
  accessToken: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

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

  const signIn = useCallback(async (token: string) => {
    await saveStoredSession(token);
    setAccessToken(token);
    setAccessTokenState(token);
    setIsLoggedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await clearAccountCache();
    setAccessToken(null);
    setAccessTokenState(null);
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      accessToken,
      signIn,
      signOut,
    }),
    [accessToken, isLoading, isLoggedIn, signIn, signOut],
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
