/**
 * Feature flags configuration for GdprMate
 *
 * Use these flags to enable or disable features throughout the application.
 * Each flag should have a sensible default value and a descriptive comment.
 */

export const featureFlags = {
  /**
   * When true, enables user registration functionality.
   * Set to false to hide registration UI elements when registration isn't available.
   */
  enableRegistration: false,
};

/**
 * Type definition for all feature flags
 */
export type FeatureFlags = typeof featureFlags;
