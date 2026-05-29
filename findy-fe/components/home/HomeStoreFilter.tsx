import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type HomeStoreFilterOption = {
  id: string;
  label: string;
};

type HomeStoreFilterProps = {
  value: string;
  options: HomeStoreFilterOption[];
  onChange: (storeId: string) => void;
};

export function HomeStoreFilter({ value, options, onChange }: HomeStoreFilterProps) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? options[0],
    [options, value],
  );

  if (!selected || options.length === 0) return null;

  return (
    <View className="px-screen" style={{ paddingTop: SPACING.sm }}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`매장 선택: ${selected.label}`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          paddingVertical: 10,
        }}
      >
        <Ionicons name="chevron-down" size={18} color={COLORS.charcoal} />
        <Text
          style={{
            ...pretendard(600),
            fontSize: TYPOGRAPHY.size.sm,
            color: COLORS.charcoal,
            ...(Platform.OS === "android" && { includeFontPadding: false }),
          }}
        >
          {selected.label}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}
        />

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            paddingBottom: insets.bottom,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: RADIUS.lg,
            borderTopRightRadius: RADIUS.lg,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              paddingHorizontal: SPACING.screen,
              paddingTop: SPACING.lg,
              paddingBottom: SPACING.md,
              borderBottomWidth: 1,
              borderBottomColor: COLORS.lightGray,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ ...pretendard(700), fontSize: TYPOGRAPHY.size.lg, color: COLORS.text }}>
              매장 선택
            </Text>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="닫기"
              hitSlop={10}
            >
              <Ionicons name="close" size={22} color={COLORS.charcoal} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: SPACING.screen,
              paddingVertical: SPACING.md,
            }}
          >
            {options.map((opt) => {
              const active = opt.id === value;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`매장 선택: ${opt.label}`}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: SPACING.md,
                  }}
                >
                  <Text
                    style={{
                      ...pretendard(active ? 700 : 500),
                      fontSize: TYPOGRAPHY.size.md,
                      color: COLORS.text,
                      ...(Platform.OS === "android" && { includeFontPadding: false }),
                    }}
                  >
                    {opt.label}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark" size={22} color={COLORS.main} />
                  ) : (
                    <View style={{ width: 22, height: 22 }} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

