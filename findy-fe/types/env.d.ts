declare namespace NodeJS {
  interface ProcessEnv {
    /** Public API base URL routed by ALB Ingress */
    EXPO_PUBLIC_API_URL?: string;
    /** Optional test user id for recommendations */
    EXPO_PUBLIC_DEV_USER_ID?: string;
    /** Optional session max age in hours */
    EXPO_PUBLIC_SESSION_MAX_AGE_HOURS?: string;
    /** Optional development access token for map API calls */
    EXPO_PUBLIC_DEV_ACCESS_TOKEN?: string;
  }
}
