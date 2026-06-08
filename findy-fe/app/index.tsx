import { Redirect, type Href } from "expo-router";

/** 초기 진입 — 로그인 분기는 AuthGuard가 처리 */
export default function Index() {
  return <Redirect href={"/(tabs)" as Href} />;
}
