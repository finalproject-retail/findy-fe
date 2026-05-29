import type { OnboardingChipOption } from "@/constants/onboarding";
import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  options: OnboardingChipOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function OnboardingChipGrid({ options, selectedIds, onToggle }: Props) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const selected = selectedIds.includes(option.id);
        return (
          <View key={option.id} style={styles.chipWrap}>
            <TouchableOpacity
              onPress={() => onToggle(option.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ selected }}
              activeOpacity={0.78}
              style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
            >
              <Text style={styles.chipText}>
                {option.label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginRight: -SPACING.sm,
  },
  chipWrap: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chip: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    borderWidth: BORDER.base,
    borderStyle: "solid",
    borderColor: "#FF507C",
  },
  chipUnselected: {
    backgroundColor: COLORS.white,
  },
  chipSelected: {
    backgroundColor: "#FFDCE5",
  },
  chipText: {
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.text,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
