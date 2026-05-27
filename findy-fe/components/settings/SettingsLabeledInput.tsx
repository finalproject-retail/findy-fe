import { Input } from "@/components/common/Input";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type SettingsLabeledInputProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
};

export function SettingsLabeledInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  error,
}: SettingsLabeledInputProps) {
  return (
    <View style={{ gap: SPACING.sm }}>
      <Text className="text-sm text-text-main" style={pretendard(700)}>
        {label}
      </Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        error={error}
      />
    </View>
  );
}
