import type { PropsWithChildren } from "react";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

/** 탭 화면: 하단 safe area는 TabBar에서 처리 */
export const TAB_SCREEN_EDGES: Edge[] = ["top", "left", "right"];

type SafeViewProps = PropsWithChildren<{
  className?: string;
  edges?: Edge[];
}>;

export function SafeView({
  children,
  className,
  edges,
}: SafeViewProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-white ${className ?? ""}`}
    >
      {children}
    </SafeAreaView>
  );
}
