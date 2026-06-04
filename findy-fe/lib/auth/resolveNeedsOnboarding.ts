import { getUserPreferences } from "@/lib/api/preferences";
import type { UserProfile } from "@/lib/auth/types";

/**
 * Server may leave isFirstLogin true after preferences are saved.
 * If preferences exist, treat onboarding as complete.
 */
export async function resolveNeedsOnboarding(
  profile: UserProfile,
): Promise<boolean> {
  if (!profile.isFirstLogin) {
    return false;
  }

  try {
    const prefs = await getUserPreferences();
    const hasSavedPreferences =
      prefs.categoryIds.length > 0 && prefs.shoppingStyleIds.length > 0;
    return !hasSavedPreferences;
  } catch {
    return true;
  }
}

export function withOnboardingFlag(
  profile: UserProfile,
  needsOnboarding: boolean,
): UserProfile {
  return { ...profile, isFirstLogin: needsOnboarding };
}
