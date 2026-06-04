import { useAuth } from "@/contexts/AuthContext";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_RECENT_SEARCHES = ["사리곰탕", "오레오", "갈비살", "차돌박이", "김"];
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
  const { isLoggedIn, isLoading } = useAuth();
  const [recentSearches, setRecentSearches] = useState<string[]>(
    DEFAULT_RECENT_SEARCHES,
  );

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)];
      return next.slice(0, MAX_RECENT);
    });
  }, []);

  const removeRecentSearch = useCallback((term: string) => {
    setRecentSearches((prev) => prev.filter((item) => item !== term));
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
  }, []);

  useEffect(
    () => registerAccountCacheClearListener(clearRecentSearches),
    [clearRecentSearches],
  );

  useEffect(() => {
    if (isLoading || isLoggedIn) {
      return;
    }
    clearRecentSearches();
  }, [clearRecentSearches, isLoading, isLoggedIn]);

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
