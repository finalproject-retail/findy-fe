import { createElement, type FormEvent, type ReactNode } from "react";
import { Platform, View, type ViewStyle } from "react-native";

type FormProps = {
  children: ReactNode;
  onSubmit: () => void;
  style?: ViewStyle;
};

/** 웹에서 password 필드 DOM 경고 방지 — native는 View */
export function Form({ children, onSubmit, style }: FormProps) {
  if (Platform.OS === "web") {
    return createElement(
      "form",
      {
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          onSubmit();
        },
        style: { width: "100%" },
      },
      children,
    );
  }

  return <View style={style}>{children}</View>;
}
