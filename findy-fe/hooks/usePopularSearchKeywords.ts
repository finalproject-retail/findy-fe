import { fetchPopularKeywords } from "@/lib/products/api/fetchPopularKeywords";
import { useEffect, useState } from "react";

export function usePopularSearchKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const items = await fetchPopularKeywords();
        if (cancelled) {
          return;
        }
        setKeywords(items);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setKeywords([]);
        setError(
          err instanceof Error
            ? err.message
            : "인기 검색어를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { keywords, loading, error };
}
