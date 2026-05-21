import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  // TODO: auth 팀원 — 로그인 상태·토큰 연동
  const [isLoading] = useState(false);
  // TODO: 임시 — QR 모바일 테스트용 (연동 후 true / 실제 토큰 기준으로 변경)
  const [isLoggedIn] = useState(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
