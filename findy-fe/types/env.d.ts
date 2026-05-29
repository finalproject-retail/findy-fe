declare namespace NodeJS {
  interface ProcessEnv {
    /** API Gateway base URL (예: http://192.168.0.12:8080) */
    EXPO_PUBLIC_API_URL?: string;
    /** user-service (회원가입·로그인) */
    EXPO_PUBLIC_USER_API_URL?: string;
    /** shopping-service base URL */
    EXPO_PUBLIC_SHOPPING_API_URL?: string;
    /** recommendation-service base URL */
    EXPO_PUBLIC_RECOMMENDATION_API_URL?: string;
    /** 홈 맞춤 추천 임시 userId */
    EXPO_PUBLIC_DEV_USER_ID?: string;
  }
}
