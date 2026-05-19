import type { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type SafeViewProps = PropsWithChildren<{
  className?: string;
}>;

export function SafeView({ children, className }: SafeViewProps) {
  return (
    <SafeAreaView className={`flex-1 bg-white ${className ?? ""}`}>
      {children}
    </SafeAreaView>
  );
}
