declare namespace NodeJS {
  interface ProcessEnv {
    /** API Gateway base URL (예: http://192.168.0.12:8080) */
    EXPO_PUBLIC_API_URL?: string;
  }
}
