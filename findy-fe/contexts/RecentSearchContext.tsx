import { useAuth } from "@/contexts/AuthContext";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";
import {
  clearRecentSearchesStorage,
  loadRecentSearches,
  saveRecentSearches,
} from "@/lib/search/recentSearchStorage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const MAX_RECENT = 10;

type RecentSearchContextValue = {
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  removeRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
};

const RecentSearchContext = createContext<RecentSearchContextValue | null>(
  null,
);

export function RecentSearchProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading, accessToken } = useAuth();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const userIdRef = useRef<string | null>(null);

  const persistForCurrentUser = useCallback((terms: string[]) => {
    const userId = userIdRef.current;
    if (!userId) {
      return;
    }
    void saveRecentSearches(userId, terms);
  }, []);

  const addRecentSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) {
        return;
      }

      setRecentSearches((prev) => {
        const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(
          0,
          MAX_RECENT,
        );
        persistForCurrentUser(next);
        return next;
      });
    },
    [persistForCurrentUser],
  );

  const removeRecentSearch = useCallback(
    (term: string) => {
      setRecentSearches((prev) => {
        const next = prev.filter((item) => item !== term);
        persistForCurrentUser(next);
        return next;
      });
    },
    [persistForCurrentUser],
  );

  const clearRecentSearches = useCallback(() => {
    const userId = userIdRef.current;
    setRecentSearches([]);
    if (userId) {
      void clearRecentSearchesStorage(userId);
    }
  }, []);

  useEffect(
    () => registerAccountCacheClearListener(clearRecentSearches),
    [clearRecentSearches],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isLoggedIn || !accessToken) {
      userIdRef.current = null;
      setRecentSearches([]);
      return;
    }

    const userId = getUserIdFromAccessToken(accessToken);
    if (!userId) {
      userIdRef.current = null;
      setRecentSearches([]);
      return;
    }

    let cancelled = false;
    userIdRef.current = userId;

    void (async () => {
      const stored = await loadRecentSearches(userId);
      if (cancelled) {
        return;
      }
      setRecentSearches((current) => (current.length > 0 ? current : stored));
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, isLoading, isLoggedIn]);

  const value = useMemo(
    () => ({
      recentSearches,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
    }),
    [
      recentSearches,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
    ],
  );

  return (
    <RecentSearchContext.Provider value={value}>
      {children}
    </RecentSearchContext.Provider>
  );
}

export function useRecentSearch() {
  const context = useContext(RecentSearchContext);
  if (!context) {
    throw new Error("useRecentSearch must be used within RecentSearchProvider");
  }
  return context;
}
