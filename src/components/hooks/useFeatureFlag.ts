import { featureFlags, type FeatureFlags } from "../../lib/config/featureFlags";

/**
 * Hook to check if a feature flag is enabled
 * @param flagName The name of the feature flag to check
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag<K extends keyof FeatureFlags>(flagName: K): boolean {
  return featureFlags[flagName];
}

/**
 * Hook to access all feature flags
 * @returns Object containing all feature flags
 */
export function useFeatureFlags(): FeatureFlags {
  return featureFlags;
}
