import type { PropsWithChildren } from "react";
import type { Edge } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";

export interface SafeViewProps extends PropsWithChildren {
  className?: string;
  edges?: readonly Edge[];
}

export function SafeView({ children, className, edges }: SafeViewProps) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-white ${className ?? ""}`}>
      {children}
    </SafeAreaView>
  );
}
