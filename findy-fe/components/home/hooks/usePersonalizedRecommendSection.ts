import { HOME_SECTION_LIMITS } from "@/components/home/constants";
import { getInStockProducts } from "@/components/home/mockProducts";
import type { Product } from "@/components/product";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthReady } from "@/hooks/useAuthReady";
import { getUserPreferences } from "@/lib/api/preferences";
import { fetchMyProfile } from "@/lib/auth/api/fetchMyProfile";
import { resolvePrimaryShoppingStyleLabel } from "@/lib/onboarding/mapShoppingStyleLabel";
import { buildPersonalizedSectionTitle } from "@/lib/recommendations/buildPersonalizedSectionTitle";
import { fetchPersonalizedRecommendationsInStock } from "@/lib/recommendations/api/fetchPersonalizedRecommendations";
import { useEffect, useState } from "react";

type UsePersonalizedRecommendSectionOptions = {
  storeId: number;
};

async function resolveSectionTitle(): Promise<string> {
  const [profile, preferences] = await Promise.all([
    fetchMyProfile(),
    getUserPreferences(),
  ]);

  const primaryStyle = resolvePrimaryShoppingStyleLabel(
    preferences.shoppingStyleIds,
  );

  return buildPersonalizedSectionTitle(profile.name, primaryStyle);
}

export function usePersonalizedRecommendSection({
  storeId,
}: UsePersonalizedRecommendSectionOptions) {
  const { needsOnboarding } = useAuth();
  const isAuthReady = useAuthReady();
  const limit = HOME_SECTION_LIMITS.onboardingRecommend;

  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState("🔎 맞춤 상품을 골라왔어요");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      setVisible(false);
      setProducts([]);
      setLoading(true);
      return;
    }

    if (needsOnboarding) {
      setVisible(false);
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [sectionTitle, recommendations] = await Promise.all([
          resolveSectionTitle(),
          fetchPersonalizedRecommendationsInStock(limit, storeId),
        ]);

        if (cancelled) {
          return;
        }

        setTitle(sectionTitle);

        if (recommendations.products.length === 0 && __DEV__) {
          setProducts(getInStockProducts().slice(0, limit));
        } else {
          setProducts(recommendations.products);
        }

        setVisible(true);
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (__DEV__) {
          console.warn(
            "[home/personalized] API 실패 → 목 데이터 사용",
            error instanceof Error ? error.message : error,
          );
        }

        try {
          if (!cancelled) {
            setTitle(await resolveSectionTitle());
          }
        } catch {
          if (!cancelled) {
            setTitle("🔎 맞춤 상품을 골라왔어요");
          }
        }

        if (!cancelled) {
          setProducts(__DEV__ ? getInStockProducts().slice(0, limit) : []);
          setVisible(true);
        }
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
  }, [isAuthReady, limit, needsOnboarding, storeId]);

  return { products, title, loading, visible };
}
