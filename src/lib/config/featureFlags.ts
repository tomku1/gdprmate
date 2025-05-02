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
  enableRegistration: true,

  /**
   * When true, enables password recovery functionality (e.g., "Forgot Password?" links).
   * Set to false to hide these elements when the feature is not available.
   */
  enablePasswordRecovery: false,
};

/**
 * Type definition for all feature flags
 */
export type FeatureFlags = typeof featureFlags;
